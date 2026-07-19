import express from 'express';
import {
  getAllTechStacks,
  getTechStack,
  createTechStack,
  updateTechStack,
  deleteTechStack,
} from '../controllers/techStackController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public reads
router.get('/', getAllTechStacks);
router.get('/:id', getTechStack);

// Private writes (admin only)
router.post('/', protect, createTechStack);
router.put('/:id', protect, updateTechStack);
router.delete('/:id', protect, deleteTechStack);

export default router;
