const express = require('express');
const Lead = require('../models/Lead');
const { sendLeadAlert } = require('./whatsapp');

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { companyId, name, phone, email, source, message } = req.body;

    let score = 'cold';
    if (message && message.length > 50) {
      score = 'hot';
    }

    const logRetentionUntil = new Date();
    logRetentionUntil.setDate(logRetentionUntil.getDate() + 365);

    const lead = await Lead.create({
      companyId,
      name,
      phone,
      email,
      source,
      message,
      score,
      logRetentionUntil,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Trigger WhatsApp lead alert immediately
    try {
      const alert = await sendLeadAlert(lead._id);
      res.status(201).json({ ...lead.toObject(), alert });
    } catch (alertErr) {
      res.status(201).json(lead);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { companyId, status, source } = req.query;
    const filter = { companyId };

    if (status) filter.status = status;
    if (source) filter.source = source;

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { companyId } = req.query;

    const leads = await Lead.find({ companyId });

    const stats = {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      closed: leads.filter(l => l.status === 'closed').length,
      hot: leads.filter(l => l.score === 'hot').length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update-status', async (req, res) => {
  try {
    const { leadId, status } = req.body;
    const lead = await Lead.findByIdAndUpdate(leadId, { status }, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
