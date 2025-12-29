const sql = require('mssql');
const { loadConfig } = require('./env');

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    const config = loadConfig();

    poolPromise = sql.connect({
      user: config.dbUser,
      password: config.dbPassword,
      server: config.dbHost,
      database: config.dbName,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    });
  }

  return poolPromise;
}

module.exports = {
  getPool,
};
