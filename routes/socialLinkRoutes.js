import express from 'express';
import {
  getAllSocialLinks,
  getSocialLink,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../controllers/socialLinkController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public reads
router.get('/', getAllSocialLinks);
router.get('/:id', getSocialLink);

// Private writes (admin only)
router.post('/', protect, createSocialLink);
router.put('/:id', protect, updateSocialLink);
router.delete('/:id', protect, deleteSocialLink);

export default router;
