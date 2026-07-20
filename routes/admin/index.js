import express from 'express';
import { protect } from '../../middlewares/authMiddleware.js';
import requireAdmin from '../../middlewares/requireAdmin.js';
import { revalidatePublicContent } from '../../utils/revalidate.js';

// Per-model admin routers
import projectRoutes from './projectRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import techStackRoutes from './techStackRoutes.js';
import approachRoutes from './approachRoutes.js';
import drivenResultRoutes from './drivenResultRoutes.js';
import socialLinkRoutes from './socialLinkRoutes.js';
import aboutRoutes from './aboutRoutes.js';
import heroRoutes from './heroRoutes.js';
import contactRoutes from './contactRoutes.js';
import inquiryRoutes from './inquiryRoutes.js';
import callBookingRoutes from './callBookingRoutes.js';
import statsRoutes from './statsRoutes.js';

// -----------------------------------------------------------------------------
// Admin API aggregator, mounted at /api/admin in server.js.
//
// SECURITY: `protect` and `requireAdmin` are applied HERE, once, to the whole
// subtree. Every child router below is therefore private by construction — no
// individual admin route can be accidentally exposed, because the gate lives at
// the mount point, not in each file. This is the single choke point for all
// authenticated writes in the system.
// -----------------------------------------------------------------------------
const router = express.Router();

// 1. Validate the JWT cookie and attach req.admin (401 if missing/invalid).
router.use(protect);
// 2. Belt-and-suspenders: confirm the attached principal is a real admin.
router.use(requireAdmin);

// 3. Auto-revalidate the public site after any SUCCESSFUL mutating write.
//    DRY choke point: instead of calling revalidate in all ~26 create/update/
//    delete handlers, we hook it once here. On `res.finish` we check the verb
//    (skip GET) and the status (only 2xx) and fire a non-blocking cache purge.
//    The response has already been sent, so this never delays the admin reply.
router.use((req, res, next) => {
  const mutating = req.method !== 'GET' && req.method !== 'HEAD';
  if (mutating) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Fire-and-forget: revalidate helper swallows its own errors.
        revalidatePublicContent();
      }
    });
  }
  next();
});

// Mount per-model routers. Add one line here as each slice is built out.
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/tech-stacks', techStackRoutes);
router.use('/approaches', approachRoutes);
router.use('/driven-results', drivenResultRoutes);
router.use('/social-links', socialLinkRoutes);
router.use('/about', aboutRoutes);
router.use('/hero', heroRoutes);
router.use('/contact', contactRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/bookings', callBookingRoutes);
router.use('/stats', statsRoutes);

export default router;
