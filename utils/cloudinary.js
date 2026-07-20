import cloudinary, { CLOUDINARY_ROOT } from '../config/cloudinary.js';

// -----------------------------------------------------------------------------
// Cloudinary asset lifecycle helpers.
//
// The upload path is already handled by multer-storage-cloudinary (see
// middlewares/upload.js). What was missing — and what makes media handling
// "bulletproof" during UPDATE and DELETE — is the reverse direction: turning a
// stored secure_url back into a public_id and destroying it so we never orphan
// assets in the Cloudinary account when a document's image changes or the doc
// is removed. Everything here is defensive: a failed destroy must never crash a
// CRUD response, so callers get a resolved summary rather than a throw.
//
// LOCAL-ASSET BYPASS: some seed data stores local fallback paths (e.g.
// '/assets/approach.png'). Those must NEVER be handed to the Cloudinary destroy
// API — it would be a wasted round-trip at best and an error at worst. The
// single source of truth for "is this ours to delete in the cloud?" is
// isCloudinaryImage(); extractPublicId() and destroyAsset() both defer to it, so
// the bypass is centralized in ONE place rather than re-checked in every
// controller.
// -----------------------------------------------------------------------------

/**
 * True only when `url` is a Cloudinary-hosted asset in OUR account namespace.
 *
 * This is the guard the whole module (and every controller) relies on: it
 * returns false for local paths ('/assets/...'), empty/undefined values, and any
 * external URL — so those are safely skipped instead of being sent to the
 * Cloudinary API. Requiring the CLOUDINARY_ROOT prefix also means we never try
 * to delete an asset that isn't ours, even if a foreign res.cloudinary.com URL
 * somehow reaches us.
 *
 * @param {string} url
 * @returns {boolean}
 */
export const isCloudinaryImage = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (!url.includes('res.cloudinary.com')) return false;
  if (!url.includes('/upload/')) return false;
  // Must live under abbas-sk-portfolio/ — the segment after the version part.
  const afterUpload = url.slice(url.indexOf('/upload/') + '/upload/'.length);
  const withoutVersion = afterUpload.replace(/^v\d+\//, '');
  return withoutVersion.startsWith(`${CLOUDINARY_ROOT}/`);
};

/**
 * Derive a Cloudinary public_id from a stored secure_url.
 *
 * Upload URLs look like:
 *   https://res.cloudinary.com/<cloud>/image/upload/v1699999999/abbas-sk-portfolio/projects/abc123.webp
 * The public_id is everything after the version segment, minus the extension:
 *   abbas-sk-portfolio/projects/abc123
 *
 * Returns null for anything that isn't a Cloudinary upload URL in our namespace
 * (external URLs, empty strings, local seed placeholders like '/assets/...') so
 * callers can skip the destroy safely. Delegates the ownership check to
 * isCloudinaryImage() so the "is this ours?" rule lives in exactly one place.
 *
 * @param {string} url
 * @returns {string|null}
 */
export const extractPublicId = (url) => {
  // Local paths, empty values, and foreign URLs are not ours to delete.
  if (!isCloudinaryImage(url)) return null;

  // Only touch assets under our own namespace — never attempt to delete
  // something outside abbas-sk-portfolio/, even if a URL sneaks in.
  const marker = `/upload/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  let path = url.slice(idx + marker.length); // e.g. v170.../abbas-sk-portfolio/projects/abc.webp

  // Strip a leading version segment (v1234567890/) if present.
  path = path.replace(/^v\d+\//, '');

  // Strip any query string / transformation suffix.
  path = path.split('?')[0];

  // Drop the file extension.
  const lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) path = path.slice(0, lastDot);

  if (!path.startsWith(`${CLOUDINARY_ROOT}/`)) return null;
  return path;
};

/**
 * Destroy a single Cloudinary asset by URL. Never throws — resolves to a small
 * result object so a failed cleanup degrades gracefully instead of taking down
 * the surrounding delete/update request.
 *
 * @param {string} url  the stored secure_url
 * @returns {Promise<{ ok: boolean, skipped?: boolean, publicId?: string, error?: string }>}
 */
export const destroyAsset = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return { ok: true, skipped: true };

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
    // Cloudinary returns { result: 'ok' } or { result: 'not found' }.
    const ok = res?.result === 'ok' || res?.result === 'not found';
    return ok
      ? { ok: true, publicId }
      : { ok: false, publicId, error: res?.result || 'unknown' };
  } catch (error) {
    // Log for observability but swallow — orphaned assets are recoverable,
    // a 500 on an otherwise-successful DB delete is not worth it.
    console.error(`[cloudinary] Failed to destroy ${publicId}:`, error.message);
    return { ok: false, publicId, error: error.message };
  }
};

/**
 * Destroy many assets concurrently. Accepts a list of URLs (e.g. a Project's
 * images[] array), skips non-Cloudinary entries, and returns a per-URL summary.
 *
 * @param {string[]} urls
 * @returns {Promise<Array>}
 */
export const destroyAssets = async (urls = []) => {
  if (!Array.isArray(urls) || urls.length === 0) return [];
  return Promise.all(urls.map((u) => destroyAsset(u)));
};

export default { isCloudinaryImage, extractPublicId, destroyAsset, destroyAssets };
