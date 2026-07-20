import CallBooking from '../../models/CallBooking.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

// -----------------------------------------------------------------------------
// ADMIN CallBooking controller (private). Mounted under /api/admin/bookings,
// behind the `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// READ-ONLY INBOX: bookings are CREATED by the public (POST /api/bookings in the
// public controller). Admin lists, reads, moves status through its lifecycle
// ('pending' | 'confirmed' | 'completed'), and deletes. Same shape as Inquiry.
// -----------------------------------------------------------------------------

const ALLOWED_STATUS = ['pending', 'confirmed', 'completed'];

// GET /api/admin/bookings — list all by date, optional ?status= filter.
export const listBookings = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const bookings = await CallBooking.find(filter).sort({ date: 1 });
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// GET /api/admin/bookings/:id — single booking.
export const getBooking = catchAsync(async (req, res) => {
  const booking = await CallBooking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Call booking not found' });
  }
  res.status(200).json({ success: true, data: booking });
});

// PUT /api/admin/bookings/:id — update status only.
export const updateBookingStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${ALLOWED_STATUS.join(', ')}`,
    });
  }
  const booking = await CallBooking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Call booking not found' });
  }
  res.status(200).json({ success: true, data: booking });
});

// DELETE /api/admin/bookings/:id — remove a booking.
export const deleteBooking = catchAsync(async (req, res) => {
  const booking = await CallBooking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Call booking not found' });
  }
  res.status(200).json({ success: true, message: 'Call booking deleted successfully' });
});
