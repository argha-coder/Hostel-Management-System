import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Normal', 'Urgent', 'Low'], default: 'Normal' },
  expiresAt: { type: Date }
}, { 
  timestamps: true,
   
});

// Index for fetching latest notices
noticeSchema.index({ createdAt: -1 });

export default mongoose.model('Notice', noticeSchema);
