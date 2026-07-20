import express from 'express';
import { getApproach, updateApproach } from '../../controllers/admin/approachController.js';
import { uploadImage } from '../../middlewares/upload.js';

// -----------------------------------------------------------------------------
// ADMIN Approach routes — mounted at /api/admin/approaches, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON: get + upsert only (no per-step create/delete). The section carries
// ONE image (approachImage), uploaded via .single('image') into the Cloudinary
// `approach/` subfolder. `steps` rides along as a JSON string in the body.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', getApproach);
router.put('/', uploadImage('approach').single('image'), updateApproach);

export default router;
