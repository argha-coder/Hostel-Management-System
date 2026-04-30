import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDashboardStats);

export default router;
