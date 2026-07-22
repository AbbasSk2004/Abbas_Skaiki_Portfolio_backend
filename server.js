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

// Private admin subtree — gated by protect + requireAdmin at its mount point.
import adminRoutes from './routes/admin/index.js';

// Load .env.local if present, otherwise fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

// Make the resolved revalidation config observable at boot so a misconfigured
// VM (e.g. FRONTEND_URL still pointing at localhost) is obvious in `pm2 logs`
// instead of silently pinging the wrong host. Never print the secret value.
/*console.log(
  '[boot] FRONTEND_URL=%s  REVALIDATE_SECRET=%s',
  process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN ,
  process.env.REVALIDATE_SECRET ? 'set' : 'MISSING'
);*/

const app = express();

// Trust the reverse proxy (nginx/Caddy on the GCP VM, and Cloud Load Balancer)
// so secure cookies, req.protocol, and rate-limit IPs are correct behind it.
app.set('trust proxy', 1);

// --- CORS ---
// Allow a COMMA-SEPARATED list of origins from env (no hardcoded URLs), so the
// Vercel production domain AND preview deployments can all be permitted, e.g.
//   CLIENT_ORIGIN=https://skaikidev.vercel.app,https://skaikidev-git-*.vercel.app
// A bare "*" entry disables the allowlist (dev only). Requests with no Origin
// (curl, server-to-server, health checks) are always allowed.
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // non-browser / same-origin
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Reject WITHOUT throwing: the request proceeds without CORS headers, the
    // browser blocks it, and we get a clear server log instead of a 500.
    console.warn(`[cors] Blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
};

// --- Core security & parsing middlewares ---
app.use(cors(corsOptions));
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

// --- Private admin API (all routes require a valid admin JWT cookie) ---
app.use('/api/admin', adminRoutes);

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
