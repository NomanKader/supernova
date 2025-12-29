const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { randomUUID } = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { loadConfig } = require('../shared/env');
const { uploadBufferToS3, buildPublicS3Url, deleteObjectFromS3 } = require('../shared/s3');
let ffprobeStatic = null;
let ffmpegStatic = null;
try {
  // Optional dependency: ffprobe-static isn't required when video metadata isn't needed.
  // eslint-disable-next-line global-require
  ffprobeStatic = require('ffprobe-static');
} catch {
  ffprobeStatic = null;
}
try {
  // eslint-disable-next-line global-require
  ffmpegStatic = require('ffmpeg-static');
} catch {
  ffmpegStatic = null;
}

const lessonsRoot = path.join(__dirname, '..', 'assets', 'lessons');
const execFileAsync = promisify(execFile);
const appConfig = loadConfig();
const lessonStorageDriver = (appConfig.lessonStorageDriver || 'local').toLowerCase();
const isS3Storage = lessonStorageDriver === 's3';
const lessonTranscodeEnabled = Boolean(appConfig.lessonTranscodeEnabled);
const normalizedS3Prefix = appConfig.lessonsS3Prefix
  ? appConfig.lessonsS3Prefix.replace(/(^\/+|\/+$)/g, '')
  : '';

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

function generateLessonFilename(originalName, courseId) {
  const fallback = `lesson-${Date.now()}`;
  const base = path.parse(originalName || '').name;
  const safeBase = sanitizeSegment(base || fallback, fallback);
  const ext = lessonTranscodeEnabled
    ? '.mp4'
    : (path.extname(originalName || '') || '.mp4');
  const slugCourse = sanitizeSegment(String(courseId || 'general'), 'course');
  const timestamp = Date.now();
  return `${safeBase}-${slugCourse}-${timestamp}${ext.toLowerCase()}`;
}

function buildS3ObjectKey({ businessKey, courseId, filename }) {
  const segments = [
    normalizedS3Prefix,
    businessKey,
    String(courseId),
    filename,
  ].filter(Boolean);
  return segments.join('/');
}

function deriveS3KeyFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  const normalizedBase = appConfig.lessonsCdnBaseUrl
    ? appConfig.lessonsCdnBaseUrl.replace(/\/+$/, '')
    : null;
  if (normalizedBase && url.startsWith(`${normalizedBase}/`)) {
    return url.slice(normalizedBase.length + 1);
  }
  if (appConfig.lessonsS3Bucket) {
    const regionSegment = appConfig.awsRegion ? `.${appConfig.awsRegion}` : '';
    const bucketUrl = `https://${appConfig.lessonsS3Bucket}.s3${regionSegment}.amazonaws.com/`;
    if (url.startsWith(bucketUrl)) {
      return url.slice(bucketUrl.length);
    }
    const legacyBucketUrl = `https://${appConfig.lessonsS3Bucket}.s3.amazonaws.com/`;
    if (url.startsWith(legacyBucketUrl)) {
      return url.slice(legacyBucketUrl.length);
    }
  }
  return null;
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

async function detectVideoDurationSeconds(videoPath) {
  if (!ffprobeStatic?.path || !videoPath) {
    return null;
  }
  try {
    await fs.access(videoPath);
  } catch {
    return null;
  }

  try {
    const { stdout } = await execFileAsync(ffprobeStatic.path, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      videoPath,
    ]);
    const parsed = parseFloat(stdout);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function maybeOptimizeLessonVideo(file) {
  if (!lessonTranscodeEnabled || !file?.path) {
    return file;
  }

  const ffmpegBinary = appConfig.lessonTranscodeFfmpegPath || ffmpegStatic;
  if (!ffmpegBinary) {
    return file;
  }

  try {
    await fs.access(file.path);
  } catch {
    return file;
  }

  const tempOutputPath = `${file.path}.optimized`;
  const videoBitrateKbps = Math.max(appConfig.lessonTranscodeVideoBitrateKbps || 4500, 800);
  const audioBitrateKbps = Math.max(appConfig.lessonTranscodeAudioBitrateKbps || 128, 64);
  const preset = appConfig.lessonTranscodePreset || 'veryfast';
  const filters = [];
  if (Number.isFinite(appConfig.lessonTranscodeMaxWidth) && appConfig.lessonTranscodeMaxWidth > 0) {
    filters.push(`scale='min(${appConfig.lessonTranscodeMaxWidth},iw)':-2`);
  }

  const args = [
    '-y',
    '-i',
    file.path,
    '-c:v',
    'libx264',
    '-preset',
    preset,
    '-profile:v',
    'high',
    '-pix_fmt',
    'yuv420p',
    '-b:v',
    `${videoBitrateKbps}k`,
    '-maxrate',
    `${Math.round(videoBitrateKbps * 1.5)}k`,
    '-bufsize',
    `${Math.round(videoBitrateKbps * 3)}k`,
    '-movflags',
    'faststart',
    '-c:a',
    'aac',
    '-b:a',
    `${audioBitrateKbps}k`,
  ];

  if (filters.length) {
    args.push('-vf', filters.join(','));
  }

  args.push(tempOutputPath);

  try {
    await execFileAsync(ffmpegBinary, args);
    await fs.unlink(file.path).catch(() => {});
    await fs.rename(tempOutputPath, file.path);
    const stat = await fs.stat(file.path);

    return {
      ...file,
      size: stat.size,
      mimetype: 'video/mp4',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Lesson video transcode failed, continuing with original upload', error);
    await fs.unlink(tempOutputPath).catch(() => {});
    return file;
  }
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

async function addLesson({
  businessName,
  courseId,
  lessonNumber,
  title,
  description,
  durationSeconds,
  file,
  remoteObject,
}) {
  if (!courseId) {
    throw new Error('Course ID is required to create a lesson.');
  }

  if (!file && !remoteObject) {
    throw new Error('Video file is required.');
  }

  const businessKey = resolveBusinessKey(businessName);
  await ensureBusinessStorage(businessKey);

  const optimizedFile = file ? await maybeOptimizeLessonVideo(file) : null;
  const uploadFile = optimizedFile || file || null;
  const usingRemoteObject = Boolean(remoteObject);

  if (usingRemoteObject) {
    if (!remoteObject.key) {
      throw new Error('videoStorageKey is required for remote lesson uploads.');
    }
    if (!appConfig.lessonsS3Bucket) {
      throw new Error('LESSONS_S3_BUCKET must be configured to use remote lesson uploads.');
    }
  }

  const lessons = await readLessons(businessKey);
  const orderedNumber = Number.isFinite(Number(lessonNumber))
    ? Number(lessonNumber)
    : lessons.filter((lesson) => lesson.courseId === String(courseId)).length + 1;

  const sizeBytes = usingRemoteObject
    ? Number(remoteObject.sizeBytes) || 0
    : Number(uploadFile?.size) || 0;
  const sizeMB = sizeBytes ? Number((sizeBytes / (1024 * 1024)).toFixed(2)) : 0;
  const normalizedDuration = normalizeDurationSeconds(durationSeconds);
  const filename = usingRemoteObject
    ? remoteObject.filename || path.basename(remoteObject.key || '')
    : uploadFile.filename
        || generateLessonFilename(uploadFile.originalname || file.originalname, courseId);

  let videoUrl = usingRemoteObject
    ? buildPublicS3Url(remoteObject.key)
    : `/assets/lessons/${businessKey}/${courseId}/${filename}`;
  let storageKey = usingRemoteObject ? remoteObject.key : null;
  let cleanupLocalFile = !isS3Storage && !usingRemoteObject;

  try {
    if (!usingRemoteObject && isS3Storage) {
      if (!appConfig.lessonsS3Bucket) {
        throw new Error('LESSONS_S3_BUCKET must be configured to upload lessons to S3.');
      }
      const fileBody = (uploadFile.path && fsSync.createReadStream(uploadFile.path)) || uploadFile.buffer;
      if (!fileBody) {
        throw new Error('Invalid lesson upload payload: missing video buffer.');
      }
      const key = buildS3ObjectKey({ businessKey, courseId, filename });
      await uploadBufferToS3({
        bucket: appConfig.lessonsS3Bucket,
        key,
        body: fileBody,
        contentType: uploadFile.mimetype,
      });
      videoUrl = buildPublicS3Url(key);
      storageKey = key;
    }

    const lesson = {
      id: randomUUID(),
      courseId: String(courseId),
      lessonNumber: orderedNumber,
      title: title ? String(title).trim() : `Lesson ${orderedNumber}`,
      description: description ? String(description).trim() : '',
      videoFilename: filename,
      videoUrl,
      videoStorageKey: storageKey,
      mimeType: usingRemoteObject ? remoteObject.mimeType : uploadFile.mimetype,
      sizeBytes,
      sizeMB,
      durationSeconds: normalizedDuration,
      uploadedAt: new Date().toISOString(),
    };

    lessons.push(lesson);
    await writeLessons(businessKey, lessons);
    cleanupLocalFile = false;
    return lesson;
  } catch (error) {
    if (!usingRemoteObject && storageKey && appConfig.lessonsS3Bucket) {
      await deleteObjectFromS3({
        bucket: appConfig.lessonsS3Bucket,
        key: storageKey,
      }).catch(() => {});
    }
    if (!usingRemoteObject && !isS3Storage && cleanupLocalFile && uploadFile?.path) {
      await fs.unlink(uploadFile.path).catch(() => {});
    }
    throw error;
  } finally {
    if (!usingRemoteObject && isS3Storage && uploadFile?.path) {
      await fs.unlink(uploadFile.path).catch(() => {});
    }
  }
}

async function deleteLesson({ lessonId, businessName }) {
  if (!lessonId) {
    throw new Error('Lesson ID is required.');
  }
  const businessKey = resolveBusinessKey(businessName);
  const lessons = await readLessons(businessKey);
  const index = lessons.findIndex((lesson) => String(lesson.id) === String(lessonId));
  if (index === -1) {
    throw new Error('Lesson not found.');
  }
  const [removed] = lessons.splice(index, 1);

  if (removed) {
    const s3Key =
      removed.videoStorageKey || deriveS3KeyFromUrl(removed.videoUrl);
    if (s3Key && appConfig.lessonsS3Bucket) {
      await deleteObjectFromS3({
        bucket: appConfig.lessonsS3Bucket,
        key: s3Key,
      });
    } else if (removed.videoFilename) {
      const filePath = path.join(
        lessonsRoot,
        businessKey,
        String(removed.courseId),
        removed.videoFilename,
      );
      await fs.unlink(filePath).catch(() => {});
    }
  }

  await writeLessons(businessKey, lessons);
  return removed;
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

function normalizeDurationSeconds(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.round(parsed);
}

async function countLessonsByCourse(businessName) {
  const key = resolveBusinessKey(businessName);
  const lessons = await readLessons(key);
  const aggregates = new Map();
  let metadataUpdated = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const lesson of lessons) {
    if (!lesson || lesson.courseId === undefined || lesson.courseId === null) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const courseKey = String(lesson.courseId);
    const payload = aggregates.get(courseKey) || { count: 0, durationSeconds: 0 };
    payload.count += 1;

    let durationSeconds = normalizeDurationSeconds(lesson.durationSeconds || lesson.duration);
    if (!durationSeconds && lesson.videoFilename) {
      const videoPath = path.join(
        lessonsRoot,
        key,
        String(lesson.courseId),
        lesson.videoFilename,
      );
      // eslint-disable-next-line no-await-in-loop
      const detectedSeconds = await detectVideoDurationSeconds(videoPath);
      if (Number.isFinite(detectedSeconds) && detectedSeconds > 0) {
        durationSeconds = normalizeDurationSeconds(detectedSeconds);
        lesson.durationSeconds = durationSeconds;
        metadataUpdated = true;
      }
    }

    payload.durationSeconds += durationSeconds;
    aggregates.set(courseKey, payload);
  }

  if (metadataUpdated) {
    await writeLessons(key, lessons);
  }

  return aggregates;
}

module.exports = {
  lessonsRoot,
  resolveBusinessKey,
  ensureCourseDirectory,
  generateLessonFilename,
  buildS3ObjectKey,
  listLessons,
  addLesson,
  countLessonsByCourse,
  deleteLesson,
};

