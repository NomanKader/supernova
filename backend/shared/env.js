const dotenv = require('dotenv');

let cachedConfig;

function loadConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  dotenv.config();

  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const parseNumber = (value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const normalizeString = (value) => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const isProductionApp = String(process.env.VITE_APP_IS_PRODUCTION)
    .toLowerCase()
    .trim() === 'true';

  const localAppUrl = normalizeString(process.env.APP_LOCAL_URL) || 'http://localhost:3000';
  const productionAppUrl = normalizeString(process.env.APP_URL);
  const resolvedAppUrl = isProductionApp
    ? productionAppUrl || localAppUrl
    : localAppUrl;

  cachedConfig = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    defaultBusinessName: process.env.DEFAULT_TENANT_BUSINESS || null,
    appUrl: resolvedAppUrl,
    isProductionApp,
    smtpHost: process.env.SMTP_HOST || null,
    smtpPort: parseNumber(process.env.SMTP_PORT),
    smtpSecure: process.env.SMTP_SECURE
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : null,
    smtpUser: process.env.SMTP_USER || null,
    smtpPassword: process.env.SMTP_PASSWORD || null,
    smtpFrom: process.env.SMTP_FROM || null,
    supportEmail: normalizeString(process.env.SUPPORT_EMAIL) || 'support@edusupernova.com',
    inviteExpiryHours: parseInt(process.env.INVITE_EXPIRY_HOURS, 10) || 72,
    googleClientId: normalizeString(process.env.GOOGLE_CLIENT_ID) || null,
  };

  return cachedConfig;
}

module.exports = {
  loadConfig,
};
