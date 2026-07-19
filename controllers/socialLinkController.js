import SocialLink from '../models/SocialLink.js';

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

// POST /api/social-links  (PRIVATE)
export const createSocialLink = async (req, res) => {
  try {
    const socialLink = await SocialLink.create(req.body);
    return res.status(201).json({ success: true, data: socialLink });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/social-links/:id  (PRIVATE)
export const updateSocialLink = async (req, res) => {
  try {
    const socialLink = await SocialLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!socialLink) {
      return res
        .status(404)
        .json({ success: false, message: 'Social link not found' });
    }
    return res.status(200).json({ success: true, data: socialLink });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/social-links/:id  (PRIVATE)
export const deleteSocialLink = async (req, res) => {
  try {
    const socialLink = await SocialLink.findByIdAndDelete(req.params.id);
    if (!socialLink) {
      return res
        .status(404)
        .json({ success: false, message: 'Social link not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Social link deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
