import DrivenResult from '../models/DrivenResult.js';

// PUBLIC, read-only. Every write (create/update/delete) now lives in
// controllers/admin/drivenResultController.js, reachable only under
// /api/admin/driven-results (protect + requireAdmin).

// GET /api/driven-results  (PUBLIC) — populates the referenced project when present
export const getAllDrivenResults = async (req, res) => {
  try {
    const results = await DrivenResult.find()
      .populate('projectRef', 'title slug')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/driven-results/:id  (PUBLIC)
export const getDrivenResult = async (req, res) => {
  try {
    const result = await DrivenResult.findById(req.params.id).populate(
      'projectRef',
      'title slug'
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: 'Driven result not found' });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
