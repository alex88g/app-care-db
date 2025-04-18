const express = require('express');
const router = express.Router();
const {
  loginPatient,
  registerPatient,
  deletePatient
} = require('../controllers/authController');

router.post('/login', loginPatient);

router.post('/register', registerPatient);

router.delete('/:id', deletePatient);

module.exports = router;
