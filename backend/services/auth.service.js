const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');
const { loadConfig } = require('../shared/env');
const { mapUserEntity } = require('../shared/mappers/user.mapper');

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function findUserRecord({ email, tenantId, businessName, restrictRole }) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw buildError('Email is required.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const config = loadConfig();

  let resolvedTenantId = null;
  let filterByTenant = true;

  try {
    resolvedTenantId = await resolveTenantId({
      tenantId,
      businessName: businessName || config.defaultBusinessName,
    });
  } catch (err) {
    if (err.statusCode === 400 || err.statusCode === 404) {
      filterByTenant = false;
    } else {
      throw err;
    }
  }

  const pool = await getPool();
  const request = pool.request();
  request.input('EmailNormalized', normalizedEmail);
  if (filterByTenant && resolvedTenantId !== null) {
    request.input('TenantId', resolvedTenantId);
  }

  const result = await request.query(`
    SELECT TOP (1)
      u.UserId,
      u.TenantId,
      t.BusinessName,
      u.Email,
      u.FirstName,
      u.LastName,
      u.Role,
      u.Status,
      u.PasswordHash,
      u.CreatedAt,
      u.UpdatedAt
    FROM Users u
    INNER JOIN Tenants t ON u.TenantId = t.TenantId
    WHERE LOWER(u.Email) = @EmailNormalized
      ${filterByTenant && resolvedTenantId !== null ? 'AND u.TenantId = @TenantId' : ''}
    ORDER BY u.CreatedAt DESC;
  `);

  const record = result.recordset[0];
  if (!record) {
    throw buildError('Invalid email or password.', 401);
  }

  const role = String(record.Role || '').toLowerCase();
  if (restrictRole === 'admin' && role !== 'admin') {
    throw buildError('Access restricted to admin users.', 403);
  }

  return record;
}

async function authenticateAdmin({ email, password, tenantId, businessName }) {
  if (!password || typeof password !== 'string' || !password.trim()) {
    throw buildError('Password is required.', 400);
  }

  const record = await findUserRecord({ email, tenantId, businessName, restrictRole: 'admin' });

  if (!record.PasswordHash) {
    throw buildError('Account password is not set. Complete verification first.', 403);
  }

  const passwordMatches = await bcrypt.compare(password, record.PasswordHash);
  if (!passwordMatches) {
    throw buildError('Invalid email or password.', 401);
  }

  const status = String(record.Status || '').toLowerCase();
  if (status && status !== 'active') {
    throw buildError('Account is not active.', 403);
  }

  const sessionToken = crypto.randomBytes(24).toString('hex');

  return {
    token: sessionToken,
    user: mapUserEntity(record),
  };
}

async function authenticateUser({ email, password, tenantId, businessName }) {
  if (!password || typeof password !== 'string' || !password.trim()) {
    throw buildError('Password is required.', 400);
  }

  const record = await findUserRecord({ email, tenantId, businessName });

  if (!record.PasswordHash) {
    throw buildError('Account password is not set. Complete verification first.', 403);
  }

  const passwordMatches = await bcrypt.compare(password, record.PasswordHash);
  if (!passwordMatches) {
    throw buildError('Invalid email or password.', 401);
  }

  const status = String(record.Status || '').toLowerCase();
  if (status && status !== 'active') {
    throw buildError('Account is not active.', 403);
  }

  const sessionToken = crypto.randomBytes(24).toString('hex');

  return {
    token: sessionToken,
    user: mapUserEntity(record),
  };
}

module.exports = {
  authenticateAdmin,
  authenticateUser,
};
