import express from 'express';
import { trackVisitor } from '../controllers/trackController.js';

const router = express.Router();

// POST /api/track
router.post('/', trackVisitor);

export default router;
