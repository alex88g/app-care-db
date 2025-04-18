require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const chatRoutes = require('./routes/chat');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API är igång!');
});

app.listen(port, () => {
  console.log(`✅ Backend server is running on http://localhost:${port}`);
});