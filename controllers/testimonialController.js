import Testimonial from '../models/Testimonial.js';

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

// POST /api/testimonials  (PRIVATE)
export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    return res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/testimonials/:id  (PRIVATE)
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: 'Testimonial not found' });
    }
    return res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/testimonials/:id  (PRIVATE)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: 'Testimonial not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
