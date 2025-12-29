const os = require('os');
const fs = require('fs/promises');
const { Router } = require('express');
const multer = require('multer');

const {
  ensureCourseDirectory,
  listLessons,
  addLesson,
  resolveBusinessKey,
  generateLessonFilename,
  deleteLesson,
  buildS3ObjectKey,
} = require('../services/lesson.service');
const {
  listLessonProgress,
  markLessonComplete,
} = require('../services/lesson-progress.service');
const { loadConfig } = require('../shared/env');
const {
  createMultipartUpload,
  generatePartUploadUrl,
  completeMultipartUpload,
  abortMultipartUpload,
} = require('../shared/s3');

const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
const storageDriver = (loadConfig().lessonStorageDriver || 'local').toLowerCase();
const useS3Storage = storageDriver === 's3';
const DIRECT_UPLOAD_PART_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const DIRECT_UPLOAD_URL_TTL_SECONDS = 60 * 60; // 1h

function buildUploadContext(req) {
  const businessName = req.query.businessName || req.body?.businessName;
  const businessKey = resolveBusinessKey(businessName);
  const courseId = req.query.courseId || req.body?.courseId;
  return { businessName, businessKey, courseId };
}

function ensureDirectUploadSupport() {
  if (!useS3Storage) {
    const error = new Error('Direct uploads require LESSON_STORAGE_DRIVER set to s3.');
    error.status = 400;
    throw error;
  }
  const config = loadConfig();
  if (!config.lessonsS3Bucket) {
    const error = new Error('LESSONS_S3_BUCKET must be configured for direct uploads.');
    error.status = 500;
    throw error;
  }
  return config;
}

async function cleanupUploadedFile(file) {
  if (file?.path) {
    try {
      await fs.unlink(file.path);
    } catch {
      // ignore cleanup failures
    }
  }
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { businessName, courseId } = buildUploadContext(req);
      if (!courseId) {
        cb(new Error('courseId query parameter is required.'));
        return;
      }
      if (useS3Storage) {
        cb(null, os.tmpdir());
        return;
      }
      const dir = await ensureCourseDirectory(businessName, courseId);
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const { courseId } = buildUploadContext(req);
      const filename = generateLessonFilename(file.originalname || `lesson-${Date.now()}`, courseId);
      cb(null, filename);
    } catch (error) {
      cb(error);
    }
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

router.get('/progress', async (req, res, next) => {
  try {
    const data = await listLessonProgress({
      businessName: req.query.businessName,
      tenantId: req.query.tenantId,
      courseId: req.query.courseId,
      learnerEmail: req.query.learnerEmail,
      userId: req.query.userId,
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/progress', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      businessName: req.body?.businessName || req.query.businessName,
    };
    const record = await markLessonComplete(payload);
    res.status(201).json({ data: record });
  } catch (error) {
    next(error);
  }
});

router.post('/uploads/direct/initiate', async (req, res, next) => {
  try {
    const config = ensureDirectUploadSupport();
    const { businessName, businessKey, courseId } = buildUploadContext(req);
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required.' });
    }
    const fileName = req.body?.fileName;
    const contentType = req.body?.contentType || 'application/octet-stream';
    const fileSize = Number(req.body?.fileSize) || 0;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required.' });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return res.status(400).json({ error: 'fileSize must be a positive number.' });
    }

    const filename = generateLessonFilename(fileName, courseId);
    const key = buildS3ObjectKey({ businessKey, courseId, filename });
    const response = await createMultipartUpload({
      bucket: config.lessonsS3Bucket,
      key,
      contentType,
    });

    res.json({
      data: {
        uploadId: response.UploadId,
        key,
        bucket: config.lessonsS3Bucket,
        filename,
        partSizeBytes: DIRECT_UPLOAD_PART_SIZE_BYTES,
        expiresInSeconds: DIRECT_UPLOAD_URL_TTL_SECONDS,
        businessName,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/uploads/direct/part-url', async (req, res, next) => {
  try {
    const config = ensureDirectUploadSupport();
    const { key, uploadId, partNumber } = req.body || {};
    if (!key || !uploadId || !partNumber) {
      return res.status(400).json({ error: 'key, uploadId, and partNumber are required.' });
    }
    const normalizedPartNumber = Number(partNumber);
    if (!Number.isFinite(normalizedPartNumber) || normalizedPartNumber <= 0) {
      return res.status(400).json({ error: 'partNumber must be a positive integer.' });
    }

    const url = await generatePartUploadUrl({
      bucket: config.lessonsS3Bucket,
      key,
      uploadId,
      partNumber: normalizedPartNumber,
      expiresIn: DIRECT_UPLOAD_URL_TTL_SECONDS,
    });
    res.json({ data: { url, expiresInSeconds: DIRECT_UPLOAD_URL_TTL_SECONDS } });
  } catch (error) {
    next(error);
  }
});

router.post('/uploads/direct/complete', async (req, res, next) => {
  try {
    const config = ensureDirectUploadSupport();
    const { uploadId, key, parts } = req.body || {};
    if (!uploadId || !key) {
      return res.status(400).json({ error: 'uploadId and key are required.' });
    }
    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ error: 'parts array is required.' });
    }
    const normalizedParts = parts
      .map((part) => ({
        ETag: part.ETag || part.etag,
        PartNumber: Number(part.partNumber ?? part.PartNumber),
      }))
      .filter((part) => part.ETag && Number.isFinite(part.PartNumber) && part.PartNumber > 0)
      .sort((a, b) => a.PartNumber - b.PartNumber);
    if (!normalizedParts.length) {
      return res.status(400).json({ error: 'Valid upload parts are required to complete the upload.' });
    }

    const result = await completeMultipartUpload({
      bucket: config.lessonsS3Bucket,
      key,
      uploadId,
      parts: normalizedParts,
    });
    res.json({ data: { location: result.Location || null } });
  } catch (error) {
    next(error);
  }
});

router.post('/uploads/direct/abort', async (req, res, next) => {
  try {
    const config = ensureDirectUploadSupport();
    const { uploadId, key } = req.body || {};
    if (!uploadId || !key) {
      return res.status(400).json({ error: 'uploadId and key are required.' });
    }
    await abortMultipartUpload({
      bucket: config.lessonsS3Bucket,
      key,
      uploadId,
    });
    res.json({ data: { aborted: true } });
  } catch (error) {
    next(error);
  }
});

router.post('/direct', async (req, res, next) => {
  try {
    ensureDirectUploadSupport();
    const { businessName, courseId } = buildUploadContext(req);
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required.' });
    }
    const remoteObject = {
      key: req.body?.videoStorageKey,
      filename: req.body?.videoFilename,
      mimeType: req.body?.mimeType || 'video/mp4',
      sizeBytes: req.body?.sizeBytes,
    };
    const lesson = await addLesson({
      businessName,
      courseId,
      lessonNumber: req.body?.lessonNumber,
      title: req.body?.title,
      description: req.body?.description,
      durationSeconds: req.body?.durationSeconds,
      remoteObject,
    });
    res.status(201).json({ data: lesson });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('video'), async (req, res, next) => {
  try {
    const { businessName, courseId } = buildUploadContext(req);

    const { lessonNumber, title, description, durationSeconds } = req.body;
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
      durationSeconds,
      file: req.file,
    });

    res.status(201).json({ data: lesson });
  } catch (error) {
    await cleanupUploadedFile(req.file);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Video exceeds maximum size of 2GB.' });
      }
      return res.status(400).json({ error: 'Invalid video upload.' });
    }
    next(error);
  }
});

router.delete('/:lessonId', async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID is required.' });
    }
    const { businessName } = buildUploadContext(req);

    const removed = await deleteLesson({ lessonId, businessName });
    res.json({ data: removed });
  } catch (error) {
    if (error?.message === 'Lesson not found.') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
