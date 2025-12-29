const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');

const assetsDir = path.join(__dirname, '..', 'assets');
const courseImagesDir = path.join(assetsDir, 'courses');
const dataFile = path.join(assetsDir, 'courses.json');
const { countLessonsByCourse } = require('./lesson.service');

async function ensureStorage() {
  await fs.mkdir(courseImagesDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify([], null, 2), 'utf8');
  }
}

async function readCourses() {
  await ensureStorage();
  const buffer = await fs.readFile(dataFile, 'utf8');
  try {
    const data = JSON.parse(buffer);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to parse courses.json, resetting store', error);
    await fs.writeFile(dataFile, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
}

async function writeCourses(courses) {
  await fs.writeFile(dataFile, JSON.stringify(courses, null, 2), 'utf8');
}

function normalizePrice(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed * 100) / 100;
}

function normalizeStatus(value, fallback = 'inactive') {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  if (normalized === 'active') {
    return 'active';
  }
  if (normalized === 'inactive') {
    return 'inactive';
  }
  return fallback === 'active' ? 'active' : 'inactive';
}

async function listCourses(options = {}) {
  const courses = await readCourses();
  let lessonCounts = null;
  try {
    lessonCounts = await countLessonsByCourse(options.businessName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to count lessons for courses', error);
    lessonCounts = null;
  }

  const normalized = courses.map((course) => {
    const aggregate = lessonCounts ? lessonCounts.get(String(course.id)) : null;
    const lessonCount =
      aggregate && typeof aggregate.count === 'number'
        ? aggregate.count
        : course.lessons ?? 0;
    const durationSeconds =
      aggregate && typeof aggregate.durationSeconds === 'number'
        ? aggregate.durationSeconds
        : course.durationSeconds ?? 0;
    return {
      ...course,
      price: normalizePrice(course.price),
      status: normalizeStatus(course.status, 'inactive'),
      lessons: lessonCount,
      durationSeconds,
    };
  });

  const { status } = options;
  if (!status || status === 'active') {
    return normalized.filter((course) => course.status === 'active');
  }
  if (status === 'inactive') {
    return normalized.filter((course) => course.status === 'inactive');
  }
  return normalized;
}

async function createCourse(payload) {
  const courses = await readCourses();
  const timestamp = new Date().toISOString();
  const course = {
    id: randomUUID(),
    title: payload.title,
    description: payload.description,
    categoryId: payload.categoryId || null,
    instructorIds: payload.instructorId ? [payload.instructorId] : [],
    level: payload.level || 'beginner',
    status: normalizeStatus(payload.status, 'active'),
    lessons: payload.lessons ?? 0,
    durationSeconds: payload.durationSeconds ?? 0,
    enrollments: payload.enrollments ?? 0,
    updatedAt: timestamp,
    createdAt: timestamp,
    price: normalizePrice(payload.price),
    imageUrl: payload.imageUrl ?? null,
    imageFilename: payload.imageFilename ?? null,
  };

  courses.unshift(course);
  await writeCourses(courses);

  return course;
}

async function updateCourse(courseId, payload) {
  const courses = await readCourses();
  const index = courses.findIndex((course) => String(course.id) === String(courseId));

  if (index === -1) {
    throw new Error('Course not found.');
  }

  const timestamp = new Date().toISOString();
  const existing = courses[index];
  const nextImageFilename = payload.imageFilename ?? existing.imageFilename;
  const nextImageUrl = payload.imageUrl ?? existing.imageUrl;

  if (
    payload.imageFilename &&
    existing.imageFilename &&
    existing.imageFilename !== payload.imageFilename
  ) {
    const previousPath = path.join(courseImagesDir, existing.imageFilename);
    try {
      await fs.unlink(previousPath);
    } catch {
      // ignore file deletion errors
    }
  }

  const updated = {
    ...existing,
    title: payload.title ?? existing.title,
    description: payload.description ?? existing.description,
    categoryId: payload.categoryId ?? existing.categoryId,
    instructorIds: payload.instructorId ? [payload.instructorId] : existing.instructorIds,
    level: payload.level ?? existing.level,
    status: normalizeStatus(payload.status ?? existing.status, existing.status),
    lessons: payload.lessons ?? existing.lessons,
    durationSeconds:
      payload.durationSeconds !== undefined && payload.durationSeconds !== null
        ? payload.durationSeconds
        : existing.durationSeconds ?? 0,
    enrollments: payload.enrollments ?? existing.enrollments,
    price: normalizePrice(payload.price ?? existing.price),
    imageUrl: nextImageUrl,
    imageFilename: nextImageFilename,
    updatedAt: timestamp,
  };

  courses[index] = updated;
  await writeCourses(courses);

  return updated;
}

module.exports = {
  listCourses,
  createCourse,
  updateCourse,
  ensureStorage,
  courseImagesDir,
};

