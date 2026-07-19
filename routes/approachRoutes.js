import express from 'express';
import {
  getAllApproaches,
  getApproach,
  createApproach,
  updateApproach,
  deleteApproach,
} from '../controllers/approachController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public reads
router.get('/', getAllApproaches);
router.get('/:id', getApproach);

// Private writes (admin only)
router.post('/', protect, createApproach);
router.put('/:id', protect, updateApproach);
router.delete('/:id', protect, deleteApproach);

export default router;
