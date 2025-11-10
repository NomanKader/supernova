const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getPool } = require('../shared/database');
const { loadConfig } = require('../shared/env');
const { sendMail } = require('../shared/mailer');
const { mapUserEntity } = require('../shared/mappers/user.mapper');

const TOKEN_BYTES = 32;

function buildInviteLink(token, appUrl) {
  const normalizedBase = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  return `${normalizedBase}/account/verify?token=${token}`;
}

function formatRole(role) {
  if (!role) {
    return null;
  }

  return String(role)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildInviteEmail({ user, tenantName, inviteLink }) {
  const displayRole = formatRole(user.role);
  const safeInviteLink = String(inviteLink || '').trim();
  const subject = `Verify your ${tenantName} access on Supernova LMS`;
  const roleText = displayRole ? `You're being invited with the role: ${displayRole}.

` : '';
  const text = `Hello ${user.name || user.email},

You've been invited to join ${tenantName} on Supernova LMS.

${roleText}Use the link below to verify your account and set your password:
${safeInviteLink}

If the link above doesn't work, copy and paste it into your browser.

If you weren't expecting this, you can ignore the email.

Best regards,
Supernova LMS Team`;

  const htmlRoleLine = displayRole
    ? `<p>You're being invited with the role: <strong>${displayRole}</strong>.</p>`
    : '';

  const html = `
    <p>Hello ${user.name || user.email},</p>
    <p>You've been invited to join <strong>${tenantName}</strong> on Supernova LMS.</p>
    ${htmlRoleLine}
    <p>Use the button below to verify your account and set your password:</p>
    <p>
      <a href="${safeInviteLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:4px;text-decoration:none;" target="_blank" rel="noopener noreferrer">
        Verify account
      </a>
    </p>
    <p>If the button doesn't work, copy and paste this URL into your browser:</p>
    <p><a href="${safeInviteLink}" target="_blank" rel="noopener noreferrer">${safeInviteLink}</a></p>
    <p>Best regards,<br/>Supernova LMS Team</p>
  `;

  return { subject, text, html };
}

async function createInvite({ tenantId, user, sendEmail }) {
  const config = loadConfig();
  const pool = await getPool();

  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + config.inviteExpiryHours * 60 * 60 * 1000);

  const request = pool.request();
  request.input('TenantId', tenantId);
  request.input('UserId', user.id);
  request.input('Token', token);
  request.input('ExpiresAt', expiresAt);

  await request.query(`
    INSERT INTO UserInvites (TenantId, UserId, Token, ExpiresAt)
    VALUES (@TenantId, @UserId, @Token, @ExpiresAt);
  `);

  if (sendEmail) {
    const inviteLink = buildInviteLink(token, config.appUrl);
    const { subject, text, html } = buildInviteEmail({
      user,
      tenantName: user.businessName || config.defaultBusinessName || 'Supernova',
      inviteLink,
    });

    await sendMail({
      to: user.email,
      subject,
      text,
      html,
    });
  }

  return {
    token,
    expiresAt,
  };
}

async function findInvite(token) {
  if (!token || typeof token !== 'string') {
    const error = new Error('Invitation token is required.');
    error.statusCode = 400;
    throw error;
  }

  const pool = await getPool();
  const request = pool.request();
  request.input('Token', token.trim());

  const result = await request.query(`
    SELECT TOP (1)
      i.InviteId,
      i.TenantId AS InviteTenantId,
      i.UserId AS InviteUserId,
      i.Token,
      i.ExpiresAt,
      i.ConsumedAt,
      i.CreatedAt,
      u.UserId,
      u.TenantId AS UserTenantId,
      t.BusinessName,
      u.Email,
      u.FirstName,
      u.LastName,
      u.Role,
      u.Status,
      u.CreatedAt AS UserCreatedAt,
      u.UpdatedAt AS UserUpdatedAt
    FROM UserInvites i
    INNER JOIN Users u ON i.UserId = u.UserId
    INNER JOIN Tenants t ON i.TenantId = t.TenantId
    WHERE i.Token = @Token;
  `);

  const record = result.recordset[0];
  if (!record) {
    const error = new Error('Invitation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (record.ConsumedAt) {
    const error = new Error('Invitation has already been used.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const expiresAt = new Date(record.ExpiresAt);
  if (expiresAt < now) {
    const error = new Error('Invitation has expired.');
    error.statusCode = 400;
    throw error;
  }

  return {
    inviteId: record.InviteId,
    tenantId: record.InviteTenantId,
    userId: record.InviteUserId,
    token: record.Token,
    expiresAt,
    user: mapUserEntity({
      UserId: record.UserId,
      TenantId: record.UserTenantId,
      BusinessName: record.BusinessName,
      Email: record.Email,
      FirstName: record.FirstName,
      LastName: record.LastName,
      Role: record.Role,
      Status: record.Status,
      CreatedAt: record.UserCreatedAt,
      UpdatedAt: record.UserUpdatedAt,
    }),
  };
}

async function acceptInvite({ token, password }) {
  if (!password || typeof password !== 'string' || password.trim().length < 8) {
    const error = new Error('Password must be at least 8 characters.');
    error.statusCode = 400;
    throw error;
  }

  const invite = await findInvite(token);
  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const pool = await getPool();
  const request = pool.request();
  request.input('InviteId', invite.inviteId);
  request.input('UserId', invite.userId);
  request.input('PasswordHash', hashedPassword);

  await request.query(`
    UPDATE Users
    SET PasswordHash = @PasswordHash,
        Status = 'active',
        UpdatedAt = SYSDATETIMEOFFSET()
    WHERE UserId = @UserId;

    UPDATE UserInvites
    SET ConsumedAt = SYSDATETIMEOFFSET()
    WHERE InviteId = @InviteId;
  `);

  return invite.user;
}

module.exports = {
  createInvite,
  findInvite,
  acceptInvite,
};
