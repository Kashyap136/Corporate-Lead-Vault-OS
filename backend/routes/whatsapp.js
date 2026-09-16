const express = require('express');
const Lead = require('../models/Lead');

const router = express.Router();

async function sendLeadAlert(leadId) {
  const lead = await Lead.findById(leadId).populate('companyId');
  if (!lead) {
    return { error: 'Lead not found' };
  }

  const message = `New Lead: ${lead.name} ${lead.phone} ${lead.source}`;

  // WhatsApp Cloud API call using WHATSAPP_TOKEN when configured
  let whatsappStatus = 'not_configured';
  const token = process.env.WHATSAPP_TOKEN;
  const businessPhoneId = process.env.WHATSAPP_PHONE_ID;

  if (token && token !== 'EAAxxx' && businessPhoneId) {
    try {
      const waRes = await fetch(
        `https://graph.facebook.com/v18.0/${businessPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: lead.companyId?.ownerPhone || '',
            type: 'text',
            text: { body: message }
          })
        }
      );
      whatsappStatus = waRes.ok ? 'sent' : 'failed';
    } catch (waErr) {
      whatsappStatus = 'failed';
    }
  }

  // SMS delivery attempt via FAST2SMS_KEY when configured
  let smsStatus = 'not_configured';
  const fast2smsKey = process.env.FAST2SMS_KEY;
  if (fast2smsKey && fast2smsKey !== 'xxx' && lead.companyId?.ownerPhone) {
    try {
      const smsRes = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${lead.companyId.ownerPhone}`);
      smsStatus = smsRes.ok ? 'sent' : 'failed';
    } catch (smsErr) {
      smsStatus = 'failed';
    }
  }

  return {
    message,
    whatsappStatus,
    smsStatus,
    ivrStatus: 'not_configured',
    marathi: 'नवीन लीड प्राप्त झाली',
    hindi: 'नया लीड प्राप्त हुआ'
  };
}

router.post('/lead-alert', async (req, res) => {
  try {
    const { leadId } = req.body;
    const result = await sendLeadAlert(leadId);
    if (result.error) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.sendLeadAlert = sendLeadAlert;