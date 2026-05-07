import express from 'express';
import { getDashboardStats, getDashboardSummary } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDashboardStats);
router.get('/summary', protect, getDashboardSummary);

export default router;
