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

// POST /api/tech-stacks  (PRIVATE)
export const createTechStack = async (req, res) => {
  try {
    const techStack = await TechStack.create(req.body);
    return res.status(201).json({ success: true, data: techStack });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/tech-stacks/:id  (PRIVATE)
export const updateTechStack = async (req, res) => {
  try {
    const techStack = await TechStack.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!techStack) {
      return res
        .status(404)
        .json({ success: false, message: 'Tech stack not found' });
    }
    return res.status(200).json({ success: true, data: techStack });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/tech-stacks/:id  (PRIVATE)
export const deleteTechStack = async (req, res) => {
  try {
    const techStack = await TechStack.findByIdAndDelete(req.params.id);
    if (!techStack) {
      return res
        .status(404)
        .json({ success: false, message: 'Tech stack not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Tech stack deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
