const express = require('express');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const Lead = require('../models/Lead');

const router = express.Router();

router.get('/export', async (req, res) => {
  try {
    const rawYear = req.query.year;
    const targetYear = rawYear ? Number(rawYear) : 2026;

    if (!Number.isInteger(targetYear) || targetYear < 2000 || targetYear > 2100) {
      return res.status(400).json({ error: 'Invalid year. Provide a four-digit year between 2000 and 2100.' });
    }

    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59`);

    const leads = await Lead.find({
      companyId: req.companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Audit Export');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'DPDP Retention Until', key: 'retention', width: 22 }
    ];

    leads.forEach(lead => {
      worksheet.addRow({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        score: lead.score,
        status: lead.status,
        date: lead.createdAt ? lead.createdAt.toISOString().split('T')[0] : '',
        retention: lead.logRetentionUntil ? lead.logRetentionUntil.toISOString().split('T')[0] : ''
      });
    });

    const exportDir = path.join(__dirname, '..', 'public', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const fileName = `audit-${targetYear}.xlsx`;
    const filePath = path.join(exportDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    res.json({
      fileUrl: `/exports/${fileName}`,
      totalLeads: leads.length,
      year: targetYear
    });
  } catch (err) {
    console.error('[audit.export]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;