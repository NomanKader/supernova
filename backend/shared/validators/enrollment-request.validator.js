const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeEmail(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }
  return EMAIL_REGEX.test(normalized) ? normalized : null;
}

function normalizeContext(payload, errors) {
  const businessName = normalizeString(payload.businessName);
  let tenantId = null;

  if (payload.tenantId !== undefined && payload.tenantId !== null && payload.tenantId !== '') {
    const parsed = Number(payload.tenantId);
    if (Number.isNaN(parsed)) {
      errors.push('tenantId must be numeric when provided.');
    } else {
      tenantId = parsed;
    }
  }

  if (!businessName && tenantId === null) {
    errors.push('Provide either businessName or tenantId to target the workspace.');
  }

  return { businessName, tenantId };
}

function normalizePaymentMethod(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }
  const lowered = normalized.toLowerCase();
  if (lowered === 'wave' || lowered === 'kpay') {
    return lowered;
  }
  return normalized;
}

function normalizePriceCents(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed * 100);
}

function normalizeCurrency(value) {
  const normalized = normalizeString(value);
  return normalized ? normalized.toUpperCase() : null;
}

function buildAmountLabel(currency, priceCents) {
  if (typeof priceCents !== 'number') {
    return null;
  }
  const amount = priceCents / 100;
  const formatted = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return currency ? `${currency} ${formatted}` : formatted;
}

function normalizeUserId(value, errors) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    errors.push('userId must be numeric when provided.');
    return null;
  }

  return parsed;
}

function validateCreateManualEnrollmentRequest(payload = {}) {
  const errors = [];
  const { businessName, tenantId } = normalizeContext(payload, errors);

  const courseId = normalizeString(payload.courseId);
  if (!courseId) {
    errors.push('courseId is required.');
  }

  const courseTitle = normalizeString(payload.courseTitle) || 'Untitled course';
  const coursePriceCents = normalizePriceCents(payload.coursePrice ?? payload.coursePriceCents);
  const currency = normalizeCurrency(payload.currency);
  let amountLabel = normalizeString(payload.amountLabel);
  if (!amountLabel && coursePriceCents !== null) {
    amountLabel = buildAmountLabel(currency, coursePriceCents);
  }

  const learnerName = normalizeString(payload.learnerName) || 'Learner';
  const learnerEmail = normalizeEmail(payload.learnerEmail);
  if (!learnerEmail) {
    errors.push('Provide a valid learnerEmail.');
  }

  const paymentMethod = normalizePaymentMethod(payload.paymentMethod);
  if (!paymentMethod) {
    errors.push('paymentMethod is required.');
  }

  const transactionReference = normalizeString(payload.transactionReference);
  if (!transactionReference) {
    errors.push('transactionReference is required.');
  }

  const notes = normalizeString(payload.notes);
  const proofUrl = normalizeString(payload.proofUrl);
  const proofFilename = normalizeString(payload.proofFilename);

  if (!proofUrl || !proofFilename) {
    errors.push('Payment screenshot upload is required.');
  }

  const userId = normalizeUserId(payload.userId, errors);

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    businessName,
    tenantId,
    courseId,
    courseTitle,
    coursePriceCents,
    currency,
    amountLabel,
    learnerName,
    learnerEmail,
    paymentMethod,
    transactionReference,
    notes,
    proofUrl,
    proofFilename,
    userId,
  };
}

function normalizeDecision(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }
  const lowered = normalized.toLowerCase();
  if (lowered === 'approved' || lowered === 'rejected' || lowered === 'pending') {
    return lowered;
  }
  if (lowered === 'approve') {
    return 'approved';
  }
  if (lowered === 'reject') {
    return 'rejected';
  }
  return null;
}

function validateReviewManualEnrollmentRequest(payload = {}) {
  const errors = [];
  const { businessName, tenantId } = normalizeContext(payload, errors);
  const status = normalizeDecision(payload.status ?? payload.decision);

  if (!status) {
    errors.push('Specify a decision of approved, rejected, or pending.');
  }

  const reviewerName = normalizeString(payload.reviewerName) || 'Admin reviewer';
  const reviewerId = normalizeUserId(payload.reviewerId, errors);
  const reviewNotes = normalizeString(payload.reviewNotes);

  if (status === 'rejected' && !reviewNotes) {
    errors.push('Provide reviewNotes when rejecting a submission.');
  }

  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return {
    businessName,
    tenantId,
    status,
    reviewerName,
    reviewerId,
    reviewNotes,
  };
}

module.exports = {
  validateCreateManualEnrollmentRequest,
  validateReviewManualEnrollmentRequest,
};
