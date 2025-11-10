const { getPool } = require('./database');

const tenantCache = new Map();

function normalizeBusinessName(name) {
  return name.trim().toLowerCase();
}

async function resolveTenantId({ tenantId, businessName }) {
  if (tenantId) {
    const parsed = Number(tenantId);
    if (Number.isNaN(parsed)) {
      const error = new Error('tenantId must be a number.');
      error.statusCode = 400;
      throw error;
    }
    return parsed;
  }

  if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
    const error = new Error('Tenant context missing. Provide tenantId or businessName.');
    error.statusCode = 400;
    throw error;
  }

  const normalized = normalizeBusinessName(businessName);
  if (tenantCache.has(normalized)) {
    return tenantCache.get(normalized);
  }

  const pool = await getPool();
  const result = await pool
    .request()
    .input('BusinessName', businessName.trim())
    .query('SELECT TenantId FROM Tenants WHERE BusinessName = @BusinessName;');

  const record = result.recordset[0];
  if (!record) {
    const error = new Error(`Tenant not found for businessName: ${businessName}.`);
    error.statusCode = 404;
    throw error;
  }

  tenantCache.set(normalized, record.TenantId);
  return record.TenantId;
}

module.exports = {
  resolveTenantId,
};
