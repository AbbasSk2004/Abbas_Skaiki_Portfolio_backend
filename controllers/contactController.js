import ContactInfo from '../models/ContactInfo.js';

// PUBLIC, read-only. The private upsert now lives in the admin controller
// (controllers/admin/contactController.js), reachable only via
// PUT /api/admin/contact behind protect + requireAdmin.

// GET /api/contact  (PUBLIC) — the singleton contact document, socialLinks populated.
export const getContactInfo = async (req, res) => {
  try {
    const contact = await ContactInfo.findOne()
      .sort({ createdAt: 1 })
      .populate('socialLinks');
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: 'Contact info not set yet' });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
