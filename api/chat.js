export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Endast POST stöds' });
    }
  
    const { message } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Du är en vårdappassistent. Svara endast på frågor om bokningar.`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.2,
          max_tokens: 100
        })
      });
  
      const data = await response.json();
      return res.status(200).json({ response: data.choices[0].message.content });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Fel vid anrop till OpenAI' });
    }
  }
  