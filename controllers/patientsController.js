exports.deletePatient = async (req, res) => {
  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).json({ type: 'error', message: 'Ogiltigt patient-ID' });
  }

  try {
    const [patient] = await db.query('SELECT id FROM Patients WHERE id = ?', [id]);
    if (patient.length === 0) {
      return res.status(404).json({ type: 'error', message: 'Patient hittades inte' });
    }

    await db.query('DELETE FROM Bookings WHERE patient_id = ?', [id]);

    await db.query('DELETE FROM Patients WHERE id = ?', [id]);

    res.json({ type: 'success', message: '✅ Patientkonto raderat' });
  } catch (err) {
    console.error('❌ Fel vid DELETE patient:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte radera patientkonto' });
  }
};
