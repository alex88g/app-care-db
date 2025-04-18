const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const patientRoutes = require('./routes/patients');

app.use('/api', authRoutes);             
app.use('/api/bookings', bookingRoutes);   
app.use('/api/patients', patientRoutes);   

app.get('/', (req, res) => {
  res.send('🚀 API är igång!');
});

app.listen(port, () => {
  console.log(`✅ Backend server is running on http://localhost:${port}`);
});
