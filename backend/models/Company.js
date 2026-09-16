const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  ownerEmail: { type: String, required: true },
  passwordHash: { type: String, required: true },
  websiteUrl: { type: String }
});

module.exports = mongoose.model('Company', CompanySchema);
