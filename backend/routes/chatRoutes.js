import express from 'express';
import {
  sendMessage,
  getConversation,
  getChatThreads,
  getAdmins
} from '../controllers/chatController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/conversation/:userId', protect, getConversation);
router.get('/threads', protect, admin, getChatThreads);
router.get('/admins', protect, getAdmins);

export default router;
