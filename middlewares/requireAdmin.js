// -----------------------------------------------------------------------------
// Admin authorization hardening layer.
//
// `protect` (authMiddleware.js) already verifies the JWT cookie and loads the
// admin — for a single-admin system that IS the authorization boundary. This
// middleware is the explicit second gate mounted on the /api/admin router so
// the intent ("this subtree is admin-only") is declared in one obvious place
// rather than implied by every route remembering to add `protect`. It also
// gives us a single seam to add role checks later without touching each route.
// -----------------------------------------------------------------------------

/**
 * Asserts that `protect` ran first and attached a valid admin. Because the
 * admin router mounts `protect` immediately before this, reaching here without
 * req.admin means a misconfiguration — fail closed with 401.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Admin session required.',
    });
  }

  // Single-admin model: presence of a verified admin is sufficient. If a
  // `role` field is added to the Admin schema later, enforce it here, e.g.:
  //   if (req.admin.role !== 'admin') return res.status(403).json(...)
  next();
};

export default requireAdmin;
