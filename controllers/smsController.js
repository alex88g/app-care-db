const sendSMSUtil = require('../utils/sendSMS');

exports.sendSMS = async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ type: 'error', message: 'Telefonnummer och meddelande är obligatoriskt' });
  }

  try {
    await sendSMSUtil(phone, message);
    res.status(200).json({ type: 'success', message: 'SMS skickat' });
  } catch (err) {
    console.error('❌ Fel vid SMS:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte skicka SMS' });
  }
};
