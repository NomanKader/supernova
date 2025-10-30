const { Router } = require('express');
const { authenticateAdmin } = require('../services/auth.service');

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

module.exports = router;
