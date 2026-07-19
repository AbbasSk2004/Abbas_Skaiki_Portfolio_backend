import Approach from '../models/Approach.js';

// GET /api/approaches  (PUBLIC) — ordered by step number
export const getAllApproaches = async (req, res) => {
  try {
    const approaches = await Approach.find().sort({ stepNumber: 1 });
    return res.status(200).json({ success: true, data: approaches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/approaches/:id  (PUBLIC)
export const getApproach = async (req, res) => {
  try {
    const approach = await Approach.findById(req.params.id);
    if (!approach) {
      return res
        .status(404)
        .json({ success: false, message: 'Approach step not found' });
    }
    return res.status(200).json({ success: true, data: approach });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/approaches  (PRIVATE)
export const createApproach = async (req, res) => {
  try {
    const approach = await Approach.create(req.body);
    return res.status(201).json({ success: true, data: approach });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/approaches/:id  (PRIVATE)
export const updateApproach = async (req, res) => {
  try {
    const approach = await Approach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!approach) {
      return res
        .status(404)
        .json({ success: false, message: 'Approach step not found' });
    }
    return res.status(200).json({ success: true, data: approach });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/approaches/:id  (PRIVATE)
export const deleteApproach = async (req, res) => {
  try {
    const approach = await Approach.findByIdAndDelete(req.params.id);
    if (!approach) {
      return res
        .status(404)
        .json({ success: false, message: 'Approach step not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Approach step deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
