import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import gatePassRoutes from './routes/gatePassRoutes.js';
import canteenRoutes from './routes/canteenRoutes.js';
import fineRoutes from './routes/fineRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();


// 1. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hostel-management-system-bbf6.vercel.app',
  'https://hostel-management-system-rosy.vercel.app'
];

if (process.env.CLIENT_URL) {
  const envOrigins = process.env.CLIENT_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 2. Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error.message);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("UHostel Backend Running 🚀");
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'UHostel API is running'
  });
});

// Deep Health Check (Database test)
app.get('/api/db-health', async (req, res) => {
  try {
    await connectDB();
    const dbStatus = mongoose.connection.db.admin().ping();
    res.json({
      status: 'ok',
      database: 'connected',
      ping: await dbStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/gatepass', gatePassRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

// Start local server
if (process.env.NODE_ENV !== 'production') {
  const startLocalServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error(" Failed to start local server:", error.message);
    }
  };
  startLocalServer();
}

export default app;