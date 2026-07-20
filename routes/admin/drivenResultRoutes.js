import express from 'express';
import {
  listDrivenResults,
  getDrivenResult,
  createDrivenResult,
  updateDrivenResult,
  deleteDrivenResult,
} from '../../controllers/admin/drivenResultController.js';

// -----------------------------------------------------------------------------
// ADMIN DrivenResult routes — mounted at /api/admin/driven-results, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// NO upload middleware: a metric is pure data. Plain JSON on every verb.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listDrivenResults);
router.get('/:id', getDrivenResult);
router.post('/', createDrivenResult);
router.put('/:id', updateDrivenResult);
router.delete('/:id', deleteDrivenResult);

export default router;
