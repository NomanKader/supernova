const { getPool } = require('../shared/database');
const { mapTenantEntity } = require('../shared/mappers/tenant.mapper');
const { validateTenantPayload } = require('../shared/validators/tenant.validator');

async function listTenants() {
  const pool = await getPool();
  const result = await pool
    .request()
    .query('SELECT TOP (100) TenantId, BusinessName, Domain, Status, CreatedAt FROM Tenants ORDER BY CreatedAt DESC');

  return result.recordset.map(mapTenantEntity);
}

async function createTenant(payload) {
  const data = validateTenantPayload(payload);
  const pool = await getPool();

  const query = `
    INSERT INTO Tenants (BusinessName, Domain, Status)
    OUTPUT INSERTED.TenantId, INSERTED.BusinessName, INSERTED.Domain, INSERTED.Status, INSERTED.CreatedAt
    VALUES (@BusinessName, @Domain, @Status);
  `;

  const request = pool.request();
  request.input('BusinessName', data.businessName);
  request.input('Domain', data.domain);
  request.input('Status', data.status);

  const result = await request.query(query);

  return mapTenantEntity(result.recordset[0]);
}

module.exports = {
  listTenants,
  createTenant,
};
