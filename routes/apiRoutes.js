import express from 'express';
import {
  getHero,
  getAbout,
  getApproach,
  getServices,
  getTestimonials,
  getDrivenResults,
  getTechStacks,
  getSocialLinks,
  getProjects,
  getProjectBySlug,
  getPortfolio,
} from '../controllers/portfolioController.js';
import { getContactInfo, updateContactInfo } from '../controllers/contactController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// -----------------------------------------------------------------------------
// Public read-only aggregator, mounted at /api (see server.js).
//
// ⚠️ COLLISION NOTE: server.js already mounts dedicated CRUD routers at
//   /api/projects, /api/services, /api/testimonials, /api/about,
//   /api/approaches, /api/tech-stacks, /api/social-links, /api/driven-results
// Two routers matching the same base path is order-dependent and fragile, so
// this router deliberately AVOIDS re-declaring those bases. It only adds paths
// that don't already exist:
//   - /api/hero              (no hero router exists at all)
//   - /api/portfolio         (new aggregate endpoint)
//   - /api/projects/slug/:s  (slug lookup the existing :id route can't serve)
//
// The commented block at the bottom shows the "one router to rule them all"
// layout IF you later retire the per-resource routers. Don't enable both.
// -----------------------------------------------------------------------------

// New, non-colliding endpoints — safe to mount alongside the existing routers.
router.get('/hero', getHero);
router.get('/portfolio', getPortfolio);

// Contact info singleton — public read, admin-only update. No dedicated
// ContactInfo router is mounted in server.js, so /api/contact is free.
router.get('/contact', getContactInfo);
router.put('/contact', protect, updateContactInfo);

// Slug lookup for /works/[slug]. Registered here because the existing
// /api/projects/:id router matches by _id only. This lives under a distinct
// /portfolio-projects base to stay clear of the mounted /api/projects router.
router.get('/portfolio-projects/slug/:slug', getProjectBySlug);

// ---------------------------------------------------------------------------
// OPTIONAL unified read-layer. Enable ONLY if you remove the corresponding
// per-resource routers from server.js first, otherwise the earlier-mounted
// router wins and these are dead code.
//
// router.get('/about', getAbout);
// router.get('/approach', getApproach);
// router.get('/services', getServices);
// router.get('/testimonials', getTestimonials);
// router.get('/driven-results', getDrivenResults);
// router.get('/tech-stacks', getTechStacks);
// router.get('/social-links', getSocialLinks);
// router.get('/projects', getProjects);
// router.get('/projects/slug/:slug', getProjectBySlug);
// ---------------------------------------------------------------------------

export default router;
