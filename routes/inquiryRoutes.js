import express from 'express';
import {
  createInquiry,
  getAllInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: visitors submit inquiries
router.post('/', createInquiry);

// Private: admin reads and manages inquiries
router.get('/', protect, getAllInquiries);
router.get('/:id', protect, getInquiry);
router.put('/:id', protect, updateInquiry);
router.delete('/:id', protect, deleteInquiry);

export default router;
