import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<db_password>')) {
    throw new Error('❌ MongoDB URI is not configured correctly');
  }

  // Set global buffering options
  mongoose.set("bufferCommands", true); 
  // Set timeout for buffering (how long to wait for connection before failing query)
  // 5 seconds is plenty for serverless; if it takes longer, it's usually a connection string or whitelist issue.
  mongoose.set("bufferTimeoutMS", 5000); 

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('🚀 MongoDB Connected');
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    throw error; 
  }
};

export default connectDB;