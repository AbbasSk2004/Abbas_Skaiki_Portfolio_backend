import express from 'express';
import { createCallBooking } from '../controllers/callBookingController.js';

const router = express.Router();

// PUBLIC: visitors book a call. All admin read/manage routes now live under
// /api/admin/bookings (routes/admin/callBookingRoutes.js), gated by protect + requireAdmin.
router.post('/', createCallBooking);

export default router;
