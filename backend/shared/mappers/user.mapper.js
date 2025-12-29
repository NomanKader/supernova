function buildDisplayName(firstName, lastName, fallbackEmail) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || fallbackEmail;
}

function mapUserEntity(row) {
  if (!row) return null;

  return {
    id: row.UserId,
    tenantId: row.TenantId,
    businessName: row.BusinessName || null,
    name: buildDisplayName(row.FirstName, row.LastName, row.Email),
    firstName: row.FirstName,
    lastName: row.LastName,
    email: row.Email,
    role: row.Role,
    status: row.Status,
    joinedAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

module.exports = {
  mapUserEntity,
};
