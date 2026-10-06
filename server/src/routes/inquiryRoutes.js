import express from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  addInquiryNote,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createInquiry);

// Protect all admin routes
router.use(protect);
router.use(authorize('admin', 'editor'));

router.get('/', getInquiries);
router.get('/:id', getInquiry);
router.put('/:id/status', updateInquiryStatus);
router.post('/:id/notes', addInquiryNote);
router.delete('/:id', deleteInquiry);

export default router;
