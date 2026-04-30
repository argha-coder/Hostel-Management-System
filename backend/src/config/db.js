import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  let uri = process.env.MONGO_URI;

  // Clean the URI (Remove surrounding quotes, whitespace, or "MONGO_URI=" prefix)
  if (uri) {
    uri = uri.trim()
      .replace(/^["'](.+)["']$/, '$1')
      .replace(/^MONGO_URI=\s*/i, '');
  }

  if (!uri || uri.includes('<db_password>')) {
    throw new Error('MongoDB URI is missing or contains a placeholder');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error(`Invalid MongoDB URI scheme. It starts with "${uri.substring(0, 10)}..." instead of "mongodb://"`);
  }

  // Set global buffering options
  mongoose.set("bufferCommands", true); 
  // Set timeout for buffering (how long to wait for connection before failing query)
  // 5 seconds is plenty for serverless; if it takes longer, it's usually a connection string or whitelist issue.
  mongoose.set("bufferTimeoutMS", 5000); 

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('🚀 MongoDB Connected');
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    throw error; 
  }
};

export default connectDB;