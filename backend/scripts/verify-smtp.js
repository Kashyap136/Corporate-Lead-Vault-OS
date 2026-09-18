// CLI-only SMTP verification. Run with: npm run verify:smtp
// Reports SMTP connectivity from the backend environment without exposing
// credentials. Never mounted as an HTTP endpoint.

require('dotenv').config();
const { verifySmtpConnection, getSmtpConfig } = require('../mailer');

const config = getSmtpConfig();

if (!config) {
  console.log('EMAIL_SERVICE_NOT_CONFIGURED');
  console.log('Set EMAIL_SERVICE_HOST, EMAIL_SERVICE_USER and EMAIL_SERVICE_PASSWORD to verify SMTP.');
  process.exit(1);
}

console.log(`Verifying SMTP connection to ${config.host}:${config.port} ...`);

verifySmtpConnection().then(result => {
  if (result.ok) {
    console.log('SMTP connection verified OK');
    process.exit(0);
  }
  console.log(`${result.reason}: ${result.message || 'connection failed'}`);
  process.exit(1);
});