import express from 'express';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../../controllers/admin/serviceController.js';
import { uploadImage } from '../../middlewares/upload.js';

// -----------------------------------------------------------------------------
// ADMIN Service routes — mounted at /api/admin/services by routes/admin/index.js,
// which already applies `protect` + `requireAdmin` to the whole subtree. No auth
// middleware is repeated here; these handlers are private by construction.
//
// Service carries ONE image field (serviceImage), so uploads use .single('image')
// scoped to the Cloudinary `services/` subfolder.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', uploadImage('services').single('image'), createService);
router.put('/:id', uploadImage('services').single('image'), updateService);
router.delete('/:id', deleteService);

export default router;
