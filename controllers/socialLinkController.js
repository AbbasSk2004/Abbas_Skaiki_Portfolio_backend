import SocialLink from '../models/SocialLink.js';

// PUBLIC, read-only. Every write (create/update/delete) now lives in the admin
// controller (controllers/admin/socialLinkController.js), reachable only via
// /api/admin/social-links behind protect + requireAdmin.

// GET /api/social-links  (PUBLIC)
export const getAllSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLink.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: socialLinks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/social-links/:id  (PUBLIC)
export const getSocialLink = async (req, res) => {
  try {
    const socialLink = await SocialLink.findById(req.params.id);
    if (!socialLink) {
      return res
        .status(404)
        .json({ success: false, message: 'Social link not found' });
    }
    return res.status(200).json({ success: true, data: socialLink });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
