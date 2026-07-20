import Inquiry from '../../models/Inquiry.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

// -----------------------------------------------------------------------------
// ADMIN Inquiry controller (private). Mounted under /api/admin/inquiries, behind
// the `protect` + `requireAdmin` gate in routes/admin/index.js.
//
// READ-ONLY INBOX: inquiries are CREATED by the public (POST /api/inquiries in
// the public controller). Admin never creates one — it only lists, reads, moves
// the status through its lifecycle ('new' | 'read' | 'replied'), and deletes.
// This is the reference pattern for public-submission models (Inquiry, Booking).
// -----------------------------------------------------------------------------

const ALLOWED_STATUS = ['new', 'read', 'replied'];

// GET /api/admin/inquiries — list all, newest first, optional ?status= filter.
export const listInquiries = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
});

// GET /api/admin/inquiries/:id — single inquiry.
export const getInquiry = catchAsync(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }
  res.status(200).json({ success: true, data: inquiry });
});

// PATCH/PUT /api/admin/inquiries/:id — update status only (the sole mutable field).
export const updateInquiryStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${ALLOWED_STATUS.join(', ')}`,
    });
  }
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }
  res.status(200).json({ success: true, data: inquiry });
});

// DELETE /api/admin/inquiries/:id — remove an inquiry (no assets to clean up).
export const deleteInquiry = catchAsync(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }
  res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
});
