import express from 'express';
import { getHero, updateHero } from '../../controllers/admin/heroController.js';
import { uploadImage } from '../../middlewares/upload.js';

// -----------------------------------------------------------------------------
// ADMIN Hero routes — mounted at /api/admin/hero, behind the `protect` +
// `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON: only a read + an upsert. Hero carries ONE image (headerImage),
// uploaded via .single('image') into the Cloudinary `hero/` subfolder.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', getHero);
router.put('/', uploadImage('hero').single('image'), updateHero);

export default router;
