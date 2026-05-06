import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Snacks', 'Biscuits', 'Drinks', 'Meals', 'Essentials', 'Stationery', 'Other'], default: 'Snacks' },
  image: { type: String }, // URL to product image
  stock: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { 
  timestamps: true,
   
});

export default mongoose.model('Product', productSchema);
