import Service from '../../models/Service.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { destroyAsset } from '../../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// ADMIN Service controller (private). Mounted under /api/admin/services, behind
// the `protect` + `requireAdmin` gate applied once in routes/admin/index.js — so
// every handler here can assume req.admin exists and never re-checks auth.
//
// Media: Service carries ONE image (`serviceImage`). The upload middleware
// (upload.js `.single('image')`) uploads it to Cloudinary and exposes the hosted
// URL on req.file.path. On replace/clear/delete we destroy the previous asset so
// the account never accumulates orphans — mirroring the Projects slice.
// -----------------------------------------------------------------------------

// Cloudinary secure_url from a multer `.single('image')` upload, if any.
const fileUrl = (req) => req.file?.path || null;

// GET /api/admin/services — list all (admin view), preserving display order.
export const listServices = catchAsync(async (req, res) => {
  const services = await Service.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, count: services.length, data: services });
});

// GET /api/admin/services/:id — single service for the edit modal.
export const getService = catchAsync(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.status(200).json({ success: true, data: service });
});

// POST /api/admin/services — create.
// Accepts JSON fields + an optional multipart `image` file. A freshly uploaded
// image wins over any serviceImage URL in the body.
export const createService = catchAsync(async (req, res) => {
  const uploaded = fileUrl(req);
  const serviceImage = uploaded || req.body.serviceImage || '';

  // tags may arrive as a JSON string (multipart) or an array (json). Normalize.
  let tags = req.body.tags ?? [];
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = tags ? [tags] : [];
    }
  }

  try {
    const service = await Service.create({
      ...req.body,
      tags: Array.isArray(tags) ? tags : [],
      serviceImage,
    });
    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    // Roll back the freshly uploaded asset so a validation failure doesn't
    // strand a file in Cloudinary.
    if (uploaded) await destroyAsset(uploaded);
    throw error; // globalErrorHandler formats validation / duplicate-key errors
  }
});

// PUT /api/admin/services/:id — update.
// A new upload replaces the old image (old one destroyed). Passing an empty
// serviceImage with no new file clears + destroys the existing image.
export const updateService = catchAsync(async (req, res) => {
  const existing = await Service.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }

  const uploaded = fileUrl(req);

  let tags = req.body.tags ?? existing.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = tags ? [tags] : [];
    }
  }

  // Resolve the next image URL: new upload > explicit body value > unchanged.
  let nextImage = existing.serviceImage;
  if (uploaded) nextImage = uploaded;
  else if (req.body.serviceImage !== undefined) nextImage = req.body.serviceImage;

  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, tags: Array.isArray(tags) ? tags : [], serviceImage: nextImage },
      { new: true, runValidators: true }
    );

    // Destroy the previous image if it was replaced or cleared.
    if (existing.serviceImage && existing.serviceImage !== nextImage) {
      await destroyAsset(existing.serviceImage);
    }

    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    if (uploaded) await destroyAsset(uploaded);
    throw error;
  }
});

// DELETE /api/admin/services/:id — delete doc + its Cloudinary image.
export const deleteService = catchAsync(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }

  await service.deleteOne();

  // Best-effort asset cleanup — never blocks or fails the delete response.
  if (service.serviceImage) await destroyAsset(service.serviceImage);

  res.status(200).json({ success: true, message: 'Service deleted successfully' });
});
