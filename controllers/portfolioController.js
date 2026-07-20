import Hero from '../models/Hero.js';
import About from '../models/About.js';
import Approach from '../models/Approach.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Testimonial from '../models/Testimonial.js';
import DrivenResult from '../models/DrivenResult.js';
import TechStack from '../models/TechStack.js';
import SocialLink from '../models/SocialLink.js';

// -----------------------------------------------------------------------------
// Unified public read-layer for the portfolio frontend.
//
// The existing per-resource controllers (projectController, serviceController,
// ...) already expose full CRUD. This controller is READ-ONLY and exists to
// give the Next.js frontend a small, purpose-built surface:
//   - single-document sections (Hero, About) returned as one object, not an array
//   - ordered lists where the frontend cares about order (Approach, Service, ...)
//   - a slug lookup for /works/[slug] (the existing route only does findById)
//   - one aggregate endpoint so the landing page can hydrate in a single request
//
// Every handler swallows nothing — errors bubble to a 500 with the message.
// -----------------------------------------------------------------------------

// GET /api/hero — single hero document (the most recent, if several exist).
export const getHero = async (req, res) => {
  try {
    const hero = await Hero.findOne().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: hero });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/about — single about document.
export const getAbout = async (req, res) => {
  try {
    const about = await About.findOne().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: about });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/approach — approach steps in step order.
export const getApproach = async (req, res) => {
  try {
    // Approach is a singleton section (one image + text steps), so return the
    // single document rather than a list.
    const approach = await Approach.findOne().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: approach });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services — services in display order.
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/testimonials — all testimonials.
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/driven-results — impact metrics in display order.
export const getDrivenResults = async (req, res) => {
  try {
    const results = await DrivenResult.find().sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tech-stacks — expertise/tech categories in display order.
export const getTechStacks = async (req, res) => {
  try {
    const techStacks = await TechStack.find().sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ success: true, data: techStacks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/social-links — social links in insertion order.
export const getSocialLinks = async (req, res) => {
  try {
    const socialLinks = await SocialLink.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: socialLinks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects — all projects, newest first.
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/projects/slug/:slug — single project by slug (for /works/[slug]).
// The existing projectController.getProject looks up by _id; the frontend routes
// by slug, so this is the lookup it actually needs.
export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug.toLowerCase(),
    });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'Project not found' });
    }
    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/portfolio — everything the landing page needs in one request.
// Single-doc sections come back as objects; the rest as ordered arrays.
export const getPortfolio = async (req, res) => {
  try {
    const [
      hero,
      about,
      approach,
      services,
      projects,
      testimonials,
      drivenResults,
      techStacks,
      socialLinks,
    ] = await Promise.all([
      Hero.findOne().sort({ createdAt: -1 }),
      About.findOne().sort({ createdAt: -1 }),
      Approach.findOne().sort({ createdAt: 1 }),
      Service.find().sort({ order: 1, createdAt: 1 }),
      Project.find().sort({ createdAt: -1 }),
      Testimonial.find().sort({ createdAt: 1 }),
      DrivenResult.find().sort({ order: 1, createdAt: 1 }),
      TechStack.find().sort({ order: 1, createdAt: 1 }),
      SocialLink.find().sort({ createdAt: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        hero,
        about,
        approach,
        services,
        projects,
        testimonials,
        drivenResults,
        techStacks,
        socialLinks,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
