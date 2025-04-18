const axios = require('axios');
require('dotenv').config(); 

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendSMS = async (phone, message) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/transactionalSMS/sms',
      {
        sender: 'Brevo',
        recipient: phone,
        content: message,
        type: 'transactional'
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    console.log(`✅ SMS skickat till ${phone}`);
  } catch (error) {
    console.error('❌ Fel vid SMS-sändning:', error.response?.data || error.message);
    throw new Error('Kunde inte skicka SMS');
  }
};

module.exports = sendSMS;
