const sendSMS = require('../utils/sendSMS');

exports.sendSMS = async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Telefonnummer och meddelande är obligatoriskt' });
  }

  try {
    await sendSMS(phone, message);
    res.status(200).json({ success: true, message: 'SMS skickat' });
  } catch (err) {
    console.error('❌ Fel vid SMS:', err);
    res.status(500).json({ error: 'Kunde inte skicka SMS' });
  }
};