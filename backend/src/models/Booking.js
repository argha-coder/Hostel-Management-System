import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  start_date: { type: Date, required: true },
  duration: { type: Number, required: true }, // duration in months
  amount: { type: Number, required: true, default: 0 },
  payment_status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { 
  timestamps: true,
   
});

// Add indexes for optimization
bookingSchema.index({ student_id: 1 });
bookingSchema.index({ room_id: 1 });
bookingSchema.index({ payment_status: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
