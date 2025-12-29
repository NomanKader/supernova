const { Router } = require('express');

const {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../services/assessment-question.service');
const {
  listAttempts,
  recordAttempt,
} = require('../services/assessment-attempt.service');

const router = Router();

router.get('/questions', async (req, res, next) => {
  try {
    const questions = await listQuestions({
      businessName: req.query.businessName,
      courseId: req.query.courseId,
    });
    res.json({ data: questions });
  } catch (error) {
    next(error);
  }
});

router.post('/questions', async (req, res, next) => {
  try {
    const question = await createQuestion(req.body || {});
    res.status(201).json({ data: question });
  } catch (error) {
    next(error);
  }
});

router.put('/questions/:questionId', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      businessName: (req.body && req.body.businessName) || req.query.businessName,
    };
    const updated = await updateQuestion(req.params.questionId, payload);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/questions/:questionId', async (req, res, next) => {
  try {
    const removed = await deleteQuestion(req.params.questionId, {
      businessName: req.query.businessName || (req.body && req.body.businessName),
    });
    res.json({ data: removed });
  } catch (error) {
    next(error);
  }
});

router.get('/attempts', async (req, res, next) => {
  try {
    const attempts = await listAttempts({
      businessName: req.query.businessName,
      tenantId: req.query.tenantId,
      courseId: req.query.courseId,
      learnerEmail: req.query.learnerEmail,
      userId: req.query.userId,
    });
    res.json({ data: attempts });
  } catch (error) {
    next(error);
  }
});

router.post('/attempts', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      businessName: req.body?.businessName || req.query.businessName,
    };
    const attempt = await recordAttempt(payload);
    res.status(201).json({ data: attempt });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
