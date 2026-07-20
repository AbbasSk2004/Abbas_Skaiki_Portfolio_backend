import Inquiry from '../models/Inquiry.js';

// PUBLIC only. Admin read/manage (list/get/status/delete) now lives in the admin
// controller (controllers/admin/inquiryController.js), reachable only via
// /api/admin/inquiries behind protect + requireAdmin.

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
