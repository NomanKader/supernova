const path = require('path');
const { Router } = require('express');
const multer = require('multer');

const {
  ensureCourseDirectory,
  listLessons,
  addLesson,
  resolveBusinessKey,
} = require('../services/lesson.service');

const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

function buildUploadContext(req) {
  const businessName = req.query.businessName || req.body?.businessName;
  const businessKey = resolveBusinessKey(businessName);
  const courseId = req.query.courseId || req.body?.courseId;
  return { businessName, businessKey, courseId };
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { businessName, courseId } = buildUploadContext(req);
      if (!courseId) {
        cb(new Error('courseId query parameter is required.'));
        return;
      }
      const dir = await ensureCourseDirectory(businessName, courseId);
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const { courseId } = buildUploadContext(req);
    const slug = path
      .parse(file.originalname || `lesson-${Date.now()}`)
      .name.replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    const safeName = slug || `lesson-${Date.now()}`;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname || '.mp4') || '.mp4';
    cb(null, `${safeName}-${courseId}-${timestamp}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('video/')) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'video'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { businessName } = req.query;
    const courseId = req.query.courseId ? String(req.query.courseId) : undefined;
    const lessons = await listLessons({ businessKey: businessName, courseId });
    res.json({ data: lessons });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    const { businessName, courseId } = buildUploadContext(req);

    const { lessonNumber, title, description } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId query parameter is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required.' });
    }

    const lesson = await addLesson({
      businessName,
      courseId,
      lessonNumber,
      title,
      description,
      file: req.file,
    });

    res.status(201).json({ data: lesson });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Video exceeds maximum size of 2GB.' });
      }
      return res.status(400).json({ error: 'Invalid video upload.' });
    }
    next(error);
  }
});

module.exports = router;

