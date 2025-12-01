const { Router } = require('express');
const { authenticateAdmin, authenticateUser } = require('../services/auth.service');
const { verifyGoogleCredential } = require('../services/google-auth.service');

const router = Router();

router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password, tenantId, businessName } = req.body || {};
    const result = await authenticateAdmin({ email, password, tenantId, businessName });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, tenantId, businessName } = req.body || {};
    const result = await authenticateUser({ email, password, tenantId, businessName });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body || {};
    const profile = await verifyGoogleCredential(credential);

    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
