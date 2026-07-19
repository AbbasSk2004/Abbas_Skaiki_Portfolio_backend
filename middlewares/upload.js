import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { CLOUDINARY_ROOT } from '../config/cloudinary.js';

// Reusable Cloudinary-backed multer storage factory.
//
// Each route decides which section subfolder its uploads belong to, e.g.
//   router.post('/', uploadImage('hero').single('image'), controller)
// puts the file under `abbas-sk-portfolio/hero/`. Attach `.single('image')`,
// `.array('images', n)`, or `.fields([...])` at the route as needed.
//
// `folder` should be one of the section names you set up in Cloudinary:
//   hero | about | projects | services | approach
const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `${CLOUDINARY_ROOT}/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      // Sane cap so a hero portrait doesn't get stored at absurd resolution.
      transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
    },
  });

/**
 * Build an upload middleware scoped to a Cloudinary section subfolder.
 * @param {string} folder - section subfolder under abbas-sk-portfolio/
 * @returns {import('multer').Multer}
 */
export const uploadImage = (folder = 'misc') =>
  multer({
    storage: makeStorage(folder),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) return cb(null, true);
      cb(new Error('Only image files are allowed'));
    },
  });

export default uploadImage;
