const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.sendMessage);
router.get('/:patientId', chatController.getMessagesByPatient);

module.exports = router;
