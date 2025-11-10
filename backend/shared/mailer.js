const nodemailer = require('nodemailer');
const { loadConfig } = require('./env');

let cachedTransporter;
let cachedConfig;

function getMailerConfig() {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

function getTransporter() {
  if (cachedTransporter !== undefined) {
    return cachedTransporter;
  }

  const config = getMailerConfig();
  if (!config.smtpHost || !config.smtpUser || !config.smtpPassword) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort || 587,
    secure: Boolean(config.smtpSecure),
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });

  return cachedTransporter;
}

async function sendMail(options) {
  const transporter = getTransporter();
  const config = getMailerConfig();

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn(
      '[mailer] SMTP not configured. Email not sent. Message preview:',
      JSON.stringify(
        {
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        },
        null,
        2,
      ),
    );
    return {
      accepted: [],
      rejected: [],
      pending: [],
      previewOnly: true,
    };
  }

  const message = {
    from: config.smtpFrom || config.smtpUser,
    ...options,
  };

  return transporter.sendMail(message);
}

module.exports = {
  sendMail,
};
