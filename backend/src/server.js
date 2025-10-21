const http = require('http');
const { createApp } = require('./app');
const { loadConfig } = require('./shared/env');
const { getPool } = require('./shared/database');

async function start() {
  try {
    const config = loadConfig();
    await getPool();

    const app = createApp();
    const server = http.createServer(app);

    server.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API server listening on port ${config.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
