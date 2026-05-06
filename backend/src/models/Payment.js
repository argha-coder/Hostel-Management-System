import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  fine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fine' },
  canteen_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  payment_method: { type: String },
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  payment_date: { type: Date }
}, { 
  timestamps: true 
});

paymentSchema.index({ student_id: 1 });
paymentSchema.index({ booking_id: 1 });
paymentSchema.index({ razorpay_order_id: 1 });

export default mongoose.model('Payment', paymentSchema);
