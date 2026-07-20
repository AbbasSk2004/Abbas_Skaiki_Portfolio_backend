import express from 'express';
import { createInquiry } from '../controllers/inquiryController.js';

const router = express.Router();

// PUBLIC: visitors submit inquiries. All admin read/manage routes now live under
// /api/admin/inquiries (routes/admin/inquiryRoutes.js), gated by protect + requireAdmin.
router.post('/', createInquiry);

export default router;
