import DrivenResult from '../../models/DrivenResult.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

// -----------------------------------------------------------------------------
// ADMIN DrivenResult controller (private). Mounted under /api/admin/driven-results,
// behind the `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// NO MEDIA: a metric is pure data (value/prefix/suffix/label/…), so requests are
// plain JSON — no upload middleware, no Cloudinary lifecycle. `projectRef` is an
// optional ObjectId; the empty string from a "none" <select> is coerced to null
// so Mongoose doesn't throw a CastError.
// -----------------------------------------------------------------------------

// An empty/absent projectRef must be stored as null, not '' (CastError).
const normalizeRef = (value) => (value ? value : null);

// GET /api/admin/driven-results — list all (admin view), in display order.
export const listDrivenResults = catchAsync(async (req, res) => {
  const results = await DrivenResult.find()
    .populate('projectRef', 'title slug')
    .sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, count: results.length, data: results });
});

// GET /api/admin/driven-results/:id — single metric for the edit modal.
export const getDrivenResult = catchAsync(async (req, res) => {
  const result = await DrivenResult.findById(req.params.id).populate(
    'projectRef',
    'title slug'
  );
  if (!result) {
    return res.status(404).json({ success: false, message: 'Driven result not found' });
  }
  res.status(200).json({ success: true, data: result });
});

// POST /api/admin/driven-results — create.
export const createDrivenResult = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if ('projectRef' in payload) payload.projectRef = normalizeRef(payload.projectRef);

  const result = await DrivenResult.create(payload);
  res.status(201).json({ success: true, data: result });
});

// PUT /api/admin/driven-results/:id — update.
export const updateDrivenResult = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if ('projectRef' in payload) payload.projectRef = normalizeRef(payload.projectRef);

  const result = await DrivenResult.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    return res.status(404).json({ success: false, message: 'Driven result not found' });
  }
  res.status(200).json({ success: true, data: result });
});

// DELETE /api/admin/driven-results/:id — delete (no assets to clean up).
export const deleteDrivenResult = catchAsync(async (req, res) => {
  const result = await DrivenResult.findByIdAndDelete(req.params.id);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Driven result not found' });
  }
  res.status(200).json({ success: true, message: 'Driven result deleted successfully' });
});
