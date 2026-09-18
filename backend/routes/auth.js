const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Company = require('../models/Company');
const mailer = require('../mailer');

const router = express.Router();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const PASSWORD_MIN_LENGTH = 6;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidSubdomain(value) {
  if (typeof value !== 'string' || value.length < 3 || value.length > 30) return false;
  if (!/^[a-z0-9-]+$/.test(value)) return false;
  return value[0] !== '-' && value[value.length - 1] !== '-';
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname;
  } catch (err) {
    return false;
  }
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const subdomain = String(req.body.subdomain || '').trim().toLowerCase();
    const ownerEmail = String(req.body.ownerEmail || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const websiteUrl = String(req.body.websiteUrl || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!isValidSubdomain(subdomain)) {
      return res.status(400).json({ error: 'Subdomain must be 3-30 characters using lowercase letters, numbers, and hyphens (no leading or trailing hyphen)' });
    }
    if (!isValidEmail(ownerEmail)) {
      return res.status(400).json({ error: 'A valid owner email is required' });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
    }
    if (websiteUrl && !isValidUrl(websiteUrl)) {
      return res.status(400).json({ error: 'Website URL is invalid' });
    }

    const existing = await Company.findOne({ subdomain });
    if (existing) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const company = await Company.create({
      name,
      subdomain,
      ownerEmail,
      passwordHash,
      websiteUrl: websiteUrl || undefined
    });

    const token = jwt.sign({ companyId: company._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, company: { id: company._id, name: company.name, subdomain: company.subdomain } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }
    console.error('[register]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/company', async (req, res) => {
  try {
    const subdomain = String(req.query.subdomain || '').trim().toLowerCase();
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain is required' });
    }
    const company = await Company.findOne({ subdomain });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ id: company._id, name: company.name, subdomain: company.subdomain });
  } catch (err) {
    console.error('[company]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const subdomain = String(req.body.subdomain || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!subdomain || !email || !password) {
      return res.status(400).json({ error: 'Subdomain, email and password are required' });
    }

    const company = await Company.findOne({ subdomain, ownerEmail: email });
    if (!company) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, company.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ companyId: company._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, company: { id: company._id, name: company.name, subdomain: company.subdomain } });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const company = await Company.findOne({ ownerEmail: email });

    if (company) {
      const now = new Date();
      const hasActiveToken =
        company.passwordResetTokenHash &&
        company.passwordResetExpiresAt &&
        company.passwordResetExpiresAt > now;

      if (!hasActiveToken) {
        // Cryptographically secure random token; only its hash is stored.
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);

        await Company.updateOne(
          { _id: company._id },
          { $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt } }
        );

        // Delivery is attempted only if an email provider is configured.
        const mailResult = await mailer.sendPasswordResetEmail(email, rawToken);
        console.log('[forgot-password] reset email delivery:', mailResult.reason);
      }
      // Otherwise an active, unexpired token already exists — it is not
      // overwritten, which limits repeated reset-token generation.
    }

    // Generic response for both existing and non-existing accounts.
    res.json({ message: 'If an account exists for this email, password reset instructions have been sent.' });
  } catch (err) {
    console.error('[forgot-password]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const passwordHash = await bcrypt.hash(password, 10);

    // Atomic single-use consumption: the reset fields are cleared in the same
    // operation that applies the new password, so a token cannot be reused.
    const company = await Company.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() }
      },
      {
        $set: { passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 }
      },
      { new: true }
    );

    if (!company) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Password has been reset. You can now sign in with your new password.' });
  } catch (err) {
    console.error('[reset-password]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;