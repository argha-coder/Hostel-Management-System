import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import GatePass from './models/GatePass.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const checkStatus = async () => {
  try {
    const users = await User.find({});
    console.log('Users:');
    users.forEach(u => console.log(`- ${u.email}: ${u.role}, verified: ${u.isVerified}`));

    const gatePasses = await GatePass.find({}).populate('student_id', 'name email');
    console.log('\nGate Passes:');
    gatePasses.forEach(gp => console.log(`- ID: ${gp._id}, Student: ${gp.student_id?.email}, Status: ${gp.status}`));

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkStatus();
