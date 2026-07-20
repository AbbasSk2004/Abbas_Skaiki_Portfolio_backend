import express from 'express';
import { getAllDrivenResults, getDrivenResult } from '../controllers/drivenResultController.js';

// PUBLIC, read-only. Every write now lives under /api/admin/driven-results
// (routes/admin/drivenResultRoutes.js), gated by protect + requireAdmin.
const router = express.Router();

router.get('/', getAllDrivenResults);
router.get('/:id', getDrivenResult);

export default router;
