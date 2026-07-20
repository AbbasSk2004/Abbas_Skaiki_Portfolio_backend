import About from '../models/About.js';

// PUBLIC, read-only. The private upsert now lives in the admin controller
// (controllers/admin/aboutController.js), reachable only via
// PUT /api/admin/about behind protect + requireAdmin.

// GET /api/about  (PUBLIC) — return the singleton About document
export const getAbout = async (req, res) => {
  try {
    // About is a single-document collection; return the first (and only) doc.
    const about = await About.findOne().sort({ createdAt: 1 });
    if (!about) {
      return res
        .status(404)
        .json({ success: false, message: 'About information not set yet' });
    }
    return res.status(200).json({ success: true, data: about });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
