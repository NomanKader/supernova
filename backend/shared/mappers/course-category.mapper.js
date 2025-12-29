function mapCourseCategoryEntity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.CategoryId,
    tenantId: row.TenantId,
    name: row.Name,
    slug: row.Slug,
    description: row.Description,
    icon: row.Icon,
    color: row.Color,
    displayOrder: row.DisplayOrder,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
    courseCount:
      row.CourseCount !== undefined && row.CourseCount !== null ? Number(row.CourseCount) : 0,
  };
}

module.exports = {
  mapCourseCategoryEntity,
};
