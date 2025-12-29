const { Router } = require('express');
const { submitContactMessage } = require('../services/contact.service');

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const result = await submitContactMessage(req.body);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
