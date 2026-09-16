const mongoose = require('mongoose');

const ROIcalcSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  inputs: {
    factoryArea: { type: Number, required: true },
    powerBill: { type: Number, required: true },
    manpower: { type: Number, required: true },
    currentCost: { type: Number, required: true }
  },
  result: {
    savings: { type: Number },
    roiPercent: { type: Number }
  },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ROIcalc', ROIcalcSchema);
