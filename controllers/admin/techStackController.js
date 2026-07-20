import TechStack from '../../models/TechStack.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

// -----------------------------------------------------------------------------
// ADMIN TechStack controller (private). Mounted under /api/admin/tech-stacks,
// behind the `protect` + `requireAdmin` gate applied once in routes/admin/
// index.js — so every handler assumes req.admin exists and never re-checks auth.
//
// NO MEDIA: a TechStack card's `icon` is a lucide component NAME (a string like
// 'Code2'), not an uploaded asset — so there is no Cloudinary lifecycle here.
// This is the reference pattern for the project's media-free models. Requests
// are plain JSON (no multipart, no upload middleware on the routes).
// -----------------------------------------------------------------------------

// Normalize `technologies`: JSON string (rare) or array → array of strings.
const toArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value ? [value] : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return fallback;
};

// GET /api/admin/tech-stacks — list all (admin view), in display order.
export const listTechStacks = catchAsync(async (req, res) => {
  const techStacks = await TechStack.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, count: techStacks.length, data: techStacks });
});

// GET /api/admin/tech-stacks/:id — single card for the edit modal.
export const getTechStack = catchAsync(async (req, res) => {
  const techStack = await TechStack.findById(req.params.id);
  if (!techStack) {
    return res.status(404).json({ success: false, message: 'Tech stack not found' });
  }
  res.status(200).json({ success: true, data: techStack });
});

// POST /api/admin/tech-stacks — create.
export const createTechStack = catchAsync(async (req, res) => {
  const techStack = await TechStack.create({
    ...req.body,
    technologies: toArray(req.body.technologies),
  });
  res.status(201).json({ success: true, data: techStack });
});

// PUT /api/admin/tech-stacks/:id — update.
export const updateTechStack = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.body.technologies !== undefined) {
    payload.technologies = toArray(req.body.technologies);
  }

  const techStack = await TechStack.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!techStack) {
    return res.status(404).json({ success: false, message: 'Tech stack not found' });
  }
  res.status(200).json({ success: true, data: techStack });
});

// DELETE /api/admin/tech-stacks/:id — delete (no assets to clean up).
export const deleteTechStack = catchAsync(async (req, res) => {
  const techStack = await TechStack.findByIdAndDelete(req.params.id);
  if (!techStack) {
    return res.status(404).json({ success: false, message: 'Tech stack not found' });
  }
  res.status(200).json({ success: true, message: 'Tech stack deleted successfully' });
});
