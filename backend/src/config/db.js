import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and across function invocations in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (uri) {
    uri = uri.trim()
      .replace(/^["'](.+)["']$/, '$1')
      .replace(/^MONGO_URI=\s*/i, '');
  }

  if (!uri || uri.includes('<db_password>')) {
    throw new Error('MongoDB URI is missing or contains a placeholder');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 30000,
      bufferCommands: true,
      maxPoolSize: 10, // Recommended for serverless to avoid connection spikes
    };

    console.log('⏳ Connecting to MongoDB (New Connection)...');
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('🚀 MongoDB Connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`❌ MongoDB Error: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

export default connectDB;