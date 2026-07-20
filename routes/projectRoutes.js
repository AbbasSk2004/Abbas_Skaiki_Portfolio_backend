import express from 'express';
import { getAllProjects, getProject } from '../controllers/projectController.js';

const router = express.Router();

// -----------------------------------------------------------------------------
// PUBLIC project router — READ-ONLY.
//
// All writes (create/update/delete) have moved to the private admin subtree:
//   back/routes/admin/projectRoutes.js  (mounted under /api/admin/projects,
//   gated by protect + requireAdmin). This router now serves only the two
//   public GETs, so there is zero chance of an unauthenticated mutation reaching
//   this base path. Keep it that way — never re-add POST/PUT/DELETE here.
// -----------------------------------------------------------------------------
router.get('/', getAllProjects);
router.get('/:id', getProject);

export default router;
