const { Router } = require('express');
const categoryService = require('../services/course-category.service');
const { loadConfig } = require('../shared/env');

const router = Router();
const config = loadConfig();

function mergeTenantContext(body = {}, query = {}) {
  const tenantId =
    body.tenantId !== undefined && body.tenantId !== null ? body.tenantId : query.tenantId;
  const businessName =
    body.businessName !== undefined && body.businessName !== null && body.businessName !== ''
      ? body.businessName
      : query.businessName || config.defaultBusinessName || null;

  return { tenantId, businessName };
}

router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories({
      tenantId: req.query.tenantId,
      businessName: req.query.businessName || config.defaultBusinessName,
    });

    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const context = mergeTenantContext(req.body, req.query);
    const category = await categoryService.createCategory({
      ...req.body,
      ...context,
    });

    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
});

router.put('/:categoryId', async (req, res, next) => {
  try {
    const context = mergeTenantContext(req.body, req.query);
    const category = await categoryService.updateCategory(req.params.categoryId, {
      ...req.body,
      ...context,
    });

    res.json({ data: category });
  } catch (error) {
    next(error);
  }
});

router.delete('/:categoryId', async (req, res, next) => {
  try {
    const context = mergeTenantContext(req.body, req.query);
    await categoryService.deleteCategory({
      categoryId: req.params.categoryId,
      ...context,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
