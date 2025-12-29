const { Router } = require('express');
const { loadConfig } = require('../shared/env');
const userService = require('../services/user.service');
const inviteService = require('../services/invite.service');

const router = Router();
const config = loadConfig();

router.get('/', async (req, res, next) => {
  try {
    const users = await userService.listUsers({
      tenantId: req.query.tenantId,
      businessName: req.query.businessName || config.defaultBusinessName,
    });

    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await userService.createUser({
      ...req.body,
      tenantId: req.body.tenantId,
      businessName: req.body.businessName || config.defaultBusinessName,
    });

    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.get('/invites/:token', async (req, res, next) => {
  try {
    const invite = await inviteService.findInvite(req.params.token);
    res.json({
      data: {
        token: invite.token,
        expiresAt: invite.expiresAt,
        user: {
          id: invite.user.id,
          email: invite.user.email,
          name: invite.user.name,
          businessName: invite.user.businessName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/invites/accept', async (req, res, next) => {
  try {
    const user = await inviteService.acceptInvite({
      token: req.body.token,
      password: req.body.password,
    });

    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:userId', async (req, res, next) => {
  try {
    await userService.deleteUser({
      userId: req.params.userId,
      tenantId: req.query.tenantId,
      businessName: req.query.businessName || config.defaultBusinessName,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
