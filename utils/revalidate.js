// -----------------------------------------------------------------------------
// Next.js on-demand revalidation ping.
//
// After any successful admin write, the backend calls the frontend's
// /api/revalidate route (see routes/admin/index.js middleware) so the public
// site drops its cached content immediately instead of waiting out the 1-hour
// ISR window. This is the reverse direction of the public site's data fetch: the
// API tells Next "your cache is stale, refetch."
//
// Everything here is best-effort and NON-BLOCKING for correctness: a failed
// revalidation must never fail the admin request that already succeeded in the
// DB. Worst case, the edit is simply visible after the normal ISR window.
// -----------------------------------------------------------------------------

// Where the Next.js app is reachable from the backend. In dev this is the same
// origin as CLIENT_ORIGIN; in prod set FRONTEND_URL explicitly.
//
// IMPORTANT: this is resolved lazily (inside the function below), NOT at module
// load time. This file is imported transitively by server.js's import graph,
// which runs BEFORE server.js calls dotenv.config(). Capturing process.env here
// at the top level would read it before the .env is loaded and freeze the value
// forever — which is exactly the prod bug this fixes.
//
// No localhost fallback on purpose: if neither var is set we SKIP with a clear
// log rather than ping a bogus localhost URL and pollute the error log.
const resolveFrontendUrl = () =>
  process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || null;

/**
 * Fire-and-forget revalidation of the public content cache. Resolves to a small
 * result object; never throws. Skips silently if the shared secret isn't
 * configured, so the app runs fine before revalidation is wired up.
 *
 * @param {string[]} [tags]  optional explicit cache tags; defaults handled by Next.
 * @returns {Promise<{ ok: boolean, skipped?: boolean, status?: number, error?: string }>}
 */
export const revalidatePublicContent = async (tags) => {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    // Not configured yet — no-op rather than error, so nothing breaks. Warn so
    // this (the quietest failure mode) is visible in the logs instead of silent.
    console.warn('[revalidate] REVALIDATE_SECRET not set — skipping revalidation ping.');
    return { ok: true, skipped: true };
  }

  const frontendUrl = resolveFrontendUrl();
  if (!frontendUrl) {
    // No target configured — skip loudly rather than construct a bogus URL.
    console.warn('[revalidate] Skipping: FRONTEND_URL is not set in process.env');
    return { ok: true, skipped: true };
  }

  const url = `${frontendUrl.replace(/\/+$/, '')}/api/revalidate`;

  try {
    // Guard against a hung frontend taking down the admin response path.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify(Array.isArray(tags) && tags.length ? { tags } : {}),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      // Read the body so the logs reveal WHICH failure this is:
      // 401 "Invalid secret" (secret mismatch) vs 500 "Revalidation not
      // configured" (secret unset on the frontend) vs anything else.
      const body = await res.text().catch(() => '');
      const msg = `revalidate returned ${res.status}`;
      console.error(`[revalidate] ${msg} for ${url} — ${body}`);
      return { ok: false, status: res.status, error: msg, body };
    }
    
    return { ok: true, status: res.status };
  } catch (error) {
    // Network error, abort/timeout — log and move on. The DB write already
    // succeeded; stale cache self-heals at the next ISR interval.
    console.error(`[revalidate] Failed to ping ${url}:`, error.message);
    return { ok: false, error: error.message };
  }
};

export default { revalidatePublicContent };
