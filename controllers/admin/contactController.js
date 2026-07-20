import ContactInfo from '../../models/ContactInfo.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

// -----------------------------------------------------------------------------
// ADMIN ContactInfo controller (private). Mounted under /api/admin/contact,
// behind the `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON, NO MEDIA. `socialLinks` is an array of SocialLink _ids that gets
// populated on read so the admin form shows the full linked documents. Editable
// fields are whitelisted — the same set the public updateContactInfo honored.
// -----------------------------------------------------------------------------

// GET /api/admin/contact — the singleton doc with socialLinks populated.
export const getContactInfo = catchAsync(async (req, res) => {
  const contact = await ContactInfo.findOne()
    .sort({ createdAt: 1 })
    .populate('socialLinks');
  res.status(200).json({ success: true, data: contact });
});

// PUT /api/admin/contact — upsert the singleton. socialLinks accepts an array
// of SocialLink _ids; everything else is a scalar contact field.
export const updateContactInfo = catchAsync(async (req, res) => {
  const { email, phone, address, availabilityNote, socialLinks } = req.body;

  const contact = await ContactInfo.findOneAndUpdate(
    {},
    { email, phone, address, availabilityNote, socialLinks },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate('socialLinks');

  res.status(200).json({ success: true, data: contact });
});
