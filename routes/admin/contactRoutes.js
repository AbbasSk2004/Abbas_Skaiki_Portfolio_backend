import express from 'express';
import {
  getContactInfo,
  updateContactInfo,
} from '../../controllers/admin/contactController.js';

// -----------------------------------------------------------------------------
// ADMIN ContactInfo routes — mounted at /api/admin/contact, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// SINGLETON, NO MEDIA: only a read + an upsert. socialLinks is an array of
// SocialLink _ids, populated on read.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', getContactInfo);
router.put('/', updateContactInfo);

export default router;
