require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:5173',         
  'https://app-care.vercel.app'     
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.post('/api/auth/doctors/login', (req, res) => {
  const { code } = req.body;
  if (code === '123456') {
    return res.json({ message: 'Läkarinloggning lyckades', data: { name: 'Dr. House' } });
  }
  res.status(401).json({ message: 'Fel kod' });
});

app.get('/', (req, res) => {
  res.send('Backend online 🚀');
});

app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server listening on http://0.0.0.0:${port}`);
});
