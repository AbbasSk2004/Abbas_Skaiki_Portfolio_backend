import express from 'express';
import {
  listTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../controllers/admin/testimonialController.js';
import { uploadImage } from '../../middlewares/upload.js';

// -----------------------------------------------------------------------------
// ADMIN Testimonial routes — mounted at /api/admin/testimonials, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// Testimonial carries ONE image field (avatar), uploaded via .single('image')
// into the Cloudinary `testimonials/` subfolder.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listTestimonials);
router.get('/:id', getTestimonial);
router.post('/', uploadImage('testimonials').single('image'), createTestimonial);
router.put('/:id', uploadImage('testimonials').single('image'), updateTestimonial);
router.delete('/:id', deleteTestimonial);

export default router;
