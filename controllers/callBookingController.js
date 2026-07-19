import CallBooking from '../models/CallBooking.js';

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

// GET /api/bookings  (PRIVATE) — admin lists bookings, optional ?status= filter
export const getAllCallBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const bookings = await CallBooking.find(filter).sort({ date: 1 });
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings/:id  (PRIVATE)
export const getCallBooking = async (req, res) => {
  try {
    const booking = await CallBooking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Call booking not found' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/bookings/:id  (PRIVATE) — admin updates status ('pending'|'confirmed'|'completed')
export const updateCallBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await CallBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Call booking not found' });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/bookings/:id  (PRIVATE)
export const deleteCallBooking = async (req, res) => {
  try {
    const booking = await CallBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: 'Call booking not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Call booking deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
