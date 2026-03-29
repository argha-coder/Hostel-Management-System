import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isBroadcast: { type: Boolean, default: false },
}, { timestamps: true });

// Index for faster queries on conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
