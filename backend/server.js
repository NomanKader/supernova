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

    // ✅ Prefer IIS/iisnode port if available
    const port =
      process.env.IISNODE_VERSION
        ? process.env.PORT
        : (process.env.PORT || config.port || 5000);

    server.listen(port, () => {
      console.log(`✅ API server listening on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
