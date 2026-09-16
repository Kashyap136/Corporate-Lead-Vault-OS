const cron = require('node-cron');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');

// Daily 9 AM job - DPDP expiry alert
cron.schedule('0 9 * * *', async () => {
  try {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);

    const expiringLeads = await Lead.find({
      logRetentionUntil: { $lt: threshold, $gt: now }
    });

    console.log(`[DPDP Alert] ${expiringLeads.length} leads expiring within 30 days`);
    expiringLeads.forEach(lead => {
      console.log(`  - Lead ${lead.name} (${lead.phone}) expires on ${lead.logRetentionUntil}`);
    });
  } catch (err) {
    console.error('[DPDP Alert Error]', err.message);
  }
});

// Daily midnight job - Archive old records to cold storage
cron.schedule('0 0 * * *', async () => {
  try {
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - 365);

    const oldLeads = await Lead.find({ createdAt: { $lt: archiveDate } });
    if (oldLeads.length === 0) {
      console.log('[Archive] No records older than 365 days');
      return;
    }

    const archiveCollection = mongoose.connection.collection('leads_archive');
    await archiveCollection.insertMany(oldLeads.map(lead => lead.toObject()));
    await Lead.deleteMany({ _id: { $in: oldLeads.map(lead => lead._id) } });

    console.log(`[Archive] ${oldLeads.length} records archived to cold storage (leads_archive)`);
  } catch (err) {
    console.error('[Archive Error]', err.message);
  }
});

module.exports = { startCronJobs: () => console.log('Cron jobs started') };
