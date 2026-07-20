import Testimonial from '../models/Testimonial.js';

// -----------------------------------------------------------------------------
// PUBLIC Testimonial controller — read-only. All mutations (+ avatar Cloudinary
// lifecycle) now live in controllers/admin/testimonialController.js, served
// under /api/admin/testimonials. GET-only here enforces separation.
// -----------------------------------------------------------------------------

// GET /api/testimonials  (PUBLIC)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/testimonials/:id  (PUBLIC)
export const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: 'Testimonial not found' });
    }
    return res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
