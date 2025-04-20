require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');

const app = express();
const port = process.env.PORT || 8080;

// ✅ CORS-konfiguration för både lokal utveckling och Vercel
app.use(cors({
  origin: ['http://localhost:5173', 'https://app-care.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// 🔁 Keep-alive ping för Railway
setInterval(() => {
  console.log('🔁 Keep-alive ping to prevent Railway from stopping...');
}, 60000);

// 🔒 Ping-rutt för hälsokontroll
app.get('/ping', (req, res) => {
  res.send('pong');
});

// 📦 API-rutter
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

// 🚀 Standardhälsorutt
app.get('/', (req, res) => {
  res.send('🚀 API is running and healthy!');
});

// 🔥 Global felhanterare
app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err);
  res.status(500).json({ error: 'Server error' });
});

// 🚀 Starta servern
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend server is running on http://0.0.0.0:${port}`);
});
