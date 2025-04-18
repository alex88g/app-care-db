const express = require('express');
const router = express.Router();
const fetch = require('cross-fetch');

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Meddelande krävs' });
  }

  const allowedKeywords = [
    "boka", "bokning", "läkartid", "tid", "avboka", "mina bokningar",
    "hur bokar jag", "ändra en bokning", "navigera till bokning",
    "hur hittar jag mina bokningar", "avbokning", "läkare", "vård", "patient",
    "support", "hjälp med bokning", "möteslänk", "skapa möte", "akut vård"
  ];

  const isRelevant = allowedKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );

  if (!isRelevant) {
    return res.json({
      response: "Tyvärr, vi svarar endast på frågor som rör vårdappen, bokningar och navigering till bokningar."
    });
  }

  try {
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
            content: `Du är en assistent för en vårdapp. 
            Du får **endast** svara på frågor som handlar om bokningar och appens funktioner. 
            Om en användare frågar om något annat, svara exakt detta:  
            "Tyvärr, vi svarar endast på frågor som rör vårdappen, bokningar och navigering till bokningar."`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
        max_tokens: 100
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ OpenAI-fel:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    return res.json({ response: data.choices[0].message.content });

  } catch (err) {
    console.error("❌ Fel vid kontakt med OpenAI:", err);
    res.status(500).json({ error: 'Internt serverfel' });
  }
});

module.exports = router;
