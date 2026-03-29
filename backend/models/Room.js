import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  room_number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true, default: 2 },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ['Clean', 'Repair', 'Occupied', 'Available'], default: 'Available' }
}, { timestamps: true });

// Add indexes for optimization
 roomSchema.index({ status: 1 });
 
 export default mongoose.model('Room', roomSchema);
