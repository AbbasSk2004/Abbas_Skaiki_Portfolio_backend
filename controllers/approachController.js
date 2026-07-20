import Approach from '../models/Approach.js';

// PUBLIC, read-only. The write (upsert) now lives in the admin controller
// (controllers/admin/approachController.js), reachable only via
// PUT /api/admin/approaches behind protect + requireAdmin.
//
// Approach is a SINGLETON: one section document holding a single section image
// plus an ordered array of text-only steps.

// GET /api/approaches  (PUBLIC) — the singleton Approach section (or null).
export const getAllApproaches = async (req, res) => {
  try {
    const approach = await Approach.findOne().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: approach });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
