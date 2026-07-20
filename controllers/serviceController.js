import Service from '../models/Service.js';

// -----------------------------------------------------------------------------
// PUBLIC Service controller — read-only. All mutations (create/update/delete +
// Cloudinary asset lifecycle) now live in controllers/admin/serviceController.js
// and are served under /api/admin/services. Keeping this file GET-only enforces
// the public/private separation at the controller layer, not just the router.
// -----------------------------------------------------------------------------

// GET /api/services  (PUBLIC) — list all services, ordered
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services/:id  (PUBLIC)
export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
