import Project from '../../models/Project.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset, destroyAssets } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN Project controller (private). Mounted under /api/admin/projects, behind
// the `protect` gate applied once in routes/admin/index.js — so every handler
// here can assume req.admin exists and never re-checks auth.
//
// Public reads still live in controllers/projectController.js (GET-only). This
// file owns every mutation, plus the Cloudinary asset lifecycle: media arrives
// as multipart files (uploaded to Cloudinary by upload.js middleware). The route
// uses upload.fields([{ coverImage }, { images }]), so req.files is an OBJECT
// keyed by field name — req.files.coverImage[0] and req.files.images[] — each
// file exposing its hosted URL as `file.path`. Any image this controller removes
// or replaces (a dropped gallery image, or a swapped-out cover) is destroyed so
// the Cloudinary account never accumulates orphans.
// -----------------------------------------------------------------------------

// upload.fields() puts files on req.files as { fieldName: File[] }. Pull the
// hosted Cloudinary secure_urls (multer-storage-cloudinary exposes them as
// `file.path`) for a given field.
const fieldUrls = (req, field) => {
  const files = req.files?.[field];
  return Array.isArray(files) ? files.map((f) => f.path).filter(Boolean) : [];
};

// Gallery images (the multi-upload "images" field).
const galleryUrls = (req) => fieldUrls(req, 'images');

// The single cover image, or null when none was uploaded this request.
const coverUrl = (req) => fieldUrls(req, 'coverImage')[0] ?? null;

// When a request arrives as multipart/form-data (i.e. an image was attached),
// FormData can only carry strings — so the client JSON-stringifies array fields
// like `tags` / `stack` before appending them. Parse them back into real arrays
// before they reach Mongoose, otherwise the [String] schema stores the whole
// JSON blob as a single element (["[\"UI/UX DESIGN\"]"]). On a plain JSON
// request the value is already an array and passes through untouched.
const parseArrayField = (field) => {
  if (typeof field !== 'string') return field;
  try {
    return JSON.parse(field);
  } catch {
    return field.split(',').map((item) => item.trim()).filter(Boolean);
  }
};

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
// Accepts JSON fields + optional multipart `coverImage` (single) and `images`
// files. A newly uploaded cover replaces any coverImage URL in the body; newly
// uploaded gallery URLs are appended to any `images` URLs passed in the body.
export const createProject = catchAsync(async (req, res) => {
  const uploadedGallery = galleryUrls(req);
  const uploadedCover = coverUrl(req);

  // body.images may be a JSON string (multipart) or an array (json). Normalize.
  let bodyImages = req.body.images ?? [];
  if (typeof bodyImages === 'string') {
    try {
      bodyImages = JSON.parse(bodyImages);
    } catch {
      bodyImages = bodyImages ? [bodyImages] : [];
    }
  }

  const images = [...(Array.isArray(bodyImages) ? bodyImages : []), ...uploadedGallery];
  // A freshly uploaded file wins; otherwise fall back to any coverImage URL sent
  // in the body (e.g. an external link). Never let the raw body value survive if
  // a file was uploaded.
  const coverImage = uploadedCover ?? req.body.coverImage ?? '';

  // Intercept FormData-stringified arrays and parse them back before saving.
  if (req.body.tags) req.body.tags = parseArrayField(req.body.tags);
  if (req.body.stack) req.body.stack = parseArrayField(req.body.stack);

  try {
    const project = await Project.create({ ...req.body, coverImage, images });
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    // Roll back any freshly uploaded assets so a validation failure (e.g.
    // duplicate slug) doesn't strand files in Cloudinary.
    const orphans = [...uploadedGallery];
    if (uploadedCover) orphans.push(uploadedCover);
    if (orphans.length) await destroyAssets(orphans);
    throw error; // globalErrorHandler formats validation / duplicate-key errors
  }
});

// PUT /api/admin/projects/:id — update.
// Gallery: newly uploaded files are appended; any images present on the old doc
// but absent from the incoming `images` list are destroyed. Cover: a newly
// uploaded coverImage replaces the old one (which is destroyed); otherwise the
// body's coverImage value is honored (kept, cleared, or swapped for an external
// URL), and a cover that is no longer referenced anywhere is destroyed.
export const updateProject = catchAsync(async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const uploadedGallery = galleryUrls(req);
  const uploadedCover = coverUrl(req);

  let bodyImages = req.body.images ?? existing.images;
  if (typeof bodyImages === 'string') {
    try {
      bodyImages = JSON.parse(bodyImages);
    } catch {
      bodyImages = bodyImages ? [bodyImages] : [];
    }
  }
  const keptImages = Array.isArray(bodyImages) ? bodyImages : [];
  const nextImages = [...keptImages, ...uploadedGallery];

  // Resolve the next cover: uploaded file wins; else an explicit body value
  // (present in multipart/JSON) is honored; else the existing cover is kept.
  const nextCover =
    uploadedCover ??
    (req.body.coverImage !== undefined ? req.body.coverImage : existing.coverImage);

  // Intercept FormData-stringified arrays and parse them back before saving.
  if (req.body.tags) req.body.tags = parseArrayField(req.body.tags);
  if (req.body.stack) req.body.stack = parseArrayField(req.body.stack);

  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, coverImage: nextCover, images: nextImages },
      { new: true, runValidators: true }
    );

    // Destroy gallery images the admin dropped from the set (present before, gone now).
    const removed = existing.images.filter((url) => !nextImages.includes(url));
    // Destroy the old cover if it changed and isn't reused elsewhere in the doc.
    if (
      existing.coverImage &&
      existing.coverImage !== nextCover &&
      existing.coverImage !== project.coverImage &&
      !nextImages.includes(existing.coverImage)
    ) {
      removed.push(existing.coverImage);
    }
    if (removed.length) await destroyAssets(removed);

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    // Validation failed — clean up the files we just uploaded for this attempt.
    const orphans = [...uploadedGallery];
    if (uploadedCover) orphans.push(uploadedCover);
    if (orphans.length) await destroyAssets(orphans);
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
  // Includes the dedicated cover image alongside the gallery.
  const assets = [...(project.images ?? [])];
  if (project.coverImage) assets.push(project.coverImage);
  if (assets.length) await destroyAssets(assets);

  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});
