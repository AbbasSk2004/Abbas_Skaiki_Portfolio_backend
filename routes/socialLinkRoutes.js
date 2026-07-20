import express from 'express';
import { getAllSocialLinks, getSocialLink } from '../controllers/socialLinkController.js';

// PUBLIC, read-only. Every write now lives under /api/admin/social-links
// (routes/admin/socialLinkRoutes.js), gated by protect + requireAdmin.
const router = express.Router();

router.get('/', getAllSocialLinks);
router.get('/:id', getSocialLink);

export default router;
