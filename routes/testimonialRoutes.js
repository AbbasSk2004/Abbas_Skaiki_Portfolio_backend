import express from 'express';
import {
  getAllTestimonials,
  getTestimonial,
} from '../controllers/testimonialController.js';

const router = express.Router();

// PUBLIC read-only. Writes moved to /api/admin/testimonials
// (routes/admin/testimonialRoutes.js), gated by protect + requireAdmin.
router.get('/', getAllTestimonials);
router.get('/:id', getTestimonial);

export default router;
