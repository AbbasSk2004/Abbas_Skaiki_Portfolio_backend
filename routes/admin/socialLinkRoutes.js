import express from 'express';
import {
  listSocialLinks,
  getSocialLink,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../controllers/admin/socialLinkController.js';

// -----------------------------------------------------------------------------
// ADMIN SocialLink routes — mounted at /api/admin/social-links, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// NO upload middleware: `icon` is a lucide icon NAME, not an uploaded file.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listSocialLinks);
router.get('/:id', getSocialLink);
router.post('/', createSocialLink);
router.put('/:id', updateSocialLink);
router.delete('/:id', deleteSocialLink);

export default router;
