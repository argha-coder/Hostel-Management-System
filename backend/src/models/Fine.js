import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  issued_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issued_at: { type: Date, default: Date.now },
  paid_at: { type: Date }
}, { 
  timestamps: true,
  bufferCommands: false 
});

fineSchema.index({ student_id: 1 });
fineSchema.index({ status: 1 });

export default mongoose.model('Fine', fineSchema);
