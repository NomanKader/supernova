const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');

function buildError(message, status = 400) {
  const error = new Error(message);
  error.statusCode = status;
  return error;
}

function normalizeCourseId(value) {
  if (value === undefined || value === null) {
    throw buildError('courseId is required.');
  }
  const normalized = String(value).trim();
  if (!normalized) {
    throw buildError('courseId cannot be empty.');
  }
  return normalized;
}

function normalizeLessonId(value) {
  if (value === undefined || value === null) {
    throw buildError('lessonId is required.');
  }
  const normalized = String(value).trim();
  if (!normalized) {
    throw buildError('lessonId cannot be empty.');
  }
  return normalized;
}

function normalizeLessonTitle(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed || null;
}

function normalizeSeconds(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed);
}

function normalizeUserId(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw buildError('userId must be numeric.');
  }
  return parsed;
}

function normalizeEmail(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim().toLowerCase();
  return trimmed || null;
}

function requireIdentity({ userId, learnerEmail }) {
  if (userId === null && !learnerEmail) {
    throw buildError('Either userId or learnerEmail is required.');
  }
}

function mapProgressRow(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.ProgressId,
    courseId: row.CourseId,
    lessonId: row.LessonId,
    lessonTitle: row.LessonTitle,
    userId: row.UserId,
    learnerEmail: row.LearnerEmail,
    playbackSeconds: row.PlaybackSeconds,
    durationSeconds: row.DurationSeconds,
    completedAt: row.CompletedAt,
  };
}

async function listLessonProgress({
  tenantId,
  businessName,
  courseId,
  learnerEmail,
  userId,
} = {}) {
  const normalizedCourseId = normalizeCourseId(courseId);
  const normalizedUserId = normalizeUserId(userId);
  const normalizedEmail = normalizeEmail(learnerEmail);
  requireIdentity({ userId: normalizedUserId, learnerEmail: normalizedEmail });

  const resolvedTenantId = await resolveTenantId({ tenantId, businessName });
  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', resolvedTenantId);
  request.input('CourseId', normalizedCourseId);
  if (normalizedUserId !== null) {
    request.input('UserId', normalizedUserId);
  }
  if (normalizedEmail) {
    request.input('LearnerEmail', normalizedEmail);
  }

  const filters = ['TenantId = @TenantId', 'CourseId = @CourseId'];
  if (normalizedUserId !== null) {
    filters.push('UserId = @UserId');
  } else {
    filters.push('UserId IS NULL');
  }
  if (normalizedEmail) {
    if (normalizedUserId !== null) {
      filters.push('LOWER(LearnerEmail) = LOWER(@LearnerEmail)');
    } else {
      filters.push('LOWER(LearnerEmail) = LOWER(@LearnerEmail)');
    }
  } else if (normalizedUserId === null) {
    filters.push('LearnerEmail IS NULL');
  }

  const query = `
    SELECT
      ProgressId,
      CourseId,
      LessonId,
      LessonTitle,
      UserId,
      LearnerEmail,
      PlaybackSeconds,
      DurationSeconds,
      CompletedAt
    FROM LessonProgress
    WHERE ${filters.join(' AND ')}
    ORDER BY CompletedAt DESC;
  `;

  const result = await request.query(query);
  return result.recordset.map(mapProgressRow);
}

async function markLessonComplete(payload = {}) {
  const normalizedCourseId = normalizeCourseId(payload.courseId);
  const normalizedLessonId = normalizeLessonId(payload.lessonId);
  const normalizedLessonTitle = normalizeLessonTitle(payload.lessonTitle);
  const normalizedUserId = normalizeUserId(payload.userId);
  const normalizedEmail = normalizeEmail(payload.learnerEmail);
  requireIdentity({ userId: normalizedUserId, learnerEmail: normalizedEmail });

  const playbackSeconds = normalizeSeconds(payload.playbackSeconds);
  const durationSeconds = normalizeSeconds(payload.durationSeconds);

  const tenantId = await resolveTenantId({
    tenantId: payload.tenantId,
    businessName: payload.businessName,
  });

  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', tenantId);
  request.input('CourseId', normalizedCourseId);
  request.input('LessonId', normalizedLessonId);
  request.input('LessonTitle', normalizedLessonTitle);
  request.input('UserId', normalizedUserId);
  request.input('LearnerEmail', normalizedEmail);
  request.input('PlaybackSeconds', playbackSeconds);
  request.input('DurationSeconds', durationSeconds);

  const userMatchClause = normalizedUserId !== null ? 'target.UserId = @UserId' : 'target.UserId IS NULL';
  const emailMatchClause =
    normalizedUserId !== null
      ? '1 = 1'
      : normalizedEmail
      ? "LOWER(ISNULL(target.LearnerEmail, '')) = LOWER(ISNULL(@LearnerEmail, ''))"
      : 'target.LearnerEmail IS NULL';

  const result = await request.query(`
    MERGE LessonProgress AS target
    USING (SELECT 1 AS SourceRow) AS source
      ON target.TenantId = @TenantId
     AND target.CourseId = @CourseId
     AND target.LessonId = @LessonId
     AND ${userMatchClause}
     AND ${emailMatchClause}
    WHEN MATCHED THEN
      UPDATE SET
        LessonTitle = COALESCE(@LessonTitle, target.LessonTitle),
        PlaybackSeconds = COALESCE(@PlaybackSeconds, target.PlaybackSeconds),
        DurationSeconds = COALESCE(@DurationSeconds, target.DurationSeconds),
        CompletedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
      INSERT (
        TenantId,
        CourseId,
        LessonId,
        LessonTitle,
        UserId,
        LearnerEmail,
        PlaybackSeconds,
        DurationSeconds,
        CompletedAt
      )
      VALUES (
        @TenantId,
        @CourseId,
        @LessonId,
        @LessonTitle,
        @UserId,
        @LearnerEmail,
        @PlaybackSeconds,
        @DurationSeconds,
        SYSUTCDATETIME()
      )
    OUTPUT inserted.*;
  `);

  const row = result.recordset[0];
  return mapProgressRow(row);
}

module.exports = {
  listLessonProgress,
  markLessonComplete,
};
