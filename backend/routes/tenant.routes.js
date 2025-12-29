const { Router } = require('express');
const tenantService = require('../services/tenant.service');

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const tenants = await tenantService.listTenants();
    res.json({ data: tenants });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const tenant = await tenantService.createTenant(req.body);
    res.status(201).json({ data: tenant });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
