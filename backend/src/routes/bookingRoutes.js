import express from 'express';
import { createBooking, getBookings, getMyBookings, approveBooking, rejectBooking } from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getBookings);

router.route('/mybookings')
  .get(protect, getMyBookings);

router.put('/:id/approve', protect, admin, approveBooking);
router.put('/:id/reject', protect, admin, rejectBooking);

export default router;
