import Project from '../../models/Project.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset, destroyAssets } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN Project controller (private). Mounted under /api/admin/projects, behind
// the `protect` gate applied once in routes/admin/index.js — so every handler
// here can assume req.admin exists and never re-checks auth.
//
// Public reads still live in controllers/projectController.js (GET-only). This
// file owns every mutation, plus the Cloudinary asset lifecycle: images arrive
// as multipart files (uploaded to Cloudinary by upload.js middleware, which
// puts their secure_urls on req.files), and any image this controller removes
// or replaces is destroyed so the Cloudinary account never accumulates orphans.
// -----------------------------------------------------------------------------

// Collect Cloudinary secure_urls from a multer .array('images') upload.
// upload.js stores each file and exposes its hosted URL as `file.path`.
const filesToUrls = (req) =>
  Array.isArray(req.files) ? req.files.map((f) => f.path).filter(Boolean) : [];

// GET /api/admin/projects — list all (admin view, no ISR/caching concerns).
export const listProjects = catchAsync(async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// GET /api/admin/projects/:id — single project for the edit modal.
export const getProject = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  res.status(200).json({ success: true, data: project });
});

// POST /api/admin/projects — create.
// Accepts JSON fields + optional multipart `images` files. Newly uploaded image
// URLs are appended to any `images` URLs passed in the body (e.g. external links).
export const createProject = catchAsync(async (req, res) => {
  const uploaded = filesToUrls(req);

  // body.images may be a JSON string (multipart) or an array (json). Normalize.
  let bodyImages = req.body.images ?? [];
  if (typeof bodyImages === 'string') {
    try {
      bodyImages = JSON.parse(bodyImages);
    } catch {
      bodyImages = bodyImages ? [bodyImages] : [];
    }
  }

  const images = [...(Array.isArray(bodyImages) ? bodyImages : []), ...uploaded];

  try {
    const project = await Project.create({ ...req.body, images });
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    // Roll back any freshly uploaded assets so a validation failure (e.g.
    // duplicate slug) doesn't strand files in Cloudinary.
    if (uploaded.length) await destroyAssets(uploaded);
    throw error; // globalErrorHandler formats validation / duplicate-key errors
  }
});

// PUT /api/admin/projects/:id — update.
// Any newly uploaded files are appended. Any images present on the old doc but
// absent from the incoming `images` list are treated as removed and destroyed.
export const updateProject = catchAsync(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const uploaded = filesToUrls(req);

  let bodyImages = req.body.images ?? existing.images;
  if (typeof bodyImages === 'string') {
    try {
      bodyImages = JSON.parse(bodyImages);
    } catch {
      bodyImages = bodyImages ? [bodyImages] : [];
    }
  }
  const keptImages = Array.isArray(bodyImages) ? bodyImages : [];
  const nextImages = [...keptImages, ...uploaded];

  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: nextImages },
      { new: true, runValidators: true }
    );

    // Destroy images the admin dropped from the set (present before, gone now).
    const removed = existing.images.filter((url) => !nextImages.includes(url));
    if (removed.length) await destroyAssets(removed);

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    // Validation failed — clean up the files we just uploaded for this attempt.
    if (uploaded.length) await destroyAssets(uploaded);
    throw error;
  }
});

// DELETE /api/admin/projects/:id — delete doc + all its Cloudinary images.
export const deleteProject = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  await project.deleteOne();

  // Best-effort asset cleanup — never blocks or fails the delete response.
  if (project.images?.length) await destroyAssets(project.images);

  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});
