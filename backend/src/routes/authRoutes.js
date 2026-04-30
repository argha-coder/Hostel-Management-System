import express from 'express';
import {
  registerUser,
  verifyRegisterOTP,
  loginUser,
  verifyLoginOTP,
  logoutUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserProfile,
  changePassword
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-register', verifyRegisterOTP);
router.post('/login', loginUser);
router.post('/verify-login', verifyLoginOTP);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
