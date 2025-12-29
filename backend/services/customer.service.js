const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');
const { mapCustomerEntity } = require('../shared/mappers/customer.mapper');
const {
  validateCreateCustomerPayload,
  validateUpdateCustomerPayload,
} = require('../shared/validators/customer.validator');

function buildNotFoundError() {
  const error = new Error('Customer not found.');
  error.statusCode = 404;
  return error;
}

function parseCustomerId(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    const error = new Error('customerId must be numeric.');
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

async function resolveTenantContext({ tenantId, businessName }) {
  const normalizedBusiness =
    typeof businessName === 'string' && businessName.trim() ? businessName.trim() : null;

  const resolvedTenantId = await resolveTenantId({
    tenantId,
    businessName: normalizedBusiness,
  });

  if (normalizedBusiness) {
    return {
      tenantId: resolvedTenantId,
      businessName: normalizedBusiness,
    };
  }

  const pool = await getPool();
  const tenantResult = await pool
    .request()
    .input('TenantId', resolvedTenantId)
    .query('SELECT TOP (1) BusinessName FROM Tenants WHERE TenantId = @TenantId;');

  const tenantRecord = tenantResult.recordset[0];
  if (!tenantRecord || !tenantRecord.BusinessName) {
    const error = new Error('Tenant business name could not be resolved.');
    error.statusCode = 400;
    throw error;
  }

  return {
    tenantId: resolvedTenantId,
    businessName: tenantRecord.BusinessName,
  };
}

async function listCustomers({ tenantId, businessName, search } = {}) {
  const context = await resolveTenantContext({ tenantId, businessName });
  const pool = await getPool();
  const request = pool.request();
  request.input('BusinessName', context.businessName);

  const hasSearch = typeof search === 'string' && search.trim().length > 0;
  if (hasSearch) {
    request.input('SearchTerm', `%${search.trim()}%`);
  }

  const query = `
    SELECT TOP (500)
      CustomerID,
      CustomerName,
      PhoneNumber,
      Address,
      BusinessName,
      CreatedBy,
      CreatedDate,
      UpdatedBy,
      UpdatedDate
    FROM Customers
    WHERE BusinessName = @BusinessName
      ${hasSearch ? 'AND (CustomerName LIKE @SearchTerm OR PhoneNumber LIKE @SearchTerm)' : ''}
    ORDER BY CreatedDate DESC;
  `;

  const result = await request.query(query);
  return result.recordset.map(mapCustomerEntity);
}

async function getCustomer({ customerId, tenantId, businessName }) {
  const parsedCustomerId = parseCustomerId(customerId);
  const context = await resolveTenantContext({ tenantId, businessName });
  const pool = await getPool();

  const result = await pool
    .request()
    .input('CustomerId', parsedCustomerId)
    .input('BusinessName', context.businessName)
    .query(`
      SELECT TOP (1)
        CustomerID,
        CustomerName,
        PhoneNumber,
        Address,
        BusinessName,
        CreatedBy,
        CreatedDate,
        UpdatedBy,
        UpdatedDate
      FROM Customers
      WHERE CustomerID = @CustomerId
        AND BusinessName = @BusinessName;
    `);

  const record = result.recordset[0];
  if (!record) {
    throw buildNotFoundError();
  }

  return mapCustomerEntity(record);
}

async function createCustomer(payload) {
  const data = validateCreateCustomerPayload(payload);
  const context = await resolveTenantContext({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });

  const pool = await getPool();
  const request = pool.request();
  request.input('CustomerName', data.name);
  request.input('PhoneNumber', data.phoneNumber);
  request.input('Address', data.address);
  request.input('BusinessName', context.businessName);
  request.input('CreatedBy', data.createdBy);

  const result = await request.query(`
    DECLARE @Inserted TABLE (
      CustomerID INT,
      CustomerName NVARCHAR(50),
      PhoneNumber NVARCHAR(50),
      Address NVARCHAR(255),
      BusinessName NVARCHAR(150),
      CreatedBy NVARCHAR(100),
      CreatedDate DATETIME2,
      UpdatedBy NVARCHAR(100),
      UpdatedDate DATETIME2
    );

    INSERT INTO Customers (CustomerName, PhoneNumber, Address, BusinessName, CreatedBy, CreatedDate)
    OUTPUT inserted.CustomerID,
           inserted.CustomerName,
           inserted.PhoneNumber,
           inserted.Address,
           inserted.BusinessName,
           inserted.CreatedBy,
           inserted.CreatedDate,
           inserted.UpdatedBy,
           inserted.UpdatedDate
    INTO @Inserted
    VALUES (@CustomerName, @PhoneNumber, @Address, @BusinessName, @CreatedBy, SYSUTCDATETIME());

    SELECT * FROM @Inserted;
  `);

  return mapCustomerEntity(result.recordset[0]);
}

async function updateCustomer(customerId, payload) {
  const parsedCustomerId = parseCustomerId(customerId);
  const data = validateUpdateCustomerPayload(payload);
  const context = await resolveTenantContext({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });

  const pool = await getPool();
  const existingResult = await pool
    .request()
    .input('CustomerId', parsedCustomerId)
    .input('BusinessName', context.businessName)
    .query(`
      SELECT TOP (1)
        CustomerID,
        CustomerName,
        PhoneNumber,
        Address,
        BusinessName,
        CreatedBy,
        CreatedDate,
        UpdatedBy,
        UpdatedDate
      FROM Customers
      WHERE CustomerID = @CustomerId
        AND BusinessName = @BusinessName;
    `);

  const existing = existingResult.recordset[0];
  if (!existing) {
    throw buildNotFoundError();
  }

  const nextValues = {
    name: data.updates.name !== undefined ? data.updates.name : existing.CustomerName,
    phoneNumber:
      data.updates.phoneNumber !== undefined ? data.updates.phoneNumber : existing.PhoneNumber,
    address: data.updates.address !== undefined ? data.updates.address : existing.Address,
  };

  const request = pool.request();
  request.input('CustomerId', parsedCustomerId);
  request.input('BusinessName', context.businessName);
  request.input('CustomerName', nextValues.name);
  request.input('PhoneNumber', nextValues.phoneNumber);
  request.input('Address', nextValues.address);
  request.input('UpdatedBy', data.updatedBy);

  const result = await request.query(`
    UPDATE Customers
    SET CustomerName = @CustomerName,
        PhoneNumber = @PhoneNumber,
        Address = @Address,
        UpdatedBy = @UpdatedBy,
        UpdatedDate = SYSUTCDATETIME()
    WHERE CustomerID = @CustomerId
      AND BusinessName = @BusinessName;

    SELECT TOP (1)
      CustomerID,
      CustomerName,
      PhoneNumber,
      Address,
      BusinessName,
      CreatedBy,
      CreatedDate,
      UpdatedBy,
      UpdatedDate
    FROM Customers
    WHERE CustomerID = @CustomerId
      AND BusinessName = @BusinessName;
  `);

  const record = result.recordset[0];
  if (!record) {
    throw buildNotFoundError();
  }

  return mapCustomerEntity(record);
}

async function deleteCustomer({ customerId, tenantId, businessName }) {
  const parsedCustomerId = parseCustomerId(customerId);
  const context = await resolveTenantContext({ tenantId, businessName });
  const pool = await getPool();

  const result = await pool
    .request()
    .input('CustomerId', parsedCustomerId)
    .input('BusinessName', context.businessName)
    .query(`
      DELETE FROM Customers
      WHERE CustomerID = @CustomerId
        AND BusinessName = @BusinessName;
    `);

  const affected =
    Array.isArray(result.rowsAffected) && result.rowsAffected.length
      ? result.rowsAffected.reduce((sum, value) => sum + value, 0)
      : result.rowsAffected || 0;

  if (!affected) {
    throw buildNotFoundError();
  }

  return true;
}

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
