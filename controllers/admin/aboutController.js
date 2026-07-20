import About from '../../models/About.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN About controller (private). Mounted under /api/admin/about, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON: About is a single-document collection. There is no create/list/
// delete — only "get the one doc" and "upsert the one doc". This is the
// reference pattern for the singleton models (About, Hero, ContactInfo).
//
// Media: ONE image (`aboutImage`). A new upload replaces + destroys the old one;
// an explicit empty value with no new file clears + destroys it.
// -----------------------------------------------------------------------------

const fileUrl = (req) => req.file?.path || null;

// GET /api/admin/about — the singleton doc (may be null before first save).
export const getAbout = catchAsync(async (req, res) => {
  const about = await About.findOne().sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: about });
});

// PUT /api/admin/about — upsert the singleton.
// A new upload wins; otherwise an explicit aboutImage in the body is honored
// (including '' to clear); otherwise the existing image is preserved.
export const updateAbout = catchAsync(async (req, res) => {
  const existing = await About.findOne().sort({ createdAt: 1 });
  const uploaded = fileUrl(req);

  const { bio, resumeLink, availabilityStatus } = req.body;

  let nextImage = existing?.aboutImage ?? '';
  if (uploaded) nextImage = uploaded;
  else if (req.body.aboutImage !== undefined) nextImage = req.body.aboutImage;

  try {
    const about = await About.findOneAndUpdate(
      {},
      { bio, resumeLink, availabilityStatus, aboutImage: nextImage },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Destroy the previous image if it was replaced or cleared.
    if (existing?.aboutImage && existing.aboutImage !== nextImage) {
      await destroyAsset(existing.aboutImage);
    }

    return res.status(200).json({ success: true, data: about });
  } catch (error) {
    if (uploaded) await destroyAsset(uploaded);
    throw error;
  }
});
