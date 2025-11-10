const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');
const { mapUserEntity } = require('../shared/mappers/user.mapper');
const { validateCreateUserPayload } = require('../shared/validators/user.validator');
const inviteService = require('./invite.service');

async function listUsers({ tenantId, businessName }) {
  const resolvedTenantId = await resolveTenantId({ tenantId, businessName });
  const pool = await getPool();

  const result = await pool
    .request()
    .input('TenantId', resolvedTenantId)
    .query(`
      SELECT TOP (200)
        u.UserId,
        u.TenantId,
        t.BusinessName,
        u.Email,
        u.FirstName,
        u.LastName,
        u.Role,
        u.Status,
        u.CreatedAt,
        u.UpdatedAt
      FROM Users u
      INNER JOIN Tenants t ON u.TenantId = t.TenantId
      WHERE u.TenantId = @TenantId
      ORDER BY u.CreatedAt DESC;
    `);

  return result.recordset.map(mapUserEntity);
}

async function createUser(payload) {
  const data = validateCreateUserPayload(payload);
  const resolvedTenantId = await resolveTenantId({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });

  const pool = await getPool();

  const request = pool.request();
  request.input('TenantId', resolvedTenantId);
  request.input('Email', data.email);
  request.input('FirstName', data.firstName);
  request.input('LastName', data.lastName);
  request.input('Role', data.role);
  request.input('Status', data.status);

  const insertResult = await request.query(`
    DECLARE @Inserted TABLE (
      UserId INT,
      TenantId INT,
      Email NVARCHAR(150),
      FirstName NVARCHAR(100),
      LastName NVARCHAR(100),
      Role NVARCHAR(50),
      Status NVARCHAR(20),
      CreatedAt DATETIMEOFFSET,
      UpdatedAt DATETIMEOFFSET
    );

    INSERT INTO Users (TenantId, Email, FirstName, LastName, Role, Status)
    OUTPUT inserted.UserId,
           inserted.TenantId,
           inserted.Email,
           inserted.FirstName,
           inserted.LastName,
           inserted.Role,
           inserted.Status,
           inserted.CreatedAt,
           inserted.UpdatedAt
    INTO @Inserted
    VALUES (@TenantId, @Email, @FirstName, @LastName, @Role, @Status);

    SELECT i.*, t.BusinessName
    FROM @Inserted i
    INNER JOIN Tenants t ON i.TenantId = t.TenantId;
  `);

  const createdUser = mapUserEntity(insertResult.recordset[0]);

  let invitation = null;
  if (data.sendInvite) {
    invitation = await inviteService.createInvite({
      tenantId: resolvedTenantId,
      user: createdUser,
      sendEmail: true,
    });
  }

  return {
    ...createdUser,
    sendInvite: data.sendInvite,
    invitation,
  };
}

async function deleteUser({ userId, tenantId, businessName }) {
  const resolvedTenantId = await resolveTenantId({ tenantId, businessName });
  const parsedUserId = Number(userId);

  if (Number.isNaN(parsedUserId)) {
    const error = new Error('userId must be numeric.');
    error.statusCode = 400;
    throw error;
  }

  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', resolvedTenantId);
  request.input('UserId', parsedUserId);

  const deleteResult = await request.query(`
    DELETE FROM UserInvites
    WHERE UserId = @UserId;

    DELETE FROM Users
    WHERE UserId = @UserId AND TenantId = @TenantId;
  `);

  const affected =
    Array.isArray(deleteResult.rowsAffected) && deleteResult.rowsAffected.length
      ? deleteResult.rowsAffected[deleteResult.rowsAffected.length - 1]
      : 0;

  if (affected === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return true;
}

module.exports = {
  listUsers,
  createUser,
  deleteUser,
};
