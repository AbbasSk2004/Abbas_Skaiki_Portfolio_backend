import express from 'express';
import {
  getAllTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public reads
router.get('/', getAllTestimonials);
router.get('/:id', getTestimonial);

// Private writes (admin only)
router.post('/', protect, createTestimonial);
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

export default router;
