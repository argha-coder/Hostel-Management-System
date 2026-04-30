import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();

const checkDB = async () => {
  try {
    await connectDB();
    const count = await User.countDocuments();
    const admin = await User.findOne({ email: 'admin@uhostel.com' });
    
    console.log(`Total users in DB: ${count}`);
    if (admin) {
      console.log('Admin user found:');
      console.log(`- Name: ${admin.name}`);
      console.log(`- Role: ${admin.role}`);
      console.log(`- Verified: ${admin.isVerified}`);
    } else {
      console.log('Admin user NOT found.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkDB();
