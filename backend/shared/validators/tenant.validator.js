const ALLOWED_STATUSES = ['active', 'inactive', 'trial', 'suspended'];

function validateTenantPayload(payload = {}) {
  const errors = [];
  const businessName = typeof payload.businessName === 'string' ? payload.businessName.trim() : '';
  const domain = typeof payload.domain === 'string' ? payload.domain.trim().toLowerCase() : '';
  const status = typeof payload.status === 'string' ? payload.status.trim().toLowerCase() : 'active';

  if (!businessName) {
    errors.push('businessName is required.');
  }

  if (!domain) {
    errors.push('domain is required.');
  }

  if (domain && !/^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(domain)) {
    errors.push('domain must be a valid hostname.');
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    businessName,
    domain,
    status,
  };
}

module.exports = {
  validateTenantPayload,
};
