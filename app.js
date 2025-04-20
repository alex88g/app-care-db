require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:5173',
  'https://app-care.vercel.app',
  'https://app-care-d2mwv08cr-alexs-projects-6727ece4.vercel.app',
  'https://app-care-essf6ell4-alexs-projects-6727ece4.vercel.app',
  'https://app-care-9ti3gmfrf-alexs-projects-6727ece4.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));

app.options('*', cors()); 

app.use(express.json());

setInterval(() => {
  console.log('🔁 Keep-alive ping to prevent Railway from stopping...');
}, 60000);

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API is running and healthy!');
});

app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Backend server is running on http://0.0.0.0:${port}`);
});
