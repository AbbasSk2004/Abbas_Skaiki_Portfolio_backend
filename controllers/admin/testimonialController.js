import Testimonial from '../../models/Testimonial.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN Testimonial controller (private). Mounted under /api/admin/testimonials,
// behind the `protect` + `requireAdmin` gate applied once in routes/admin/
// index.js — so every handler assumes req.admin exists and never re-checks auth.
//
// Media: a testimonial carries ONE image (`avatar`). Uploaded via upload.js
// `.single('image')` (req.file.path holds the Cloudinary URL); replaced/cleared/
// deleted avatars are destroyed so no orphans accumulate. Same shape as the
// Service slice.
// -----------------------------------------------------------------------------

const fileUrl = (req) => req.file?.path || null;

// GET /api/admin/testimonials — list all (admin view), newest first.
export const listTestimonials = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
});

// GET /api/admin/testimonials/:id — single testimonial for the edit modal.
export const getTestimonial = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }
  res.status(200).json({ success: true, data: testimonial });
});

// POST /api/admin/testimonials — create.
export const createTestimonial = catchAsync(async (req, res) => {
  const uploaded = fileUrl(req);
  const avatar = uploaded || req.body.avatar || '';

  try {
    const testimonial = await Testimonial.create({ ...req.body, avatar });
    return res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    if (uploaded) await destroyAsset(uploaded);
    throw error;
  }
});

// PUT /api/admin/testimonials/:id — update. New upload replaces old avatar;
// empty `avatar` with no file clears + destroys the existing one.
export const updateTestimonial = catchAsync(async (req, res) => {
  const existing = await Testimonial.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }

  const uploaded = fileUrl(req);

  let nextAvatar = existing.avatar;
  if (uploaded) nextAvatar = uploaded;
  else if (req.body.avatar !== undefined) nextAvatar = req.body.avatar;

  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, avatar: nextAvatar },
      { new: true, runValidators: true }
    );

    if (existing.avatar && existing.avatar !== nextAvatar) {
      await destroyAsset(existing.avatar);
    }

    return res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    if (uploaded) await destroyAsset(uploaded);
    throw error;
  }
});

// DELETE /api/admin/testimonials/:id — delete doc + its Cloudinary avatar.
export const deleteTestimonial = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }

  await testimonial.deleteOne();

  if (testimonial.avatar) await destroyAsset(testimonial.avatar);

  res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
});
