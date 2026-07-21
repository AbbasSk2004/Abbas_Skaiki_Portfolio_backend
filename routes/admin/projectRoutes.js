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
// Media: create/update accept a single "coverImage" file (card/hero thumbnail)
// AND up to 10 gallery files under "images", stored in Cloudinary under
// abbas-sk-portfolio/projects/. The controller reconciles old vs. new URLs for
// both fields and destroys orphans.
// -----------------------------------------------------------------------------
const router = express.Router();

const upload = uploadImage('projects');

// Accept one cover image + up to 10 gallery images in a single multipart request.
const projectUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router
  .route('/')
  .get(listProjects)
  .post(projectUpload, createProject);

router
  .route('/:id')
  .get(getProject)
  .put(projectUpload, updateProject)
  .delete(deleteProject);

export default router;
