const { OAuth2Client } = require('google-auth-library');

const { loadConfig } = require('../shared/env');

let cachedClient = null;

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = loadConfig();
  if (!config.googleClientId) {
    throw buildError('Google sign-in is not configured.', 503);
  }

  cachedClient = new OAuth2Client(config.googleClientId);
  return cachedClient;
}

async function verifyGoogleCredential(credential) {
  if (!credential || typeof credential !== 'string') {
    throw buildError('Google credential is required.', 400);
  }

  const config = loadConfig();
  if (!config.googleClientId) {
    throw buildError('Google sign-in is unavailable.', 503);
  }

  const client = getClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: config.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw buildError('Unable to read Google account profile.', 502);
  }

  if (payload.email_verified === false) {
    throw buildError('Google account email is not verified.', 403);
  }

  const normalizedName = [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim();

  return {
    subject: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified !== false,
    name: payload.name || normalizedName || payload.email,
    firstName: payload.given_name || null,
    lastName: payload.family_name || null,
    picture: payload.picture || null,
    locale: payload.locale || null,
  };
}

module.exports = {
  verifyGoogleCredential,
};
