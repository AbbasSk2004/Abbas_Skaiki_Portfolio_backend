import express from 'express';
import {
  listBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} from '../../controllers/admin/callBookingController.js';

// -----------------------------------------------------------------------------
// ADMIN CallBooking routes — mounted at /api/admin/bookings, behind the
// `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// READ-ONLY INBOX: no create route — bookings are submitted by the public
// (POST /api/bookings). Admin lists, reads, updates status, and deletes.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listBookings);
router.get('/:id', getBooking);
router.put('/:id', updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
