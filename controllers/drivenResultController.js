import DrivenResult from '../models/DrivenResult.js';

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

// POST /api/driven-results  (PRIVATE)
export const createDrivenResult = async (req, res) => {
  try {
    const result = await DrivenResult.create(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/driven-results/:id  (PRIVATE)
export const updateDrivenResult = async (req, res) => {
  try {
    const result = await DrivenResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: 'Driven result not found' });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/driven-results/:id  (PRIVATE)
export const deleteDrivenResult = async (req, res) => {
  try {
    const result = await DrivenResult.findByIdAndDelete(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: 'Driven result not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Driven result deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
