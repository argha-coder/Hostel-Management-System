import express from 'express';
import { createOrder, verifyPayment, getMyFees, getAllPayments, deleteBooking } from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-fees', protect, getMyFees);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/all', protect, admin, getAllPayments);
router.delete('/:id', protect, admin, deleteBooking);


export default router;
