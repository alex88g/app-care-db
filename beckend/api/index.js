const express = require('express');
const serverless = require('serverless-http');
const sendSMS = require('../utils/sendSMS');

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Missing phone or message' });
  }

  try {
    await sendSMS(phone, message);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to send SMS' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
