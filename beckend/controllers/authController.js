const db = require('../db');
const sendSMS = require('../utils/sendSMS');

const formatPhone = (phone) => {
  if (!phone.startsWith('+46')) {
    return '+46' + phone.replace(/^0/, '');
  }
  return phone;
};

exports.loginPatient = async (req, res) => {
  const { phone } = req.body;
  const formattedPhone = formatPhone(phone);

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ type: 'error', message: 'Telefonnummer krävs' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM Patients WHERE phone = ?', [formattedPhone]);
    if (rows.length > 0) {
      res.json({ type: 'success', message: 'Inloggning lyckades', data: rows[0] });
    } else {
      res.status(404).json({ type: 'error', message: 'Ingen patient hittades med detta nummer' });
    }
  } catch (err) {
    console.error('❌ Fel vid inloggning:', err);
    res.status(500).json({ type: 'error', message: 'Fel vid inloggning' });
  }
};

exports.registerPatient = async (req, res) => {
  const { name, phone, ssn, email } = req.body;
  const formattedPhone = phone.startsWith('+46') ? phone : '+46' + phone.replace(/^0/, '');

  if (!name || !phone || !ssn || !email) {
    return res.status(400).json({ type: 'error', message: 'Alla fält krävs för registrering' });
  }

  try {
    const [duplicates] = await db.query(
      'SELECT * FROM Patients WHERE phone = ? OR email = ? OR ssn = ?',
      [formattedPhone, email, ssn]
    );

    if (duplicates.length > 0) {
      const conflictFields = [];
      if (duplicates.some(p => p.phone === formattedPhone)) conflictFields.push('telefonnummer');
      if (duplicates.some(p => p.email === email)) conflictFields.push('e-post');
      if (duplicates.some(p => p.ssn === ssn)) conflictFields.push('personnummer');

      return res.status(409).json({
        type: 'error',
        message: `Följande är redan registrerade: ${conflictFields.join(', ')}`,
      });
    }

    const [result] = await db.query(
      'INSERT INTO Patients (name, phone, ssn, email) VALUES (?, ?, ?, ?)',
      [name, formattedPhone, ssn, email]
    );

    const [rows] = await db.query(
      'SELECT id, name, phone, ssn, email FROM Patients WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      type: 'success',
      message: 'Registrering lyckades!',
      data: rows[0],
    });
  } catch (err) {
    console.error('❌ Fel vid registrering:', err);
    res.status(500).json({ type: 'error', message: 'Fel vid registrering' });
  }
};

exports.loginDoctor = async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ type: 'error', message: 'Kod krävs' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM Doctors WHERE code = ?', [code]);
    if (rows.length > 0) {
      res.json({ type: 'success', message: 'Läkarinloggning lyckades', data: rows[0] });
    } else {
      res.status(401).json({ type: 'error', message: 'Fel kod' });
    }
  } catch (err) {
    console.error('❌ Fel vid läkarinloggning:', err);
    res.status(500).json({ type: 'error', message: 'Fel vid läkarinloggning' });
  }
};

exports.deletePatient = async (req, res) => {
  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).json({ type: 'error', message: 'Ogiltigt ID för radering' });
  }

  try {
    const [result] = await db.query('DELETE FROM Patients WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ type: 'error', message: 'Ingen patient hittades med detta ID' });
    }

    res.json({ type: 'success', message: 'Patientkonto raderat' });
  } catch (err) {
    console.error('❌ Fel vid DELETE patient:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte radera patientkonto' });
  }
};

exports.sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ type: 'error', message: 'Telefonnummer krävs' });

  const formattedPhone = formatPhone(phone);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
   
    await db.query('DELETE FROM OTPs WHERE expires_at < NOW()');

    await db.query('DELETE FROM OTPs WHERE phone = ?', [formattedPhone]);

    await db.query(
      'INSERT INTO OTPs (phone, code, expires_at) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)',
      [formattedPhone, otp]
    );

    await sendSMS(formattedPhone, `Din verifieringskod är: ${otp}`);
    res.json({ type: 'success', message: 'Kod skickad' });
  } catch (err) {
    console.error('❌ Fel vid sendOTP:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte skicka kod' });
  }
};

exports.verifyOTP = async (req, res) => {
  console.log("📥 verifyOTP körs med:", req.body);
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ type: 'error', message: 'Telefonnummer och kod krävs' });
  }

  const formattedPhone = phone.startsWith('+46') ? phone : '+46' + phone.replace(/^0/, '');

  try {
    const [otpRows] = await db.query(
      'SELECT * FROM OTPs WHERE phone = ? AND code = ? AND expires_at > NOW()',
      [formattedPhone, code]
    );

    if (otpRows.length === 0) {
      return res.status(401).json({ type: 'error', message: 'Ogiltig eller utgången kod' });
    }

    const [patients] = await db.query(
      'SELECT id, name, phone, email, ssn FROM Patients WHERE phone = ?',
      [formattedPhone]
    );

    if (patients.length === 0) {
      return res.status(404).json({ type: 'error', message: 'Ingen patient hittades' });
    }

    await db.query('DELETE FROM OTPs WHERE phone = ?', [formattedPhone]);

    res.json({ type: 'success', data: patients[0] });

  } catch (err) {
    console.error('❌ Fel vid verifyOTP:', err);
    res.status(500).json({ type: 'error', message: 'Fel vid verifiering' });
  }
};

exports.checkPhoneExists = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ type: 'error', message: 'Telefonnummer krävs' });

  const formattedPhone = phone.startsWith('+46') ? phone : '+46' + phone.replace(/^0/, '');

  try {
    const [rows] = await db.query('SELECT id FROM Patients WHERE phone = ?', [formattedPhone]);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error('❌ Fel vid checkPhoneExists:', err);
    res.status(500).json({ type: 'error', message: 'Kunde inte kolla telefonnummer' });
  }
};
