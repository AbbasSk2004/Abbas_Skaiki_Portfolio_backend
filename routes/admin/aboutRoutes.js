import express from 'express';
import { getAbout, updateAbout } from '../../controllers/admin/aboutController.js';
import { uploadImage } from '../../middlewares/upload.js';

// -----------------------------------------------------------------------------
// ADMIN About routes — mounted at /api/admin/about, behind the `protect` +
// `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON: only a read + an upsert. About carries ONE image (aboutImage),
// uploaded via .single('image') into the Cloudinary `about/` subfolder.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', getAbout);
router.put('/', uploadImage('about').single('image'), updateAbout);

export default router;
