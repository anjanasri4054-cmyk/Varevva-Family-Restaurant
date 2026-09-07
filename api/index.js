import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();

// Ensure DB is connected for each request in serverless environment
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'The order service is temporarily unavailable. Please try again in a moment.'
    });
  }
  next();
});

const allowedOrigins = [
  'https://varevva-family-restaurant.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check routes
app.get(['/api', '/api/health', '/health', '/'], (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Varevva Restaurant API is running!' });
});

// Routes (supports both /api prefix and stripped prefix)
app.use('/api/menu', menuRoutes);
app.use('/menu', menuRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);

app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export { app };
export default function handler(req, res) {
  return app(req, res);
}
