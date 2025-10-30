const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');

const assetsDir = path.join(__dirname, '..', '..', 'assets');
const courseImagesDir = path.join(assetsDir, 'courses');
const dataFile = path.join(assetsDir, 'courses.json');

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

async function listCourses() {
  return readCourses();
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
    status: payload.status || 'draft',
    lessons: payload.lessons ?? 0,
    enrollments: payload.enrollments ?? 0,
    updatedAt: timestamp,
    createdAt: timestamp,
    imageUrl: payload.imageUrl ?? null,
    imageFilename: payload.imageFilename ?? null,
  };

  courses.unshift(course);
  await writeCourses(courses);

  return course;
}

module.exports = {
  listCourses,
  createCourse,
  ensureStorage,
  courseImagesDir,
};

