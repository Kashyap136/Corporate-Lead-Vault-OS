const mongoose = require('mongoose');

const SEOreportSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  domain: { type: String },
  competitorDomains: [String],
  rankingKeywords: [{
    keyword: String,
    position: Number,
    competitorPosition: Number
  }],
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SEOreport', SEOreportSchema);
