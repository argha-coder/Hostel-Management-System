import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();

// Root Route
app.get("/", (req, res) => {
  res.send("UHostel Backend Running 🚀");
});

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true
}));

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

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production'
      ? null
      : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

// Start Server
const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Start Express Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error(" Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();