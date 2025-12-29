const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeOptionalString(value, { maxLength } = {}) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (maxLength && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

function parseDisplayOrder(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error('displayOrder must be numeric.');
  }

  return parsed;
}

function extractTenantContext(payload = {}) {
  const tenantIdRaw =
    payload.tenantId !== undefined && payload.tenantId !== null && payload.tenantId !== ''
      ? Number(payload.tenantId)
      : null;

  if (tenantIdRaw !== null && Number.isNaN(tenantIdRaw)) {
    const error = new Error('tenantId must be numeric when provided.');
    error.statusCode = 400;
    throw error;
  }

  const businessName =
    typeof payload.businessName === 'string' && payload.businessName.trim()
      ? payload.businessName.trim()
      : null;

  if (tenantIdRaw === null && businessName === null) {
    const error = new Error('Provide either businessName or tenantId to target a tenant.');
    error.statusCode = 400;
    throw error;
  }

  return { tenantId: tenantIdRaw, businessName };
}

function validateCreateCategoryPayload(payload = {}) {
  const errors = [];

  const name =
    typeof payload.name === 'string' && payload.name.trim().length >= 2
      ? payload.name.trim()
      : null;

  if (!name) {
    errors.push('name is required and must be at least 2 characters.');
  }

  let slug =
    typeof payload.slug === 'string' && payload.slug.trim()
      ? slugify(payload.slug)
      : name
      ? slugify(name)
      : '';

  if (!slug || !SLUG_REGEX.test(slug)) {
    errors.push('slug must contain only lowercase letters, numbers and hyphens.');
  }

  let displayOrder = null;
  try {
    displayOrder = parseDisplayOrder(payload.displayOrder);
  } catch (error) {
    errors.push(error.message);
  }

  const description = normalizeOptionalString(payload.description, { maxLength: 600 });
  const icon = normalizeOptionalString(payload.icon, { maxLength: 100 });
  const color = normalizeOptionalString(payload.color, { maxLength: 30 });

  const context = extractTenantContext(payload);

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    ...context,
    name,
    slug,
    description,
    icon,
    color,
    displayOrder,
  };
}

function validateUpdateCategoryPayload(payload = {}) {
  const updates = {};
  const errors = [];

  if (payload.name !== undefined) {
    const name =
      typeof payload.name === 'string' && payload.name.trim().length >= 2
        ? payload.name.trim()
        : null;

    if (!name) {
      errors.push('name must be at least 2 characters when provided.');
    } else {
      updates.name = name;
    }
  }

  if (payload.slug !== undefined) {
    const slug = typeof payload.slug === 'string' ? slugify(payload.slug) : '';
    if (!slug || !SLUG_REGEX.test(slug)) {
      errors.push('slug must contain only lowercase letters, numbers and hyphens.');
    } else {
      updates.slug = slug;
    }
  }

  if (payload.description !== undefined) {
    updates.description = normalizeOptionalString(payload.description, { maxLength: 600 });
  }

  if (payload.icon !== undefined) {
    updates.icon = normalizeOptionalString(payload.icon, { maxLength: 100 });
  }

  if (payload.color !== undefined) {
    updates.color = normalizeOptionalString(payload.color, { maxLength: 30 });
  }

  if (payload.displayOrder !== undefined) {
    try {
      const parsed = parseDisplayOrder(payload.displayOrder);
      updates.displayOrder = parsed;
    } catch (error) {
      errors.push(error.message);
    }
  }

  const context = extractTenantContext(payload);

  if (!Object.keys(updates).length) {
    errors.push('Provide at least one field to update.');
  }

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    ...context,
    updates,
  };
}

module.exports = {
  validateCreateCategoryPayload,
  validateUpdateCategoryPayload,
};
