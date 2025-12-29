const { loadConfig } = require('../shared/env');
const { sendMail } = require('../shared/mailer');

const config = loadConfig();
const SUPPORT_EMAIL = config.supportEmail || 'support@edusupernova.com';

const HTML_ESCAPE_REGEX = /[&<>"']/g;
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function escapeHtml(value = '') {
  return value.replace(HTML_ESCAPE_REGEX, (match) => HTML_ESCAPE_MAP[match] || match);
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePayload(payload = {}) {
  const errors = [];

  const name = normalizeString(payload.name);
  if (!name || name.length < 2) {
    errors.push('Full name is required.');
  }

  const email = normalizeString(payload.email).toLowerCase();
  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  const subject = normalizeString(payload.subject);
  if (!subject || subject.length < 2) {
    errors.push('Subject is required.');
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message || message.length < 10) {
    errors.push('Message should be at least 10 characters.');
  }

  if (errors.length) {
    throw buildError(errors.join(' '), 400);
  }

  return {
    name,
    email,
    subject,
    message,
  };
}

function toHtmlParagraphs(text) {
  return escapeHtml(text).replace(/\r?\n/g, '<br />');
}

async function submitContactMessage(payload = {}) {
  const { name, email, subject, message } = validatePayload(payload);

  const emailSubject = `[Contact] ${subject}`;
  const plainText = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  const htmlBody = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong><br />${toHtmlParagraphs(message)}</p>
  `;

  try {
    await sendMail({
      to: SUPPORT_EMAIL,
      replyTo: `${name} <${email}>`,
      subject: emailSubject,
      text: plainText,
      html: htmlBody,
    });
  } catch (error) {
    const notifyError = buildError(
      'Unable to send your message at this time. Please try again later.',
      502,
    );
    notifyError.cause = error;
    throw notifyError;
  }

  return {
    sentTo: SUPPORT_EMAIL,
    submittedAt: new Date().toISOString(),
  };
}

module.exports = {
  submitContactMessage,
};
