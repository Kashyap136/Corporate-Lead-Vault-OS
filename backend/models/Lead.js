const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  source: { type: String, enum: ['ROIcalc', 'Form', 'Google', 'WhatsApp'], required: true },
  message: { type: String },
  score: { type: String, enum: ['hot', 'warm', 'cold'], default: 'cold' },
  status: { type: String, enum: ['new', 'contacted', 'proposal', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
  logRetentionUntil: { type: Date },
  ip: { type: String },
  userAgent: { type: String }
});

module.exports = mongoose.model('Lead', LeadSchema);
