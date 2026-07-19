import Inquiry from '../models/Inquiry.js';

// POST /api/inquiries  (PUBLIC) — visitor submits a contact inquiry
export const createInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    // Only accept whitelisted fields from the public; status stays default 'new'.
    const inquiry = await Inquiry.create({ name, email, subject, message });
    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received. We will be in touch shortly.',
      data: inquiry,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/inquiries  (PRIVATE) — admin lists inquiries, optional ?status= filter
export const getAllInquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/inquiries/:id  (PRIVATE) — admin views a single inquiry
export const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res
        .status(404)
        .json({ success: false, message: 'Inquiry not found' });
    }
    return res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/inquiries/:id  (PRIVATE) — admin updates status ('new'|'read'|'replied')
export const updateInquiry = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!inquiry) {
      return res
        .status(404)
        .json({ success: false, message: 'Inquiry not found' });
    }
    return res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/inquiries/:id  (PRIVATE) — admin deletes an inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res
        .status(404)
        .json({ success: false, message: 'Inquiry not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
