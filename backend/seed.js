import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing users
    await User.deleteMany({ email: { $in: ['admin@example.com', 'student@example.com'] } });

    // Create Admin Account
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
      isVerified: true
    });

    // Create some sample rooms if none exist
    let room101 = await Room.findOne({ room_number: '101' });
    if (!room101) {
      room101 = await Room.create({ room_number: '101', capacity: 2, status: 'Available' });
      await Room.create([
        { room_number: '102', capacity: 4, status: 'Available' },
        { room_number: '103', capacity: 1, status: 'Available' }
      ]);
      console.log('Sample rooms created.');
    }

    // Create Student Account and assign to Room 101
    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'password123',
      role: 'Student',
      isVerified: true,
      room_id: room101._id
    });

    // Increment occupancy for Room 101
    room101.occupied += 1;
    await room101.save();

    // Create a sample booking for the student
    await Booking.create({
      student_id: student._id,
      room_id: room101._id,
      start_date: new Date(),
      duration: 6,
      payment_status: 'Pending',
      amount: 30000
    });

    console.log('Temporary accounts and sample booking created successfully:');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
