import express from 'express';
import { 
  getRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  assignRoom,
  unassignRoom
} from '../controllers/roomController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getRooms)
  .post(protect, admin, createRoom);

router.post('/assign', protect, admin, assignRoom);
router.post('/unassign', protect, admin, unassignRoom);

router.route('/:id')
  .put(protect, admin, updateRoom)
  .delete(protect, admin, deleteRoom);

export default router;
