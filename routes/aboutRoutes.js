import express from 'express';
import { getAbout } from '../controllers/aboutController.js';

const router = express.Router();

// About is a singleton: PUBLIC read only. The private upsert now lives at
// PUT /api/admin/about (routes/admin/aboutRoutes.js), gated by protect + requireAdmin.
router.get('/', getAbout);

export default router;
