const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');

const lessonsRoot = path.join(__dirname, '..', '..', 'assets', 'lessons');

function sanitizeSegment(value, fallback = 'default') {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  const safe = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return safe || fallback;
}

function resolveBusinessKey(businessName) {
  return sanitizeSegment(businessName, 'default');
}

async function ensureBusinessStorage(businessKey) {
  const baseDir = path.join(lessonsRoot, businessKey);
  await fs.mkdir(baseDir, { recursive: true });

  const metadataPath = path.join(baseDir, 'lessons.json');
  try {
    await fs.access(metadataPath);
  } catch {
    await fs.writeFile(metadataPath, JSON.stringify([], null, 2), 'utf8');
  }

  return { baseDir, metadataPath };
}

async function readLessons(businessKey) {
  const { metadataPath } = await ensureBusinessStorage(businessKey);
  const raw = await fs.readFile(metadataPath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to parse lessons metadata, resetting store', error);
    await fs.writeFile(metadataPath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
}

async function writeLessons(businessKey, lessons) {
  const { metadataPath } = await ensureBusinessStorage(businessKey);
  const serialized = JSON.stringify(lessons, null, 2);
  await fs.writeFile(metadataPath, serialized, 'utf8');
}

async function listLessons({ businessKey, courseId } = {}) {
  const key = resolveBusinessKey(businessKey);
  const lessons = await readLessons(key);

  const filtered = courseId ? lessons.filter((lesson) => lesson.courseId === String(courseId)) : lessons;

  return filtered.sort((a, b) => {
    const first = Number.isFinite(a.lessonNumber) ? Number(a.lessonNumber) : 0;
    const second = Number.isFinite(b.lessonNumber) ? Number(b.lessonNumber) : 0;
    if (first === second) {
      return (a.uploadedAt || '').localeCompare(b.uploadedAt || '');
    }
    return first - second;
  });
}

async function addLesson({ businessName, courseId, lessonNumber, title, description, file }) {
  if (!courseId) {
    throw new Error('Course ID is required to create a lesson.');
  }

  if (!file) {
    throw new Error('Video file is required.');
  }

  const businessKey = resolveBusinessKey(businessName);
  await ensureBusinessStorage(businessKey);

  const lessons = await readLessons(businessKey);
  const orderedNumber = Number.isFinite(Number(lessonNumber))
    ? Number(lessonNumber)
    : lessons.filter((lesson) => lesson.courseId === String(courseId)).length + 1;

  const sizeBytes = Number(file.size) || 0;
  const sizeMB = sizeBytes ? Number((sizeBytes / (1024 * 1024)).toFixed(2)) : 0;

  const lesson = {
    id: randomUUID(),
    courseId: String(courseId),
    lessonNumber: orderedNumber,
    title: title ? String(title).trim() : `Lesson ${orderedNumber}`,
    description: description ? String(description).trim() : '',
    videoFilename: file.filename,
    videoUrl: `/assets/lessons/${businessKey}/${courseId}/${file.filename}`,
    mimeType: file.mimetype,
    sizeBytes,
    sizeMB,
    uploadedAt: new Date().toISOString(),
  };

  lessons.push(lesson);
  await writeLessons(businessKey, lessons);

  return lesson;
}

async function ensureCourseDirectory(businessName, courseId) {
  if (!courseId) {
    throw new Error('Course ID is required to create course directory.');
  }

  const businessKey = resolveBusinessKey(businessName);
  const { baseDir } = await ensureBusinessStorage(businessKey);
  const courseDir = path.join(baseDir, String(courseId));
  await fs.mkdir(courseDir, { recursive: true });
  return courseDir;
}

module.exports = {
  lessonsRoot,
  resolveBusinessKey,
  ensureCourseDirectory,
  listLessons,
  addLesson,
};

