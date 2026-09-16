const express = require('express');
const ROIcalc = require('../models/ROIcalc');
const Lead = require('../models/Lead');

const router = express.Router();

router.post('/calculate', async (req, res) => {
  try {
    const { companyId, factoryArea, powerBill, manpower, currentCost, name, phone, email } = req.body;

    const savings = factoryArea * 0.2 + powerBill * 0.15;
    const roiPercent = currentCost > 0 ? (savings / currentCost) * 100 : 0;

    let leadId = null;
    if (companyId && name && phone) {
      const logRetentionUntil = new Date();
      logRetentionUntil.setDate(logRetentionUntil.getDate() + 365);

      const message = `ROI Calculator: Factory Area=${factoryArea}, Power Bill=${powerBill}, Manpower=${manpower}`;
      const score = message.length > 50 ? 'hot' : 'cold';

      const lead = await Lead.create({
        companyId,
        name,
        phone,
        email: email || '',
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
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { companyId } = req.query;
    const rois = await ROIcalc.find({ companyId }).sort({ createdAt: -1 });
    res.json(rois);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
