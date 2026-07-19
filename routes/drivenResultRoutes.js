import express from 'express';
import {
  getAllDrivenResults,
  getDrivenResult,
  createDrivenResult,
  updateDrivenResult,
  deleteDrivenResult,
} from '../controllers/drivenResultController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public reads
router.get('/', getAllDrivenResults);
router.get('/:id', getDrivenResult);

// Private writes (admin only)
router.post('/', protect, createDrivenResult);
router.put('/:id', protect, updateDrivenResult);
router.delete('/:id', protect, deleteDrivenResult);

export default router;
