const express = require('express');
const SEOreport = require('../models/SEOreport');

const router = express.Router();

router.get('/report', async (req, res) => {
  try {
    const competitorDomains = ['competitor1.com', 'competitor2.com', 'competitor3.com'];

    const keywords = [
      { keyword: 'solar panel manufacturer', position: 4, competitorPosition: 1 },
      { keyword: 'industrial automation india', position: 7, competitorPosition: 2 },
      { keyword: 'energy audit services', position: 12, competitorPosition: 3 },
      { keyword: 'factory automation solutions', position: 5, competitorPosition: 1 },
      { keyword: 'power optimization india', position: 15, competitorPosition: 8 },
      { keyword: 'solar installation mumbai', position: 3, competitorPosition: 5 },
      { keyword: 'industrial solar panels', position: 8, competitorPosition: 4 },
      { keyword: 'energy saving solutions', position: 11, competitorPosition: 6 },
      { keyword: 'green energy solutions india', position: 6, competitorPosition: 2 },
      { keyword: 'solar energy company', position: 9, competitorPosition: 3 }
    ];

    const report = await SEOreport.create({
      companyId: req.companyId,
      domain: 'yourcompany.com',
      competitorDomains,
      rankingKeywords: keywords,
      generatedAt: new Date()
    });

    res.json(report);
  } catch (err) {
    console.error('[seo.report]', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
