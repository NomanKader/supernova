const { Router } = require('express');

const { loadConfig } = require('../shared/env');
const customerService = require('../services/customer.service');

const router = Router();
const config = loadConfig();

router.get('/', async (req, res, next) => {
  try {
    const customers = await customerService.listCustomers({
      tenantId: req.query.tenantId,
      businessName: req.query.businessName || config.defaultBusinessName,
      search: req.query.search || null,
    });

    res.json({ data: customers });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer({
      ...req.body,
      tenantId: req.body.tenantId,
      businessName: req.body.businessName || config.defaultBusinessName,
    });

    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.get('/:customerId', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomer({
      customerId: req.params.customerId,
      tenantId: req.query.tenantId,
      businessName: req.query.businessName || config.defaultBusinessName,
    });

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.put('/:customerId', async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.customerId, {
      ...req.body,
      tenantId: req.body.tenantId || req.query.tenantId,
      businessName:
        req.body.businessName || req.query.businessName || config.defaultBusinessName,
    });

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

router.delete('/:customerId', async (req, res, next) => {
  try {
    await customerService.deleteCustomer({
      customerId: req.params.customerId,
      tenantId: req.query.tenantId,
      businessName: req.query.businessName || config.defaultBusinessName,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
