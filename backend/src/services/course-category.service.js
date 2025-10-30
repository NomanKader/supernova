const sql = require('mssql');

const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');
const {
  validateCreateCategoryPayload,
  validateUpdateCategoryPayload,
} = require('../shared/validators/course-category.validator');
const { mapCourseCategoryEntity } = require('../shared/mappers/course-category.mapper');

function buildUniqueConstraintError() {
  const error = new Error('Category name or slug already exists for this workspace.');
  error.statusCode = 409;
  return error;
}

function isUniqueConstraintError(error) {
  return error && (error.number === 2601 || error.number === 2627);
}

function buildNotFoundError() {
  const error = new Error('Category not found.');
  error.statusCode = 404;
  return error;
}

async function listCategories({ tenantId, businessName }) {
  const resolvedTenantId = await resolveTenantId({ tenantId, businessName });
  const pool = await getPool();

  const result = await pool
    .request()
    .input('TenantId', resolvedTenantId)
    .query(`
      SELECT
        c.CategoryId,
        c.TenantId,
        c.Name,
        c.Slug,
        c.Description,
        c.Icon,
        c.Color,
        c.DisplayOrder,
        c.CreatedAt,
        c.UpdatedAt,
        ISNULL(courseCounts.CourseCount, 0) AS CourseCount
      FROM CourseCategories c
      OUTER APPLY (
        SELECT COUNT(*) AS CourseCount
        FROM Courses course
        WHERE course.TenantId = c.TenantId
          AND course.CategoryId = c.CategoryId
      ) courseCounts
      WHERE c.TenantId = @TenantId
      ORDER BY c.DisplayOrder ASC, c.Name ASC;
    `);

  return result.recordset.map(mapCourseCategoryEntity);
}

async function createCategory(payload) {
  const data = validateCreateCategoryPayload(payload);
  const resolvedTenantId = await resolveTenantId({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });

  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', resolvedTenantId);
  request.input('Name', data.name);
  request.input('Slug', data.slug);
  request.input('Description', data.description);
  request.input('Icon', data.icon);
  request.input('Color', data.color);
  request.input(
    'DisplayOrder',
    data.displayOrder !== null && data.displayOrder !== undefined ? data.displayOrder : 0,
  );

  try {
    const result = await request.query(`
      DECLARE @Inserted TABLE (
        CategoryId INT,
        TenantId INT,
        Name NVARCHAR(150),
        Slug NVARCHAR(150),
        Description NVARCHAR(600),
        Icon NVARCHAR(100),
        Color NVARCHAR(30),
        DisplayOrder INT,
        CreatedAt DATETIMEOFFSET,
        UpdatedAt DATETIMEOFFSET
      );

      INSERT INTO CourseCategories (TenantId, Name, Slug, Description, Icon, Color, DisplayOrder)
      OUTPUT inserted.CategoryId,
             inserted.TenantId,
             inserted.Name,
             inserted.Slug,
             inserted.Description,
             inserted.Icon,
             inserted.Color,
             inserted.DisplayOrder,
             inserted.CreatedAt,
             inserted.UpdatedAt
      INTO @Inserted
      VALUES (@TenantId, @Name, @Slug, @Description, @Icon, @Color, @DisplayOrder);

      SELECT i.*, 0 AS CourseCount FROM @Inserted i;
    `);

    return mapCourseCategoryEntity(result.recordset[0]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw buildUniqueConstraintError();
    }

    throw error;
  }
}

async function updateCategory(categoryId, payload) {
  const parsedCategoryId = Number(categoryId);
  if (Number.isNaN(parsedCategoryId)) {
    const error = new Error('categoryId must be numeric.');
    error.statusCode = 400;
    throw error;
  }

  const data = validateUpdateCategoryPayload(payload);
  const resolvedTenantId = await resolveTenantId({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });

  const pool = await getPool();

  const fetchResult = await pool
    .request()
    .input('CategoryId', parsedCategoryId)
    .input('TenantId', resolvedTenantId)
    .query(`
      SELECT TOP (1)
        CategoryId,
        TenantId,
        Name,
        Slug,
        Description,
        Icon,
        Color,
        DisplayOrder,
        CreatedAt,
        UpdatedAt
      FROM CourseCategories
      WHERE CategoryId = @CategoryId AND TenantId = @TenantId;
    `);

  const existing = fetchResult.recordset[0];
  if (!existing) {
    throw buildNotFoundError();
  }

  const nextValues = {
    name: data.updates.name !== undefined ? data.updates.name : existing.Name,
    slug: data.updates.slug !== undefined ? data.updates.slug : existing.Slug,
    description:
      data.updates.description !== undefined ? data.updates.description : existing.Description,
    icon: data.updates.icon !== undefined ? data.updates.icon : existing.Icon,
    color: data.updates.color !== undefined ? data.updates.color : existing.Color,
    displayOrder:
      data.updates.displayOrder !== undefined
        ? data.updates.displayOrder
        : existing.DisplayOrder ?? 0,
  };

  const request = pool.request();
  request.input('CategoryId', parsedCategoryId);
  request.input('TenantId', resolvedTenantId);
  request.input('Name', nextValues.name);
  request.input('Slug', nextValues.slug);
  request.input('Description', nextValues.description);
  request.input('Icon', nextValues.icon);
  request.input('Color', nextValues.color);
  request.input('DisplayOrder', nextValues.displayOrder);

  try {
    const result = await request.query(`
      UPDATE CourseCategories
      SET Name = @Name,
          Slug = @Slug,
          Description = @Description,
          Icon = @Icon,
          Color = @Color,
          DisplayOrder = @DisplayOrder,
          UpdatedAt = SYSDATETIMEOFFSET()
      WHERE CategoryId = @CategoryId
        AND TenantId = @TenantId;

      SELECT
        c.CategoryId,
        c.TenantId,
        c.Name,
        c.Slug,
        c.Description,
        c.Icon,
        c.Color,
        c.DisplayOrder,
        c.CreatedAt,
        c.UpdatedAt,
        ISNULL(courseCounts.CourseCount, 0) AS CourseCount
      FROM CourseCategories c
      OUTER APPLY (
        SELECT COUNT(*) AS CourseCount
        FROM Courses course
        WHERE course.TenantId = c.TenantId
          AND course.CategoryId = c.CategoryId
      ) courseCounts
      WHERE c.CategoryId = @CategoryId
        AND c.TenantId = @TenantId;
    `);

    return mapCourseCategoryEntity(result.recordset[0]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw buildUniqueConstraintError();
    }

    throw error;
  }
}

async function deleteCategory({ categoryId, tenantId, businessName }) {
  const parsedCategoryId = Number(categoryId);
  if (Number.isNaN(parsedCategoryId)) {
    const error = new Error('categoryId must be numeric.');
    error.statusCode = 400;
    throw error;
  }

  const resolvedTenantId = await resolveTenantId({ tenantId, businessName });
  const pool = await getPool();

  const usageResult = await pool
    .request()
    .input('CategoryId', parsedCategoryId)
    .input('TenantId', resolvedTenantId)
    .query(`
      SELECT COUNT(*) AS UsageCount
      FROM Courses
      WHERE TenantId = @TenantId
        AND CategoryId = @CategoryId;
    `);

  const usage = usageResult.recordset[0];
  if (usage && usage.UsageCount > 0) {
    const error = new Error('Cannot delete category while courses are assigned to it.');
    error.statusCode = 409;
    throw error;
  }

  const deleteResult = await pool
    .request()
    .input('CategoryId', parsedCategoryId)
    .input('TenantId', resolvedTenantId)
    .query(`
      DELETE FROM CourseCategories
      WHERE CategoryId = @CategoryId
        AND TenantId = @TenantId;
    `);

  const affected = Array.isArray(deleteResult.rowsAffected)
    ? deleteResult.rowsAffected.reduce((sum, value) => sum + value, 0)
    : deleteResult.rowsAffected || 0;

  if (!affected) {
    throw buildNotFoundError();
  }

  return true;
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
