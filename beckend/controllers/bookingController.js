const db = require('../db');

exports.getBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Bookings.*, Patients.name, Patients.email, Patients.phone
      FROM Bookings
      JOIN Patients ON Bookings.patient_id = Patients.id
    `);
    res.json({ type: 'info', message: 'Bokningar hämtade', data: rows });
  } catch (err) {
    console.error('❌ Fel vid hämtning av bokningar:', err);
    res.status(500).json({ type: 'error', message: 'Fel vid hämtning av bokningar' });
  }
};

exports.createBooking = async (req, res) => {
  const { date, time, meetingLink, patient_id } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM Bookings WHERE date = ? AND time = ?',
      [date, time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ type: 'error', message: 'Tiden är redan bokad' });
    }

    const [result] = await db.query(
      'INSERT INTO Bookings (date, time, meetingLink, patient_id) VALUES (?, ?, ?, ?)',
      [date, time, meetingLink, patient_id]
    );
    res.json({ type: 'success', message: 'Bokning skapad', id: result.insertId });
  } catch (err) {
    console.error('❌ Fel vid CREATE booking:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte skapa bokningen' });
  }
};

exports.updateBooking = async (req, res) => {
  const id = req.params.id;
  const { date, time, meetingLink } = req.body;

  try {
    await db.query(
      'UPDATE Bookings SET date = ?, time = ?, meetingLink = ? WHERE id = ?',
      [date, time, meetingLink, id]
    );
    res.json({ type: 'success', message: 'Bokning uppdaterad' });
  } catch (err) {
    console.error('❌ Fel vid UPDATE booking:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte uppdatera bokningen' });
  }
};

exports.deleteBooking = async (req, res) => {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM Bookings WHERE id = ?', [id]);
    res.json({ type: 'success', message: 'Bokning raderad' });
  } catch (err) {
    console.error('❌ Fel vid DELETE booking:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte radera bokningen' });
  }
};

exports.getAvailableTimes = async (req, res) => {
  const { date } = req.query;
  const allHours = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

  try {
    const [bookings] = await db.query(
      'SELECT time FROM Bookings WHERE date = ?',
      [date]
    );

    const bookedTimes = bookings.map(b => b.time);
    const available = allHours.filter(hour => !bookedTimes.includes(hour));

    res.json({ type: 'info', message: 'Lediga tider hämtade', available });
  } catch (err) {
    console.error('❌ Fel vid hämtning av lediga tider:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte hämta lediga tider' });
  }
};
