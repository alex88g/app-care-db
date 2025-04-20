const express = require('express');
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getAvailableTimes 
} = require('../controllers/bookingController');

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);     
router.delete('/:id', deleteBooking);  

router.get('/available-times', getAvailableTimes); 

module.exports = router;
 