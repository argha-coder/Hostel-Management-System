import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get all canteen products
// @route   GET /api/canteen/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new canteen order
// @route   POST /api/canteen/order
// @access  Private/Student
export const placeOrder = async (req, res) => {
  const { products, total_amount } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: 'No products in order' });
  }

  try {
    const order = await Order.create({
      user_id: req.user._id,
      products,
      total_amount
    });

    const populatedOrder = await Order.findById(order._id).populate('products.product_id', 'name price');
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's own orders
// @route   GET /api/canteen/my-orders
// @access  Private/Student
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .populate('products.product_id', 'name price')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin/Warden)
// @route   GET /api/canteen/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user_id', 'name email')
      .populate('products.product_id', 'name price')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin/Warden)
// @route   PUT /api/canteen/order/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (status) order.status = status;
      if (payment_status) order.payment_status = payment_status;
      
      const updatedOrder = await order.save();
      const populatedOrder = await Order.findById(updatedOrder._id)
        .populate('user_id', 'name email')
        .populate('products.product_id', 'name price');
      res.json(populatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product (Admin)
// @route   POST /api/canteen/products
// @access  Private/Admin
export const addProduct = async (req, res) => {
  const { name, description, price, category, image, stock } = req.body;

  try {
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/canteen/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Instead of physical deletion, we mark it as unavailable
      // or we can physically delete it if no orders are linked to it.
      // For simplicity in this hostel project, let's physically delete it.
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
