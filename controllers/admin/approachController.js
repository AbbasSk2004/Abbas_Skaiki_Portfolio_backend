import Approach from '../../models/Approach.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN Approach controller (private). Mounted under /api/admin/approaches,
// behind the `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON: Approach is now ONE section document — a single section image plus
// an ordered array of text-only steps. There is no per-step create/delete; the
// admin only reads the one doc and upserts it (get + put), same shape as the
// About / Hero singletons.
//
// Media: ONE section image (`approachImage`), uploaded via upload.js
// `.single('image')` (req.file.path holds the Cloudinary URL). A new upload
// replaces + destroys the old one; an explicit empty value with no new file
// clears + destroys it.
//
// `steps` arrives as a JSON string in multipart bodies (FormData can't carry a
// nested array natively) or as a real array in a plain-JSON body — both are
// normalized here before validation.
// -----------------------------------------------------------------------------

const fileUrl = (req) => req.file?.path || null;

// Normalize `steps`: JSON string (multipart) or array (json) → array of steps.
const parseSteps = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// GET /api/admin/approaches — the singleton doc (may be null before first save).
export const getApproach = catchAsync(async (req, res) => {
  const approach = await Approach.findOne().sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: approach });
});

// PUT /api/admin/approaches — upsert the singleton.
// A new upload wins; otherwise an explicit approachImage in the body is honored
// (including '' to clear); otherwise the existing image is preserved. `steps` is
// always replaced with the incoming (normalized) array when provided.
export const updateApproach = catchAsync(async (req, res) => {
  const existing = await Approach.findOne().sort({ createdAt: 1 });
  const uploaded = fileUrl(req);

  let nextImage = existing?.approachImage ?? '';
  if (uploaded) nextImage = uploaded;
  else if (req.body.approachImage !== undefined) nextImage = req.body.approachImage;

  const steps =
    req.body.steps !== undefined ? parseSteps(req.body.steps) : existing?.steps ?? [];

  try {
    const approach = await Approach.findOneAndUpdate(
      {},
      { approachImage: nextImage, steps },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Destroy the previous image if it was replaced or cleared.
    if (existing?.approachImage && existing.approachImage !== nextImage) {
      await destroyAsset(existing.approachImage);
    }

    return res.status(200).json({ success: true, data: approach });
  } catch (error) {
    // Validation failed — clean up the file we just uploaded for this attempt.
    if (uploaded) await destroyAsset(uploaded);
    throw error; // globalErrorHandler formats validation errors
  }
});
