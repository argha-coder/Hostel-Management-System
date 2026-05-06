import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price_at_order: { type: Number, required: true }
  }],
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
  payment_status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' }
}, { 
  timestamps: true,
   
});

export default mongoose.model('Order', orderSchema);
