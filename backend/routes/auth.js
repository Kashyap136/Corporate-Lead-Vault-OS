const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, subdomain, ownerEmail, password, websiteUrl } = req.body;

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
      websiteUrl
    });

    const token = jwt.sign({ companyId: company._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, company: { id: company._id, name: company.name, subdomain: company.subdomain } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/company', async (req, res) => {
  try {
    const { subdomain } = req.query;
    const company = await Company.findOne({ subdomain });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ id: company._id, name: company.name, subdomain: company.subdomain });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { subdomain, email, password } = req.body;

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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
