const express = require('express');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { sendLeadAlert } = require('./whatsapp');

const router = express.Router();

const LEAD_SOURCES = ['ROIcalc', 'Form', 'Google', 'WhatsApp'];
const LEAD_STATUSES = ['new', 'contacted', 'proposal', 'closed'];

router.post('/create', async (req, res) => {
  try {
    const { name, phone, email, source, message } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ error: 'Phone is required' });
    }
    if (!source || !LEAD_SOURCES.includes(source)) {
      return res.status(400).json({ error: 'Source must be one of: ROIcalc, Form, Google, WhatsApp' });
    }

    let score = 'cold';
    if (message && String(message).length > 50) {
      score = 'hot';
    }

    const logRetentionUntil = new Date();
    logRetentionUntil.setDate(logRetentionUntil.getDate() + 365);

    const lead = await Lead.create({
      companyId: req.companyId,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : '',
      source,
      message: message ? String(message) : '',
      score,
      logRetentionUntil,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Send WhatsApp lead alert immediately (result is included in the response).
    let alert = null;
    try {
      alert = await sendLeadAlert(lead._id);
    } catch (alertErr) {
      alert = { whatsappStatus: 'failed' };
    }
    res.status(201).json({ ...lead.toObject(), alert });
  } catch (err) {
    console.error('[leads.create]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { status, source } = req.query;
    const filter = { companyId: req.companyId };

    if (status) {
      if (!LEAD_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status filter' });
      }
      filter.status = status;
    }
    if (source) {
      if (!LEAD_SOURCES.includes(source)) {
        return res.status(400).json({ error: 'Invalid source filter' });
      }
      filter.source = source;
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error('[leads.list]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const leads = await Lead.find({ companyId: req.companyId });

    const stats = {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      closed: leads.filter(l => l.status === 'closed').length,
      hot: leads.filter(l => l.score === 'hot').length
    };

    res.json(stats);
  } catch (err) {
    console.error('[leads.stats]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update-status', async (req, res) => {
  try {
    const { leadId, status } = req.body;

    if (!leadId || !mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ error: 'Invalid lead id' });
    }
    if (!status || !LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, companyId: req.companyId },
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (err) {
    console.error('[leads.update-status]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;