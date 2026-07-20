import express from 'express';
import { getAllApproaches } from '../controllers/approachController.js';

// PUBLIC, read-only. Approach is now a SINGLETON section (one image + text
// steps), so there is only a single GET — no by-id lookup. The write (upsert)
// lives under PUT /api/admin/approaches behind protect + requireAdmin.
const router = express.Router();

router.get('/', getAllApproaches);

export default router;
