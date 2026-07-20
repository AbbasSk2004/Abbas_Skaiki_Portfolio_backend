import express from 'express';
import {
  getAllTechStacks,
  getTechStack,
} from '../controllers/techStackController.js';

const router = express.Router();

// PUBLIC read-only. Writes moved to /api/admin/tech-stacks
// (routes/admin/techStackRoutes.js), gated by protect + requireAdmin.
router.get('/', getAllTechStacks);
router.get('/:id', getTechStack);

export default router;
