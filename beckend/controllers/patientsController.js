exports.deletePatient = async (req, res) => {
    const id = req.params.id;
  
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Ogiltigt patient-ID' });
    }
  
    try {
      await db.query('DELETE FROM Bookings WHERE patient_id = ?', [id]);
  
      const [result] = await db.query('DELETE FROM Patients WHERE id = ?', [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Patient hittades inte' });
      }
  
      res.json({ message: '✅ Patientkonto raderat' });
    } catch (err) {
      console.error('❌ Fel vid DELETE patient:', err);
      res.status(500).json({ error: 'Kunde inte radera patientkonto' });
    }
  };
  