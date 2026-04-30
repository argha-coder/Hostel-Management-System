import express from 'express';
import {
  getProducts,
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  addProduct,
  deleteProduct
} from '../controllers/canteenController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Products routes
router.route('/products')
  .get(protect, getProducts)
  .post(protect, admin, addProduct);

router.route('/products/:id')
  .delete(protect, admin, deleteProduct);

// Orders routes
router.route('/order')
  .post(protect, placeOrder);

router.get('/my-orders', protect, getMyOrders);

router.route('/orders')
  .get(protect, admin, getAllOrders);

router.route('/order/:id')
  .put(protect, admin, updateOrderStatus);

export default router;
