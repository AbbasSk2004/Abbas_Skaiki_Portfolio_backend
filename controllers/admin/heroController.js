import Hero from '../../models/Hero.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN Hero controller (private). Mounted under /api/admin/hero, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON: Hero is a single-document collection (get + upsert), same shape as
// the About slice. Media: ONE image (`headerImage`) with full replace/clear
// destroy semantics.
// -----------------------------------------------------------------------------

const fileUrl = (req) => req.file?.path || null;

// GET /api/admin/hero — the singleton doc (may be null before first save).
export const getHero = catchAsync(async (req, res) => {
  const hero = await Hero.findOne().sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: hero });
});

// PUT /api/admin/hero — upsert the singleton.
export const updateHero = catchAsync(async (req, res) => {
  const existing = await Hero.findOne().sort({ createdAt: 1 });
  const uploaded = fileUrl(req);

  const { firstName, lastName, roleLabel, intro, badge } = req.body;

  let nextImage = existing?.headerImage ?? '';
  if (uploaded) nextImage = uploaded;
  else if (req.body.headerImage !== undefined) nextImage = req.body.headerImage;

  try {
    const hero = await Hero.findOneAndUpdate(
      {},
      { firstName, lastName, roleLabel, intro, badge, headerImage: nextImage },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (existing?.headerImage && existing.headerImage !== nextImage) {
      await destroyAsset(existing.headerImage);
    }

    return res.status(200).json({ success: true, data: hero });
  } catch (error) {
    if (uploaded) await destroyAsset(uploaded);
    throw error;
  }
});
