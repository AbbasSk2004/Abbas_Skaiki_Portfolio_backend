import express from 'express';
import {
  listTechStacks,
  getTechStack,
  createTechStack,
  updateTechStack,
  deleteTechStack,
} from '../../controllers/admin/techStackController.js';

// -----------------------------------------------------------------------------
// ADMIN TechStack routes — mounted at /api/admin/tech-stacks, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// NO upload middleware: TechStack has no media asset. `icon` is a lucide icon
// NAME (a string the frontend maps to a component), not an uploaded file.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listTechStacks);
router.get('/:id', getTechStack);
router.post('/', createTechStack);
router.put('/:id', updateTechStack);
router.delete('/:id', deleteTechStack);

export default router;
