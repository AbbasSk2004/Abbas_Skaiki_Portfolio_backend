import CallBooking from '../models/CallBooking.js';

// PUBLIC only. Admin read/manage (list/get/status/delete) now lives in the admin
// controller (controllers/admin/callBookingController.js), reachable only via
// /api/admin/bookings behind protect + requireAdmin.

// POST /api/bookings  (PUBLIC) — visitor books a call
export const createCallBooking = async (req, res) => {
  try {
    const { name, email, date, time, topic } = req.body;
    // Whitelist public fields; status remains default 'pending'.
    const booking = await CallBooking.create({ name, email, date, time, topic });
    return res.status(201).json({
      success: true,
      message: 'Your call request has been submitted.',
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
