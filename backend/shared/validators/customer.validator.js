const DEFAULT_ACTOR = 'System';

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeActor(value) {
  return normalizeString(value) || DEFAULT_ACTOR;
}

function normalizePhoneNumber(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const condensed = value.replace(/\s+/g, ' ').trim();
  return condensed.length ? condensed : null;
}

function countDigits(value) {
  return value ? value.replace(/\D/g, '').length : 0;
}

function validateContext(payload, errors) {
  const businessName = normalizeString(payload.businessName);

  let tenantId = null;
  if (payload.tenantId !== undefined && payload.tenantId !== null && payload.tenantId !== '') {
    tenantId = Number(payload.tenantId);
    if (Number.isNaN(tenantId)) {
      errors.push('tenantId must be numeric when provided.');
    }
  }

  if (!businessName && tenantId === null) {
    errors.push('Provide either businessName or tenantId to target the workspace.');
  }

  return { businessName, tenantId };
}

function validateCreateCustomerPayload(payload = {}) {
  const errors = [];

  const name = normalizeString(payload.name);
  if (!name || name.length < 2) {
    errors.push('Customer name is required.');
  }

  const phoneNumberRaw = normalizePhoneNumber(payload.phoneNumber);
  if (!phoneNumberRaw) {
    errors.push('Phone number is required.');
  } else {
    const digits = countDigits(phoneNumberRaw);
    if (digits < 6 || digits > 20) {
      errors.push('Phone number must include between 6 and 20 digits.');
    }
  }

  const address = normalizeString(payload.address);
  if (!address || address.length < 5) {
    errors.push('Address is required.');
  }

  const { businessName, tenantId } = validateContext(payload, errors);
  const createdBy = normalizeActor(payload.createdBy);

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    name,
    phoneNumber: phoneNumberRaw,
    address,
    businessName,
    tenantId,
    createdBy,
  };
}

function validateUpdateCustomerPayload(payload = {}) {
  const errors = [];
  const updates = {};

  if (payload.name !== undefined) {
    const name = normalizeString(payload.name);
    if (!name || name.length < 2) {
      errors.push('Customer name must be at least 2 characters.');
    } else {
      updates.name = name;
    }
  }

  if (payload.phoneNumber !== undefined) {
    const phoneNumberRaw = normalizePhoneNumber(payload.phoneNumber);
    if (!phoneNumberRaw) {
      errors.push('Phone number cannot be empty.');
    } else {
      const digits = countDigits(phoneNumberRaw);
      if (digits < 6 || digits > 20) {
        errors.push('Phone number must include between 6 and 20 digits.');
      } else {
        updates.phoneNumber = phoneNumberRaw;
      }
    }
  }

  if (payload.address !== undefined) {
    const address = normalizeString(payload.address);
    if (!address || address.length < 5) {
      errors.push('Address must be at least 5 characters.');
    } else {
      updates.address = address;
    }
  }

  if (!Object.keys(updates).length) {
    errors.push('Provide at least one field to update.');
  }

  const { businessName, tenantId } = validateContext(payload, errors);
  const updatedBy = normalizeActor(payload.updatedBy);

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    businessName,
    tenantId,
    updates,
    updatedBy,
  };
}

module.exports = {
  validateCreateCustomerPayload,
  validateUpdateCustomerPayload,
};
