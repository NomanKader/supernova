const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');

const { resolveBusinessKey } = require('./lesson.service');

const assessmentsRoot = path.join(__dirname, '..', 'assets', 'assessments');
const MAX_CHOICES = 6;
const MIN_CHOICES = 2;

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureStore(businessKey) {
  const dir = path.join(assessmentsRoot, businessKey);
  const filePath = path.join(dir, 'questions.json');
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');
  }
  return filePath;
}

async function readQuestions(businessKey) {
  const filePath = await ensureStore(businessKey);
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Unable to parse assessment questions store, resetting file', error);
    await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
}

async function writeQuestions(businessKey, questions) {
  const filePath = await ensureStore(businessKey);
  await fs.writeFile(filePath, JSON.stringify(questions, null, 2), 'utf8');
}

function normalizeCourseId(value) {
  if (value === undefined || value === null) {
    throw buildError('courseId is required.');
  }
  const courseId = String(value).trim();
  if (!courseId) {
    throw buildError('courseId cannot be empty.');
  }
  return courseId;
}

function normalizePrompt(value) {
  if (typeof value !== 'string') {
    throw buildError('Question prompt is required.');
  }
  const prompt = value.trim();
  if (prompt.length < 6) {
    throw buildError('Question prompt must be at least 6 characters.');
  }
  return prompt;
}

function normalizeExplanation(value) {
  if (value === undefined || value === null) {
    return '';
  }
  const explanation = String(value).trim();
  return explanation.length > 1000 ? explanation.slice(0, 1000) : explanation;
}

function sanitizeChoice(choice, fallbackId) {
  if (!choice) {
    return null;
  }
  const text =
    typeof choice.text === 'string'
      ? choice.text.trim()
      : typeof choice.label === 'string'
      ? choice.label.trim()
      : '';
  if (!text) {
    return null;
  }
  return {
    id: choice.id ? String(choice.id) : fallbackId || randomUUID(),
    text,
    isCorrect: Boolean(choice.isCorrect),
  };
}

function normalizeChoices(rawChoices) {
  const prepared = [];
  const source = Array.isArray(rawChoices) ? rawChoices : [];
  source.forEach((choice, index) => {
    const sanitized = sanitizeChoice(choice, `choice-${index + 1}-${randomUUID()}`);
    if (sanitized) {
      prepared.push(sanitized);
    }
  });
  if (prepared.length < MIN_CHOICES) {
    throw buildError('Provide at least two answer choices.');
  }
  if (prepared.length > MAX_CHOICES) {
    prepared.length = MAX_CHOICES;
  }

  let correctChoiceId =
    prepared.find((choice) => choice.isCorrect)?.id || prepared[0].id;
  prepared.forEach((choice) => {
    choice.isCorrect = choice.id === correctChoiceId;
  });

  return { choices: prepared, correctChoiceId };
}

async function listQuestions({ businessName, courseId } = {}) {
  if (!businessName || typeof businessName !== 'string') {
    throw buildError('businessName is required to list questions.');
  }
  const businessKey = resolveBusinessKey(businessName);
  const questions = await readQuestions(businessKey);

  if (!courseId) {
    return questions;
  }

  const targetCourseId = String(courseId);
  return questions.filter((question) => String(question.courseId) === targetCourseId);
}

async function createQuestion(payload = {}) {
  if (!payload.businessName || typeof payload.businessName !== 'string') {
    throw buildError('businessName is required to create a question.');
  }
  const businessKey = resolveBusinessKey(payload.businessName);
  const courseId = normalizeCourseId(payload.courseId);
  const prompt = normalizePrompt(payload.prompt);
  const explanation = normalizeExplanation(payload.explanation);
  const { choices, correctChoiceId } = normalizeChoices(payload.choices);
  const timestamp = new Date().toISOString();

  const question = {
    id: randomUUID(),
    courseId,
    prompt,
    explanation,
    choices,
    correctChoiceId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const questions = await readQuestions(businessKey);
  questions.unshift(question);
  await writeQuestions(businessKey, questions);

  return question;
}

async function updateQuestion(questionId, payload = {}) {
  if (!payload.businessName || typeof payload.businessName !== 'string') {
    throw buildError('businessName is required to update a question.');
  }
  const businessKey = resolveBusinessKey(payload.businessName);
  const questions = await readQuestions(businessKey);
  const index = questions.findIndex((question) => String(question.id) === String(questionId));
  if (index === -1) {
    throw buildError('Question not found.', 404);
  }

  const existing = questions[index];
  const courseId =
    payload.courseId !== undefined ? normalizeCourseId(payload.courseId) : existing.courseId;
  const prompt = payload.prompt !== undefined ? normalizePrompt(payload.prompt) : existing.prompt;
  const explanation =
    payload.explanation !== undefined
      ? normalizeExplanation(payload.explanation)
      : existing.explanation || '';

  let nextChoices = existing.choices;
  let correctChoiceId = existing.correctChoiceId;
  if (payload.choices) {
    const normalized = normalizeChoices(payload.choices);
    nextChoices = normalized.choices;
    correctChoiceId = normalized.correctChoiceId;
  }

  const updated = {
    ...existing,
    courseId,
    prompt,
    explanation,
    choices: nextChoices,
    correctChoiceId,
    updatedAt: new Date().toISOString(),
  };

  questions[index] = updated;
  await writeQuestions(businessKey, questions);

  return updated;
}

async function deleteQuestion(questionId, { businessName } = {}) {
  if (!businessName || typeof businessName !== 'string') {
    throw buildError('businessName is required to delete a question.');
  }
  const businessKey = resolveBusinessKey(businessName);
  const questions = await readQuestions(businessKey);
  const index = questions.findIndex((question) => String(question.id) === String(questionId));
  if (index === -1) {
    throw buildError('Question not found.', 404);
  }

  const [removed] = questions.splice(index, 1);
  await writeQuestions(businessKey, questions);
  return removed;
}

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};

