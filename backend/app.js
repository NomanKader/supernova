const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { loadConfig } = require('./shared/env');

const { notFoundHandler, errorHandler } = require('./middleware/error-handlers');
const apiRouter = require('./routes');

function createApp() {
  const app = express();
  const config = loadConfig();
  const defaultLocalOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const allowedOrigins = Array.from(
    new Set([config.appUrl, ...defaultLocalOrigins].filter(Boolean)),
  );
  const corsOptions = {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
