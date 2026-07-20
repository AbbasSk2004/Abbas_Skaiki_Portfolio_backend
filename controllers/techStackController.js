import TechStack from '../models/TechStack.js';

// GET /api/tech-stacks  (PUBLIC)
export const getAllTechStacks = async (req, res) => {
  try {
    const techStacks = await TechStack.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: techStacks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tech-stacks/:id  (PUBLIC)
export const getTechStack = async (req, res) => {
  try {
    const techStack = await TechStack.findById(req.params.id);
    if (!techStack) {
      return res
        .status(404)
        .json({ success: false, message: 'Tech stack not found' });
    }
    return res.status(200).json({ success: true, data: techStack });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// Write handlers (create/update/delete) have MIGRATED to
// controllers/admin/techStackController.js and are served under /api/admin/
// tech-stacks behind the protect + requireAdmin gate. This public controller is
// intentionally read-only — see routes/techStackRoutes.js.
// -----------------------------------------------------------------------------
