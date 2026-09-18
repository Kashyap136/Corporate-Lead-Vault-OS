const express = require('express');
const mongoose = require('mongoose');
const ROIcalc = require('../models/ROIcalc');
const Lead = require('../models/Lead');
const Company = require('../models/Company');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/calculate', optionalAuth, async (req, res) => {
  try {
    const factoryArea = Number(req.body.factoryArea);
    const powerBill = Number(req.body.powerBill);
    const manpower = Number(req.body.manpower);
    const currentCost = Number(req.body.currentCost);

    if (![factoryArea, powerBill, manpower, currentCost].every(Number.isFinite)) {
      return res.status(400).json({ error: 'Factory area, power bill, manpower and current cost are required numeric inputs' });
    }

    // Authenticated callers use their own identity; anonymous public callers
    // (public calculator) supply the target company id.
    const companyId = req.companyId || String(req.body.companyId || '');
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({ error: 'Company is required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({ error: 'Company not found' });
    }

    const savings = factoryArea * 0.2 + powerBill * 0.15;
    const roiPercent = currentCost > 0 ? (savings / currentCost) * 100 : 0;

    let leadId = null;
    const name = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();

    if (companyId && name && phone) {
      const logRetentionUntil = new Date();
      logRetentionUntil.setDate(logRetentionUntil.getDate() + 365);

      const message = `ROI Calculator: Factory Area=${factoryArea}, Power Bill=${powerBill}, Manpower=${manpower}`;
      const score = message.length > 50 ? 'hot' : 'cold';

      const lead = await Lead.create({
        companyId,
        name,
        phone,
        email: req.body.email ? String(req.body.email).trim() : '',
        source: 'ROIcalc',
        message,
        score,
        logRetentionUntil,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      leadId = lead._id;
    }

    const roi = await ROIcalc.create({
      companyId,
      inputs: { factoryArea, powerBill, manpower, currentCost },
      result: { savings, roiPercent },
      leadId
    });

    res.status(201).json({ roi, savings, roiPercent, leadId });
  } catch (err) {
    console.error('[roi.calculate]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/list', requireAuth, async (req, res) => {
  try {
    const rois = await ROIcalc.find({ companyId: req.companyId }).sort({ createdAt: -1 });
    res.json(rois);
  } catch (err) {
    console.error('[roi.list]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;