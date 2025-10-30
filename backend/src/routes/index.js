const { Router } = require('express');

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'supernova-backend', version: '1.0.0' });
});

router.use('/auth', require('./auth.routes'));
router.use('/course-categories', require('./course-category.routes'));
router.use('/courses', require('./course.routes'));
router.use('/lessons', require('./lesson.routes'));
router.use('/tenants', require('./tenant.routes'));
router.use('/users', require('./user.routes'));

module.exports = router;
