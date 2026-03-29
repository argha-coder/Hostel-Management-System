import mongoose from 'mongoose';

const gatePassSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  departure_time: { type: Date, required: true },
  return_time: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Declined'], default: 'Pending' },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The Warden/Admin
  review_note: { type: String }, // Optional note from Warden
}, { timestamps: true });

gatePassSchema.index({ student_id: 1 });
gatePassSchema.index({ status: 1 });

export default mongoose.model('GatePass', gatePassSchema);
