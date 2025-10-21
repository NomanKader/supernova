function mapTenantEntity(row) {
  if (!row) return null;

  return {
    id: row.TenantId,
    businessName: row.BusinessName,
    domain: row.Domain,
    status: row.Status,
    createdAt: row.CreatedAt,
  };
}

module.exports = {
  mapTenantEntity,
};
