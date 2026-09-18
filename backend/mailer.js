const nodemailer = require('nodemailer');

// SMTP email delivery for password reset.
// Configuration comes from environment variables only:
//   EMAIL_SERVICE_HOST, EMAIL_SERVICE_USER, EMAIL_SERVICE_PASSWORD
//   EMAIL_SERVICE_PORT (default 587), EMAIL_SERVICE_SECURE (default false)
//   EMAIL_FROM (optional override; defaults to EMAIL_SERVICE_USER)
//   FRONTEND_URL (base URL used to build the reset link)
// Credentials are never hardcoded and never exposed to clients.

function getSmtpConfig() {
  const host = process.env.EMAIL_SERVICE_HOST;
  const user = process.env.EMAIL_SERVICE_USER;
  const pass = process.env.EMAIL_SERVICE_PASSWORD;

  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.EMAIL_SERVICE_PORT) || 587,
    secure: String(process.env.EMAIL_SERVICE_SECURE).toLowerCase() === 'true',
    auth: { user, pass }
  };
}

// Supports a comma-separated FRONTEND_URL list (used for CORS origins);
// the first entry is used for the reset link.
function getFrontendBaseUrl() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:3000';
  const first = String(raw).split(',')[0].trim().replace(/\/+$/, '');
  if (!process.env.FRONTEND_URL) {
    console.log('[Email] FRONTEND_URL not set; using http://localhost:3000 for reset links');
  }
  return first;
}

function createTransporter() {
  const config = getSmtpConfig();
  if (!config) return null;
  return nodemailer.createTransport(config);
}

function buildResetUrl(resetToken) {
  const base = getFrontendBaseUrl();
  const token = encodeURIComponent(resetToken);
  return `${base}/reset-password?token=${token}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailContent(resetUrl) {
  const safeUrl = escapeHtml(resetUrl);
  const text = [
    'Corporate Lead Vault OS',
    '',
    'Password Reset Request',
    '',
    'We received a request to reset the password for your Corporate Lead Vault OS account.',
    '',
    'Reset your password by opening the link below:',
    resetUrl,
    '',
    'This link expires in 1 hour.',
    '',
    'If you did not request a password reset, you can safely ignore this email.',
    ''
  ].join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:540px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;">
        <tr>
          <td style="padding:24px 28px 8px 28px;">
            <h2 style="margin:0;color:#0f172a;font-size:20px;">Corporate Lead Vault OS</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 8px 28px;">
            <h3 style="margin:0;color:#0f172a;font-size:16px;">Password Reset Request</h3>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 8px 28px;color:#334155;font-size:14px;line-height:1.6;">
            We received a request to reset the password for your Corporate Lead Vault OS account.
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 8px 28px;">
            <a href="${safeUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:6px;">Reset Password</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 8px 28px;color:#334155;font-size:14px;line-height:1.6;">
            If the button above does not work, copy and paste this link into your browser:
            <br /><a href="${safeUrl}" style="color:#2563eb;word-break:break-all;">${safeUrl}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 8px 28px;color:#64748b;font-size:13px;line-height:1.6;">
            This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 24px 28px;color:#94a3b8;font-size:12px;border-top:1px solid #f1f5f9;">
            Corporate Lead Vault OS
          </td>
        </tr>
      </table>
    </div>
  `;

  return { text, html };
}

// Sends the password-reset email. Resolves with { sent: true } only when the
// SMTP transport accepts the message. Never logs the raw reset token.
function sendPasswordResetEmail(recipient, resetToken) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('[Email] Password reset delivery skipped: SMTP not configured');
    return Promise.resolve({ sent: false, reason: 'EMAIL_SERVICE_NOT_CONFIGURED' });
  }

  const resetUrl = buildResetUrl(resetToken);
  const { text, html } = buildEmailContent(resetUrl);
  const from = process.env.EMAIL_FROM
    || `"Corporate Lead Vault OS" <${process.env.EMAIL_SERVICE_USER}>`;

  const mailOptions = {
    from,
    to: recipient,
    subject: 'Corporate Lead Vault OS — Password Reset Request',
    text,
    html
  };

  return transporter.sendMail(mailOptions).then(
    () => ({ sent: true, reason: 'SENT' }),
    (err) => {
      console.error('[Email] Password reset delivery failed:', err && err.message);
      return { sent: false, reason: 'EMAIL_TRANSPORT_ERROR' };
    }
  );
}

// Verifies SMTP connectivity without exposing credentials. Used only by the
// CLI verification script (scripts/verify-smtp.js), never by a public API.
function verifySmtpConnection() {
  const transporter = createTransporter();

  if (!transporter) {
    return Promise.resolve({ ok: false, reason: 'EMAIL_SERVICE_NOT_CONFIGURED', message: '' });
  }

  return transporter.verify().then(
    () => ({ ok: true, reason: 'OK', message: '' }),
    (err) => ({ ok: false, reason: 'EMAIL_TRANSPORT_ERROR', message: err && err.message })
  );
}

module.exports = { sendPasswordResetEmail, verifySmtpConnection, getSmtpConfig };