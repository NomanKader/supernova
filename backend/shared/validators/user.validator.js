const ALLOWED_ROLES = ['student', 'instructor', 'admin'];
const DEFAULT_STATUS = 'invited';
const ACTIVE_STATUS = 'active';

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function splitName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' '),
  };
}

function validateCreateUserPayload(payload = {}) {
  const errors = [];

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name || name.length < 2) {
    errors.push('name is required.');
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email || !isValidEmail(email)) {
    errors.push('A valid email is required.');
  }

  const roleRaw = typeof payload.role === 'string' ? payload.role.trim().toLowerCase() : '';
  const role = ALLOWED_ROLES.includes(roleRaw) ? roleRaw : null;
  if (!role) {
    errors.push(`role must be one of: ${ALLOWED_ROLES.join(', ')}`);
  }

  const businessName =
    typeof payload.businessName === 'string' && payload.businessName.trim()
      ? payload.businessName.trim()
      : null;

  const tenantId =
    payload.tenantId !== undefined && payload.tenantId !== null && payload.tenantId !== ''
      ? Number(payload.tenantId)
      : null;

  if (tenantId !== null && Number.isNaN(tenantId)) {
    errors.push('tenantId must be numeric when provided.');
  }

  if (businessName === null && tenantId === null) {
    errors.push('Provide either businessName or tenantId to target a tenant.');
  }

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  const { firstName, lastName } = splitName(name);
  const sendInvite = Boolean(payload.sendInvite);

  const normalizedStatus =
    typeof payload.status === 'string' && payload.status.trim()
      ? payload.status.trim().toLowerCase()
      : sendInvite
        ? DEFAULT_STATUS
        : ACTIVE_STATUS;

  return {
    firstName,
    lastName,
    email,
    role,
    businessName,
    tenantId,
    status: normalizedStatus,
    sendInvite,
  };
}

module.exports = {
  validateCreateUserPayload,
};
