import express from 'express';
import {
  getNotices,
  postNotice,
  deleteNotice
} from '../controllers/noticeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotices)
  .post(protect, admin, postNotice);

router.route('/:id')
  .delete(protect, admin, deleteNotice);

export default router;
