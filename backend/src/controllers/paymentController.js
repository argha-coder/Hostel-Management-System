import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Fine from '../models/Fine.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Lazy initialization of Razorpay to ensure env vars are loaded
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL: Razorpay keys missing in environment variables!");
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });
  }
  return razorpayInstance;
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  const { booking_id, fine_id, canteen_order_id } = req.body;
  const razorpay = getRazorpay();

  try {
    let amount = 0;
    let receipt = '';

    console.log(`[Payment] Creating order for: ${booking_id ? 'Booking' : fine_id ? 'Fine' : 'Canteen'}`);

    if (booking_id) {
      const booking = await Booking.findById(booking_id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      amount = booking.amount;
      receipt = `receipt_booking_${booking._id}`;
    } else if (fine_id) {
      const fine = await Fine.findById(fine_id);
      if (!fine) return res.status(404).json({ message: 'Fine not found' });
      amount = fine.amount;
      receipt = `receipt_fine_${fine._id}`;
    } else if (canteen_order_id) {
      const order = await Order.findById(canteen_order_id);
      if (!order) return res.status(404).json({ message: 'Canteen order not found' });
      amount = order.total_amount;
      receipt = `receipt_canteen_${order._id}`;
    } else {
      return res.status(400).json({ message: 'No item specified for payment' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);
    console.log(`[Payment] Razorpay order created: ${order.id}`);

    // Create a pending payment record
    await Payment.create({
      student_id: req.user._id,
      booking_id,
      fine_id,
      canteen_order_id,
      amount: amount,
      razorpay_order_id: order.id,
      status: 'Pending'
    });

    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    booking_id,
    fine_id,
    canteen_order_id
  } = req.body;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log(`[Payment] Signature verified for order: ${razorpay_order_id}`);
      
      // Update Payment Record
      const payment = await Payment.findOne({ razorpay_order_id });
      if (payment) {
        payment.razorpay_payment_id = razorpay_payment_id;
        payment.razorpay_signature = razorpay_signature;
        payment.status = 'Paid';
        payment.payment_date = new Date();
        await payment.save();
      }

      // Update Booking Record if applicable
      if (booking_id) {
        const booking = await Booking.findById(booking_id);
        if (booking) {
          booking.payment_status = 'Paid';
          await booking.save();
        }
      }

      // Update Fine Record if applicable
      if (fine_id) {
        const fine = await Fine.findById(fine_id);
        if (fine) {
          fine.status = 'Paid';
          fine.paid_at = new Date();
          await fine.save();
        }
      }

      // Update Canteen Order Record if applicable
      if (canteen_order_id) {
        const order = await Order.findById(canteen_order_id);
        if (order) {
          order.payment_status = 'Paid';
          await order.save();
        }
      }

      res.json({ message: 'Payment verified successfully', success: true });
    } else {
      console.error(`[Payment] Signature mismatch for order: ${razorpay_order_id}`);
      res.status(400).json({ message: 'Invalid signature', success: false });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's fee status
// @route   GET /api/payments/my-fees
// @access  Private
export const getMyFees = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      student_id: req.user._id,
      status: 'Approved' 
    }).populate('room_id', 'room_number');
    
    const bookingsWithPayment = await Promise.all(bookings.map(async (b) => {
      const payment = await Payment.findOne({ booking_id: b._id, status: 'Paid' });
      return {
        ...b._doc,
        payment_details: payment ? {
          payment_id: payment.razorpay_payment_id,
          date: payment.payment_date
        } : null
      };
    }));

    res.json(bookingsWithPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/all
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'Approved' })
      .populate('student_id', 'name email')
      .populate('room_id', 'room_number')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a booking/fee record (Admin)
// @route   DELETE /api/payments/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Only allow deleting unpaid records
    if (booking.payment_status === 'Paid') {
      return res.status(400).json({ message: 'Cannot delete a record that has already been paid.' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    
    // Also delete associated payment attempts
    await Payment.deleteMany({ booking_id: req.params.id });

    res.json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
