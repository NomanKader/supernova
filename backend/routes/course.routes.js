const path = require('path');
const { Router } = require('express');
const multer = require('multer');

const {
  listCourses,
  createCourse,
  ensureStorage,
  courseImagesDir,
} = require('../services/course.service');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function sanitizeFileName(name) {
  const baseName = path.parse(name).name;
  const safe = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return safe || 'course-image';
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureStorage()
      .then(() => cb(null, courseImagesDir))
      .catch((error) => cb(error));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.originalname);
    cb(null, `${safeName}-${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    } else {
      cb(null, true);
    }
  },
});

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const courses = await listCourses();
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, categoryId, instructorId, level } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    if (!instructorId) {
      return res.status(400).json({ error: 'Instructor is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Course image upload is required.' });
    }

    const course = await createCourse({
      title: title.trim(),
      description: description.trim(),
      categoryId: String(categoryId),
      instructorId: String(instructorId),
      level: (level || 'beginner').toLowerCase(),
      imageUrl: `/assets/courses/${req.file.filename}`,
      imageFilename: req.file.filename,
    });

    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

