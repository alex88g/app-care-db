const fetch = require('cross-fetch');
const db = require('../db');

const allowedKeywords = [
  "boka", "bokning", "läkartid", "tid", "avboka", "mina bokningar",
  "hur bokar jag", "ändra en bokning", "navigera till bokning",
  "hur hittar jag mina bokningar", "avbokning", "läkare", "vård", "patient",
  "support", "hjälp med bokning", "möteslänk", "skapa möte", "akut vård"
];

exports.sendMessage = async (req, res) => {
  const { message, patientId } = req.body;

  if (!message) {
    return res.status(400).json({ type: 'error', message: 'Meddelande krävs' });
  }

  const isLoggedIn = !!patientId;

  if (isLoggedIn) {
    const [patient] = await db.query('SELECT id FROM Patients WHERE id = ?', [patientId]);
    if (patient.length === 0) {
      return res.status(400).json({ type: 'error', message: 'Ogiltigt patient-ID' });
    }
  }

  const isRelevant = allowedKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );

  if (!isRelevant) {
    const botReply = "Tyvärr, vi svarar endast på frågor som rör vårdappen, bokningar och navigering till bokningar.";

    if (isLoggedIn) {
      await db.query(
        `INSERT INTO ChatMessages (patient_id, sender, message) VALUES (?, 'chatgpt', ?)`,
        [patientId, botReply]
      );
    }

    return res.json({ type: 'info', response: botReply });
  }

  try {
    if (isLoggedIn) {
      await db.query(
        `INSERT INTO ChatMessages (patient_id, sender, message) VALUES (?, 'user', ?)`,
        [patientId, message]
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du är en assistent för en vårdapp. Du får endast svara på frågor som handlar om bokningar och appens funktioner.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
        max_tokens: 100
      })
    });

    const data = await response.json();
    const botReply = data?.choices?.[0]?.message?.content || "⚠️ Inget svar från GPT.";

    if (isLoggedIn) {
      await db.query(
        `INSERT INTO ChatMessages (patient_id, sender, message) VALUES (?, 'chatgpt', ?)`,
        [patientId, botReply]
      );
    }

    res.json({ type: 'success', response: botReply });

  } catch (err) {
    console.error("❌ OpenAI-fel:", err);
    res.status(500).json({ type: 'error', message: 'Internt serverfel vid GPT-svar' });
  }
};

exports.getMessagesByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM ChatMessages WHERE patient_id = ? ORDER BY created_at ASC',
      [patientId]
    );
    res.json({ type: 'success', data: rows });
  } catch (error) {
    console.error("❌ Fel vid hämtning av meddelanden:", error);
    res.status(500).json({ type: 'error', message: 'Kunde inte hämta meddelanden' });
  }
};
