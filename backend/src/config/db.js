import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<db_password>')) {
    throw new Error('❌ MongoDB URI is not configured correctly');
  }

  // Set global buffering options to prevent "buffering timed out" errors
  mongoose.set("bufferCommands", false); 
  mongoose.set("bufferTimeoutMS", 30000);

  // Connection listeners
  mongoose.connection.on('connected', () => console.log('🟢 MongoDB connected successfully'));
  mongoose.connection.on('error', (err) => console.error('🔴 MongoDB connection error:', err));
  mongoose.connection.on('disconnected', () => console.log('🟡 MongoDB disconnected'));

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });

    console.log('🚀 MongoDB is fully ready for queries.');
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error; 
  }
};

export default connectDB;