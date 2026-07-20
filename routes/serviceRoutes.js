import express from 'express';
import {
  getAllServices,
  getService,
} from '../controllers/serviceController.js';

const router = express.Router();

// PUBLIC read-only. Every write (POST/PUT/DELETE) now lives under
// /api/admin/services (routes/admin/serviceRoutes.js), gated by protect +
// requireAdmin. This router deliberately exposes GETs only — no auth needed,
// no mutation surface.
router.get('/', getAllServices);
router.get('/:id', getService);

export default router;
