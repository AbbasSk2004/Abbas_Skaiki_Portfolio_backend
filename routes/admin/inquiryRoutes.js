import express from 'express';
import {
  listInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
} from '../../controllers/admin/inquiryController.js';

// -----------------------------------------------------------------------------
// ADMIN Inquiry routes — mounted at /api/admin/inquiries, behind the `protect` +
// `requireAdmin` gate in routes/admin/index.js.
//
// READ-ONLY INBOX: no create route — inquiries are submitted by the public
// (POST /api/inquiries). Admin lists, reads, updates status, and deletes.
// -----------------------------------------------------------------------------
const router = express.Router();

router.get('/', listInquiries);
router.get('/:id', getInquiry);
router.put('/:id', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

export default router;
