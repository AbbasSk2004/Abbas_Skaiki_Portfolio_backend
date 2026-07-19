import About from '../models/About.js';

// GET /api/about  (PUBLIC) — return the singleton About document
export const getAbout = async (req, res) => {
  try {
    // About is a single-document collection; return the first (and only) doc.
    const about = await About.findOne().sort({ createdAt: 1 });
    if (!about) {
      return res
        .status(404)
        .json({ success: false, message: 'About information not set yet' });
    }
    return res.status(200).json({ success: true, data: about });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/about  (PRIVATE) — upsert the singleton About document
export const updateAbout = async (req, res) => {
  try {
    const { bio, resumeLink, availabilityStatus, aboutImage } = req.body;

    // Upsert: update the existing singleton, or create it if none exists.
    // aboutImage is included so the portrait URL isn't wiped on every update.
    const about = await About.findOneAndUpdate(
      {},
      { bio, resumeLink, availabilityStatus, aboutImage },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({ success: true, data: about });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
