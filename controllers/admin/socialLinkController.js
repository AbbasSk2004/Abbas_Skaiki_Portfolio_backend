import SocialLink from '../../models/SocialLink.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

// -----------------------------------------------------------------------------
// ADMIN SocialLink controller (private). Mounted under /api/admin/social-links,
// behind the `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// NO MEDIA: `icon` is a lucide component NAME (a string), not an uploaded asset,
// so every request is plain JSON. Same reference pattern as TechStack.
// -----------------------------------------------------------------------------

// GET /api/admin/social-links — list all (admin view), oldest first (stable order).
export const listSocialLinks = catchAsync(async (req, res) => {
  const socialLinks = await SocialLink.find().sort({ createdAt: 1 });
  res.status(200).json({ success: true, count: socialLinks.length, data: socialLinks });
});

// GET /api/admin/social-links/:id — single link for the edit modal.
export const getSocialLink = catchAsync(async (req, res) => {
  const socialLink = await SocialLink.findById(req.params.id);
  if (!socialLink) {
    return res.status(404).json({ success: false, message: 'Social link not found' });
  }
  res.status(200).json({ success: true, data: socialLink });
});

// POST /api/admin/social-links — create.
export const createSocialLink = catchAsync(async (req, res) => {
  const socialLink = await SocialLink.create(req.body);
  res.status(201).json({ success: true, data: socialLink });
});

// PUT /api/admin/social-links/:id — update.
export const updateSocialLink = catchAsync(async (req, res) => {
  const socialLink = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!socialLink) {
    return res.status(404).json({ success: false, message: 'Social link not found' });
  }
  res.status(200).json({ success: true, data: socialLink });
});

// DELETE /api/admin/social-links/:id — delete (no assets to clean up).
export const deleteSocialLink = catchAsync(async (req, res) => {
  const socialLink = await SocialLink.findByIdAndDelete(req.params.id);
  if (!socialLink) {
    return res.status(404).json({ success: false, message: 'Social link not found' });
  }
  res.status(200).json({ success: true, message: 'Social link deleted successfully' });
});
