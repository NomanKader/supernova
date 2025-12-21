const path = require('path');
const { Router } = require('express');
const multer = require('multer');

const {
  ensureProofStorage,
  getProofsDirectory,
  createManualEnrollmentRequest,
  listManualEnrollmentRequests,
  reviewManualEnrollmentRequest,
} = require('../services/enrollment-request.service');

const router = Router();
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function sanitizeFileName(name) {
  const base = path.parse(name).name || 'receipt';
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'receipt';
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureProofStorage()
      .then(() => cb(null, getProofsDirectory()))
      .catch((error) => cb(error));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const safeName = sanitizeFileName(file.originalname);
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'proof'));
      return;
    }
    cb(null, true);
  },
});

router.get('/manual', async (req, res, next) => {
  try {
    const { status, search, businessName, tenantId, learnerEmail, userId } = req.query;
    const response = await listManualEnrollmentRequests({
      status,
      search,
      businessName,
      tenantId,
      learnerEmail,
      userId,
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/manual', upload.single('proof'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Payment proof upload is required.' });
    }

    const proofUrl = `/assets/enrollment-proofs/${req.file.filename}`;
    const payload = {
      ...req.body,
      proofUrl,
      proofFilename: req.file.filename,
    };

    const record = await createManualEnrollmentRequest(payload);
    res.status(201).json({ data: record });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

router.patch('/manual/:requestId/review', async (req, res, next) => {
  try {
    const updated = await reviewManualEnrollmentRequest(req.params.requestId, req.body);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
