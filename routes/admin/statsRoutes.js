import express from 'express';
import { getDashboardStats } from '../../controllers/admin/statsController.js';

// Mounted under /api/admin (see routes/admin/index.js), which already applies
// `protect` to the whole subtree — so this is admin-only without repeating the
// guard here. Read-only: the dashboard never writes through this endpoint.
const router = express.Router();

router.get('/', getDashboardStats);

export default router;
