const express = require('express');
const router = express.Router();

console.log("✅ auth.js loaded");

const {
  loginPatient,
  registerPatient,
  loginDoctor,
  deletePatient,
  sendOTP,
  verifyOTP,
  checkPhoneExists 
} = require('../controllers/authController');

router.post('/patients/login', loginPatient);
router.post('/patients/register', registerPatient);
router.delete('/patients/:id', deletePatient);
router.post('/patients/check-phone', checkPhoneExists); 

router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);

router.post('/doctors/login', loginDoctor);

module.exports = router;
