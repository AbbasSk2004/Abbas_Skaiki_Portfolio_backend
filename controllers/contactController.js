import ContactInfo from '../models/ContactInfo.js';

// GET /api/contact  (PUBLIC) — the singleton contact document, socialLinks populated.
export const getContactInfo = async (req, res) => {
  try {
    const contact = await ContactInfo.findOne()
      .sort({ createdAt: 1 })
      .populate('socialLinks');
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: 'Contact info not set yet' });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/contact  (PRIVATE) — upsert the singleton contact document.
// Whitelists editable fields; socialLinks accepts an array of SocialLink _ids.
export const updateContactInfo = async (req, res) => {
  try {
    const { email, phone, address, availabilityNote, socialLinks } = req.body;

    const contact = await ContactInfo.findOneAndUpdate(
      {},
      { email, phone, address, availabilityNote, socialLinks },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate('socialLinks');

    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
