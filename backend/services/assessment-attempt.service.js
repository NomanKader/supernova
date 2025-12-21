const { getPool } = require('../shared/database');
const { resolveTenantId } = require('../shared/tenant-resolver');
const { listQuestions } = require('./assessment-question.service');

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

function normalizeAnswers(rawAnswers) {
  if (!Array.isArray(rawAnswers) || !rawAnswers.length) {
    throw buildError('answers array is required.');
  }
  return rawAnswers.map((answer) => {
    const questionId = answer?.questionId ? String(answer.questionId).trim() : null;
    if (!questionId) {
      throw buildError('Each answer must include questionId.');
    }
    const choiceId =
      answer?.choiceId !== undefined && answer?.choiceId !== null
        ? String(answer.choiceId).trim()
        : null;
    return { questionId, choiceId: choiceId || null };
  });
}

function mapAttemptRow(row) {
  if (!row) {
    return null;
  }
  let answers = [];
  if (row.Answers) {
    try {
      const parsed = JSON.parse(row.Answers);
      answers = Array.isArray(parsed) ? parsed : [];
    } catch {
      answers = [];
    }
  }
  return {
    id: row.AttemptId,
    courseId: row.CourseId,
    userId: row.UserId,
    learnerEmail: row.LearnerEmail,
    questionCount: row.QuestionCount,
    correctCount: row.CorrectCount,
    scorePercent: Number(row.ScorePercent),
    submittedAt: row.SubmittedAt,
    answers,
  };
}

async function listAttempts({
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
    filters.push('LOWER(LearnerEmail) = LOWER(@LearnerEmail)');
  } else if (normalizedUserId === null) {
    filters.push('LearnerEmail IS NULL');
  }

  const result = await request.query(`
    SELECT
      AttemptId,
      CourseId,
      UserId,
      LearnerEmail,
      QuestionCount,
      CorrectCount,
      ScorePercent,
      Answers,
      SubmittedAt
    FROM AssessmentAttempts
    WHERE ${filters.join(' AND ')}
    ORDER BY SubmittedAt DESC;
  `);

  return result.recordset.map(mapAttemptRow);
}

async function recordAttempt(payload = {}) {
  if (!payload.businessName && !payload.tenantId) {
    throw buildError('businessName is required to record assessment attempts.');
  }
  const normalizedCourseId = normalizeCourseId(payload.courseId);
  const normalizedUserId = normalizeUserId(payload.userId);
  const normalizedEmail = normalizeEmail(payload.learnerEmail);
  requireIdentity({ userId: normalizedUserId, learnerEmail: normalizedEmail });

  const answers = normalizeAnswers(payload.answers);
  const questions = await listQuestions({
    businessName: payload.businessName,
    courseId: normalizedCourseId,
  });
  if (!questions.length) {
    throw buildError('No assessment questions configured for this course.', 404);
  }

  const answersByQuestion = new Map();
  answers.forEach((answer) => {
    answersByQuestion.set(answer.questionId, answer.choiceId);
  });

  const normalized = questions.map((question) => {
    const questionId = String(question.id);
    const selectedChoiceId = answersByQuestion.get(questionId) || null;
    const correctChoiceId =
      question.correctChoiceId ||
      question.choices?.find((choice) => choice.isCorrect)?.id ||
      null;
    const isCorrect = Boolean(
      selectedChoiceId &&
        correctChoiceId &&
        String(selectedChoiceId) === String(correctChoiceId),
    );
    return {
      questionId,
      prompt: question.prompt,
      selectedChoiceId,
      correctChoiceId,
      isCorrect,
    };
  });

  const questionCount = normalized.length;
  const correctCount = normalized.filter((entry) => entry.isCorrect).length;
  const scorePercent = questionCount
    ? Number(((correctCount / questionCount) * 100).toFixed(2))
    : 0;

  const tenantId = await resolveTenantId({
    tenantId: payload.tenantId,
    businessName: payload.businessName,
  });
  const pool = await getPool();
  const request = pool.request();
  request.input('TenantId', tenantId);
  request.input('CourseId', normalizedCourseId);
  request.input('UserId', normalizedUserId);
  request.input('LearnerEmail', normalizedEmail);
  request.input('QuestionCount', questionCount);
  request.input('CorrectCount', correctCount);
  request.input('ScorePercent', scorePercent);
  request.input('Answers', JSON.stringify(normalized));

  const result = await request.query(`
    INSERT INTO AssessmentAttempts (
      TenantId,
      CourseId,
      UserId,
      LearnerEmail,
      QuestionCount,
      CorrectCount,
      ScorePercent,
      Answers,
      SubmittedAt
    )
    OUTPUT INSERTED.*
    VALUES (
      @TenantId,
      @CourseId,
      @UserId,
      @LearnerEmail,
      @QuestionCount,
      @CorrectCount,
      @ScorePercent,
      @Answers,
      SYSUTCDATETIME()
    );
  `);

  return mapAttemptRow(result.recordset[0]);
}

module.exports = {
  listAttempts,
  recordAttempt,
};
