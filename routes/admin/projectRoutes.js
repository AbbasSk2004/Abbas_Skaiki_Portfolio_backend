import express from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../../controllers/admin/projectController.js';
import { uploadImage } from '../../middlewares/upload.js';

// -----------------------------------------------------------------------------
// Admin CRUD for Project. Mounted at /api/admin/projects.
//
// The parent router (routes/admin/index.js) already applied protect +
// requireAdmin, so NOTHING here is public — no need to repeat the guard.
//
// Media: create/update accept up to 10 images under the multipart field
// "images", stored in Cloudinary under abbas-sk-portfolio/projects/. The
// controller reconciles old vs. new URLs and destroys orphans.
// -----------------------------------------------------------------------------
const router = express.Router();

const upload = uploadImage('projects');

router
  .route('/')
  .get(listProjects)
  .post(upload.array('images', 10), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(upload.array('images', 10), updateProject)
  .delete(deleteProject);

export default router;
