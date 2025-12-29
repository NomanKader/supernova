const path = require('path');
const fs = require('fs/promises');

const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');
const { mapManualEnrollmentRequestEntity } = require('../shared/mappers/enrollment-request.mapper');
const {
  validateCreateManualEnrollmentRequest,
  validateReviewManualEnrollmentRequest,
} = require('../shared/validators/enrollment-request.validator');

const assetsDir = path.join(__dirname, '..', 'assets');
const proofUploadsDir = path.join(assetsDir, 'enrollment-proofs');

async function ensureProofStorage() {
  await fs.mkdir(proofUploadsDir, { recursive: true });
}

function getProofsDirectory() {
  return proofUploadsDir;
}

function normalizeStatusFilter(value) {
  if (!value || typeof value !== 'string') {
    return 'all';
  }
  const lowered = value.toLowerCase();
  if (lowered === 'pending' || lowered === 'approved' || lowered === 'rejected') {
    return lowered;
  }
  return 'all';
}

function buildNotFoundError() {
  const error = new Error('Enrollment request not found.');
  error.statusCode = 404;
  return error;
}

function parseOptionalNumericId(value, label) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    const error = new Error(`${label} must be numeric.`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function normalizeInitialStatus(value) {
  if (!value || typeof value !== 'string') {
    return 'pending';
  }
  const lowered = value.trim().toLowerCase();
  if (lowered === 'approved' || lowered === 'rejected' || lowered === 'pending') {
    return lowered;
  }
  if (lowered === 'approve') {
    return 'approved';
  }
  if (lowered === 'reject') {
    return 'rejected';
  }
  return 'pending';
}

async function createManualEnrollmentRequest(payload, options = {}) {
  const {
    requireProof = true,
    initialStatus = 'pending',
    reviewerId = null,
    reviewerName = null,
    reviewNotes = null,
  } = options;

  const data = validateCreateManualEnrollmentRequest(payload, { requireProof });
  const tenantId = await resolveTenantId({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });
  const normalizedStatus = normalizeInitialStatus(initialStatus);
  const isReviewComplete = normalizedStatus !== 'pending';
  const normalizedReviewerName =
    isReviewComplete && reviewerName ? reviewerName : isReviewComplete ? 'Admin reviewer' : null;
  const normalizedReviewerId = isReviewComplete && reviewerId ? reviewerId : null;
  const normalizedReviewNotes = isReviewComplete ? reviewNotes || null : null;

  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', tenantId);
  request.input('CourseId', data.courseId);
  request.input('CourseTitle', data.courseTitle);
  request.input('CoursePriceCents', data.coursePriceCents);
  request.input('Currency', data.currency);
  request.input('AmountLabel', data.amountLabel);
  request.input('UserId', data.userId);
  request.input('LearnerName', data.learnerName);
  request.input('LearnerEmail', data.learnerEmail);
  request.input('PaymentMethod', data.paymentMethod);
  request.input('TransactionReference', data.transactionReference);
  request.input('Notes', data.notes);
  request.input('ProofUrl', data.proofUrl);
  request.input('ProofFilename', data.proofFilename);
  request.input('Status', normalizedStatus);
  request.input('ReviewerId', normalizedReviewerId);
  request.input('ReviewerName', normalizedReviewerName);
  request.input('ReviewNotes', normalizedReviewNotes);

  const result = await request.query(`
    DECLARE @Inserted TABLE (
      RequestId INT,
      TenantId INT,
      CourseId NVARCHAR(100),
      CourseTitle NVARCHAR(255),
      CoursePriceCents INT,
      Currency NVARCHAR(10),
      AmountLabel NVARCHAR(100),
      UserId INT,
      LearnerName NVARCHAR(150),
      LearnerEmail NVARCHAR(150),
      PaymentMethod NVARCHAR(50),
      TransactionReference NVARCHAR(120),
      Notes NVARCHAR(1000),
      ProofUrl NVARCHAR(255),
      ProofFilename NVARCHAR(255),
      Status NVARCHAR(20),
      ReviewerId INT,
      ReviewerName NVARCHAR(150),
      ReviewNotes NVARCHAR(1000),
      SubmittedAt DATETIMEOFFSET,
      ReviewedAt DATETIMEOFFSET
    );

    INSERT INTO ManualEnrollmentRequests (
      TenantId,
      CourseId,
      CourseTitle,
      CoursePriceCents,
      Currency,
      AmountLabel,
      UserId,
      LearnerName,
      LearnerEmail,
      PaymentMethod,
      TransactionReference,
      Notes,
      ProofUrl,
      ProofFilename,
      Status,
      ReviewerId,
      ReviewerName,
      ReviewNotes,
      ReviewedAt
    )
    OUTPUT inserted.*
    INTO @Inserted
    VALUES (
      @TenantId,
      @CourseId,
      @CourseTitle,
      @CoursePriceCents,
      @Currency,
      @AmountLabel,
      @UserId,
      @LearnerName,
      @LearnerEmail,
      @PaymentMethod,
      @TransactionReference,
      @Notes,
      @ProofUrl,
      @ProofFilename,
      CASE
        WHEN LOWER(@Status) IN ('approved', 'rejected', 'pending') THEN LOWER(@Status)
        ELSE 'pending'
      END,
      CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE @ReviewerId END,
      CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE @ReviewerName END,
      CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE @ReviewNotes END,
      CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE SYSUTCDATETIME() END
    );

    SELECT i.*, t.BusinessName
    FROM @Inserted i
    INNER JOIN Tenants t ON i.TenantId = t.TenantId;
  `);

  return mapManualEnrollmentRequestEntity(result.recordset[0]);
}

async function listManualEnrollmentRequests({
  tenantId,
  businessName,
  status,
  search,
  learnerEmail,
  userId,
} = {}) {
  const resolvedTenantId = await resolveTenantId({ tenantId, businessName });
  const normalizedStatus = normalizeStatusFilter(status);
  const hasSearch = typeof search === 'string' && search.trim().length > 0;
  const normalizedEmail =
    typeof learnerEmail === 'string' && learnerEmail.trim()
      ? learnerEmail.trim().toLowerCase()
      : null;
  const normalizedUserId = parseOptionalNumericId(userId, 'userId');

  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', resolvedTenantId);
  if (normalizedStatus !== 'all') {
    request.input('Status', normalizedStatus);
  }
  if (hasSearch) {
    request.input('SearchTerm', `%${search.trim()}%`);
  }
  if (normalizedEmail) {
    request.input('LearnerEmail', normalizedEmail);
  }
  if (normalizedUserId !== null) {
    request.input('UserId', normalizedUserId);
  }

  const filters = ['TenantId = @TenantId'];
  if (normalizedStatus !== 'all') {
    filters.push('LOWER(Status) = LOWER(@Status)');
  }
  if (hasSearch) {
    filters.push(
      '(LearnerName LIKE @SearchTerm OR LearnerEmail LIKE @SearchTerm OR CourseTitle LIKE @SearchTerm)',
    );
  }
  if (normalizedEmail) {
    filters.push('LOWER(LearnerEmail) = @LearnerEmail');
  }
  if (normalizedUserId !== null) {
    filters.push('UserId = @UserId');
  }

  const query = `
    SELECT
      RequestId,
      TenantId,
      CourseId,
      CourseTitle,
      CoursePriceCents,
      Currency,
      AmountLabel,
      UserId,
      LearnerName,
      LearnerEmail,
      PaymentMethod,
      TransactionReference,
      Notes,
      ProofUrl,
      ProofFilename,
      Status,
      ReviewerId,
      ReviewerName,
      ReviewNotes,
      SubmittedAt,
      ReviewedAt
    FROM ManualEnrollmentRequests
    WHERE ${filters.join(' AND ')}
    ORDER BY SubmittedAt DESC;
  `;

  const recordsResult = await request.query(query);
  const data = recordsResult.recordset.map(mapManualEnrollmentRequestEntity);

  let metricsRow = {};
  const includeTenantMetrics = !normalizedEmail && normalizedUserId === null;
  if (includeTenantMetrics) {
    const metricsResult = await pool
      .request()
      .input('TenantId', resolvedTenantId)
      .query(`
        SELECT
          SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) AS PendingCount,
          SUM(CASE WHEN Status = 'approved' THEN 1 ELSE 0 END) AS ApprovedCount,
          SUM(CASE WHEN Status = 'approved' AND ReviewedAt >= DATEADD(day, -7, SYSUTCDATETIME()) THEN 1 ELSE 0 END) AS ApprovedThisWeek,
          SUM(CASE WHEN ProofUrl IS NOT NULL THEN 1 ELSE 0 END) AS ReceiptsCount,
          COUNT(*) AS TotalCount
        FROM ManualEnrollmentRequests
        WHERE TenantId = @TenantId;
      `);
    metricsRow = metricsResult.recordset[0] || {};
  } else {
    const windowStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const derived = data.reduce(
      (acc, entry) => {
        const statusValue = String(entry.status || '').toLowerCase();
        if (statusValue === 'pending') {
          acc.pendingCount += 1;
        }
        if (statusValue === 'approved') {
          acc.approvedCount += 1;
          if (entry.reviewedAt) {
            const reviewedAt = new Date(entry.reviewedAt);
            if (Number.isFinite(reviewedAt.getTime()) && reviewedAt.getTime() >= windowStart) {
              acc.approvedThisWeek += 1;
            }
          }
        }
        if (entry.proofUrl) {
          acc.receiptsCount += 1;
        }
        return acc;
      },
      { pendingCount: 0, approvedCount: 0, approvedThisWeek: 0, receiptsCount: 0 },
    );

    metricsRow = {
      PendingCount: derived.pendingCount,
      ApprovedCount: derived.approvedCount,
      ApprovedThisWeek: derived.approvedThisWeek,
      ReceiptsCount: derived.receiptsCount,
      TotalCount: data.length,
    };
  }

  const totalCount = Number(metricsRow.TotalCount) || data.length || 0;
  const approvedCount = Number(metricsRow.ApprovedCount) || 0;
  const approvalRate = totalCount ? Math.round((approvedCount / totalCount) * 100) : 0;

  return {
    data,
    meta: {
      pendingCount: Number(metricsRow.PendingCount) || 0,
      approvedThisWeek: Number(metricsRow.ApprovedThisWeek) || 0,
      receiptsCount: Number(metricsRow.ReceiptsCount) || 0,
      approvalRate,
      totalCount,
    },
  };
}

async function reviewManualEnrollmentRequest(requestId, payload) {
  const parsedId = Number(requestId);
  if (Number.isNaN(parsedId)) {
    const error = new Error('requestId must be numeric.');
    error.statusCode = 400;
    throw error;
  }

  const data = validateReviewManualEnrollmentRequest(payload);
  const tenantId = await resolveTenantId({
    tenantId: data.tenantId,
    businessName: data.businessName,
  });

  const pool = await getPool();
  const existingResult = await pool
    .request()
    .input('RequestId', parsedId)
    .input('TenantId', tenantId)
    .query(`
      SELECT TOP (1)
        RequestId,
        Status
      FROM ManualEnrollmentRequests
      WHERE RequestId = @RequestId
        AND TenantId = @TenantId;
    `);

  const existing = existingResult.recordset[0];
  if (!existing) {
    throw buildNotFoundError();
  }

  const request = pool.request();
  request.input('RequestId', parsedId);
  request.input('TenantId', tenantId);
  request.input('Status', data.status);
  request.input('ReviewerId', data.reviewerId);
  request.input('ReviewerName', data.reviewerName);
  request.input('ReviewNotes', data.reviewNotes || null);

  const updateResult = await request.query(`
    UPDATE ManualEnrollmentRequests
    SET
      Status = @Status,
      ReviewerId = CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE @ReviewerId END,
      ReviewerName = CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE @ReviewerName END,
      ReviewNotes = CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE @ReviewNotes END,
      ReviewedAt = CASE WHEN LOWER(@Status) = 'pending' THEN NULL ELSE SYSUTCDATETIME() END
    WHERE RequestId = @RequestId
      AND TenantId = @TenantId;

    SELECT TOP (1)
      RequestId,
      TenantId,
      CourseId,
      CourseTitle,
      CoursePriceCents,
      Currency,
      AmountLabel,
      UserId,
      LearnerName,
      LearnerEmail,
      PaymentMethod,
      TransactionReference,
      Notes,
      ProofUrl,
      ProofFilename,
      Status,
      ReviewerId,
      ReviewerName,
      ReviewNotes,
      SubmittedAt,
      ReviewedAt
    FROM ManualEnrollmentRequests
    WHERE RequestId = @RequestId
      AND TenantId = @TenantId;
  `);

  const record = updateResult.recordset[0];
  if (!record) {
    throw buildNotFoundError();
  }

  return mapManualEnrollmentRequestEntity(record);
}

module.exports = {
  ensureProofStorage,
  getProofsDirectory,
  createManualEnrollmentRequest,
  listManualEnrollmentRequests,
  reviewManualEnrollmentRequest,
};
