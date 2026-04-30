import express from 'express';
import {
  applyForGatePass,
  getMyGatePasses,
  getAllGatePasses,
  updateGatePassStatus
} from '../controllers/gatePassController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, applyForGatePass)
  .get(protect, admin, getAllGatePasses);

router.get('/my', protect, getMyGatePasses);

router.route('/:id')
  .put(protect, admin, updateGatePassStatus);

export default router;
