const express = require('express');
const bookingController = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// order is important: more specific paths first
router.get('/', bookingController.getAllBookings);
router.get('/user/:userId', bookingController.getUserBookings);
router.get('/:id', bookingController.getBooking);
router.post('/', validateBooking, bookingController.createBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;