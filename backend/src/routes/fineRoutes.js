import express from 'express';
import {
  getFines,
  issueFine,
  markFineAsPaid,
  deleteFine
} from '../controllers/fineController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getFines)
  .post(protect, admin, issueFine);

router.route('/:id/pay')
  .put(protect, admin, markFineAsPaid);

router.route('/:id')
  .delete(protect, admin, deleteFine);

export default router;
