const path = require('path');
const { Router } = require('express');
const multer = require('multer');

const {
  listCourses,
  createCourse,
  updateCourse,
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

function resolveStatusParam(value, { includeAll = false, defaultStatus } = {}) {
  const fallback = defaultStatus || (includeAll ? 'all' : 'active');

  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (normalized === 'inactive') {
    return 'inactive';
  }
  if (includeAll && normalized === 'all') {
    return 'all';
  }
  return fallback;
}

router.get('/', async (req, res, next) => {
  try {
    const status = resolveStatusParam(req.query.status, {
      includeAll: true,
      defaultStatus: 'active',
    });
    const courses = await listCourses({ status });
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, categoryId, instructorId, level, price, status } = req.body;

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

    const priceValue =
      price === undefined || price === null || price === ''
        ? 0
        : Number.parseFloat(price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      return res.status(400).json({ error: 'Price must be zero or a positive amount.' });
    }

    const statusValue = resolveStatusParam(status, { defaultStatus: 'active' });

    const course = await createCourse({
      title: title.trim(),
      description: description.trim(),
      categoryId: String(categoryId),
      instructorId: String(instructorId),
      level: (level || 'beginner').toLowerCase(),
      status: statusValue,
      price: priceValue,
      imageUrl: `/assets/courses/${req.file.filename}`,
      imageFilename: req.file.filename,
    });

    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
});

router.put('/:courseId', upload.single('image'), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, categoryId, instructorId, level, price, status } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required.' });
    }
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

    const priceValue =
      price === undefined || price === null || price === ''
        ? 0
        : Number.parseFloat(price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      return res.status(400).json({ error: 'Price must be zero or a positive amount.' });
    }

    const statusValue = resolveStatusParam(status, { defaultStatus: 'active' });
    const payload = {
      title: title.trim(),
      description: description.trim(),
      categoryId: String(categoryId),
      instructorId: String(instructorId),
      level: (level || 'beginner').toLowerCase(),
      status: statusValue,
      price: priceValue,
    };

    if (req.file) {
      payload.imageUrl = `/assets/courses/${req.file.filename}`;
      payload.imageFilename = req.file.filename;
    }

    const updatedCourse = await updateCourse(courseId, payload);
    res.json({ data: updatedCourse });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

