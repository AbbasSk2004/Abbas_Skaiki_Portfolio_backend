import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load .env.local if present, otherwise fall back to .env (same order as the
// rest of the backend — see server.js / config/seedAdmin.js).
dotenv.config({ path: '.env.local' });
dotenv.config();

// Initialize the Cloudinary v2 API from environment variables only.
// NEVER hardcode credentials here — CLOUD_NAME / API_KEY / API_SECRET all live
// in .env.local (which is gitignored). A single key on its own is not enough:
// the SDK needs all three to sign upload requests.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Root namespace for every asset this project uploads. Section subfolders
// (hero/, about/, projects/, services/, approach/) are appended per-route by
// the upload middleware, so all media lands under a single tidy tree.
export const CLOUDINARY_ROOT = 'abbas-sk-portfolio';

export default cloudinary;
