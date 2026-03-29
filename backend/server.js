import express from 'express';
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

connectDB();

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UHostel API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/gatepass', gatePassRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notices', noticeRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
