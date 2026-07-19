import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { notFound, globalErrorHandler } from './middlewares/errorHandler.js';

// Route modules
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import callBookingRoutes from './routes/callBookingRoutes.js';
import techStackRoutes from './routes/techStackRoutes.js';
import approachRoutes from './routes/approachRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import socialLinkRoutes from './routes/socialLinkRoutes.js';
import drivenResultRoutes from './routes/drivenResultRoutes.js';

// Load .env.local if present, otherwise fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();

// --- Core security & parsing middlewares ---
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true, // allow cookies to be sent cross-origin
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Health check ---
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/bookings', callBookingRoutes);
app.use('/api/tech-stacks', techStackRoutes);
app.use('/api/approaches', approachRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/driven-results', drivenResultRoutes);
import apiRoutes from './routes/apiRoutes.js';
app.use('/api', apiRoutes);
// --- Error handling ---
app.use(notFound);
app.use(globalErrorHandler);

// --- Bootstrap ---
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

export default app;
