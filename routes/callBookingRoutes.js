import express from 'express';
import {
  createCallBooking,
  getAllCallBookings,
  getCallBooking,
  updateCallBooking,
  deleteCallBooking,
} from '../controllers/callBookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: visitors book a call
router.post('/', createCallBooking);

// Private: admin reads and manages bookings
router.get('/', protect, getAllCallBookings);
router.get('/:id', protect, getCallBooking);
router.put('/:id', protect, updateCallBooking);
router.delete('/:id', protect, deleteCallBooking);

export default router;
