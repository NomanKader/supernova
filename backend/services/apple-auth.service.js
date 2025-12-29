const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { loadConfig } = require('../shared/env');

let cachedClient;

function getAppleJwksClient() {
  if (!cachedClient) {
    cachedClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 24 * 60 * 60 * 1000,
    });
  }
  return cachedClient;
}

async function verifyAppleIdentityToken(identityToken) {
  if (!identityToken) {
    throw new Error('Apple identity token is required.');
  }
  const config = loadConfig();
  if (!config.appleClientId) {
    throw new Error('APPLE_CLIENT_ID must be configured for Sign in with Apple.');
  }

  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded?.header?.kid) {
    throw new Error('Invalid Apple identity token.');
  }

  const client = getAppleJwksClient();
  const key = await client.getSigningKey(decoded.header.kid);
  const publicKey = key.getPublicKey();

  const payload = jwt.verify(identityToken, publicKey, {
    audience: config.appleClientId,
    issuer: 'https://appleid.apple.com',
  });

  const composedName = payload?.name
    || [payload?.given_name, payload?.family_name].filter(Boolean).join(' ').trim()
    || payload?.email
    || null;

  return {
    userId: payload?.sub || null,
    email: payload?.email || null,
    emailVerified: payload?.email_verified ?? null,
    name: composedName,
    firstName: payload?.given_name || null,
    lastName: payload?.family_name || null,
    provider: 'apple',
  };
}

module.exports = {
  verifyAppleIdentityToken,
};
