import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Student'], default: 'Student' },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  isVerified: { type: Boolean, default: false }
}, { 
  timestamps: true,
   // Disable buffering for this schema specifically
});

// Add indexes for optimization
 userSchema.index({ role: 1 });
 userSchema.index({ room_id: 1 });
 
 userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
