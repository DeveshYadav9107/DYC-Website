import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  addInquiryNote,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createInquiry);

// Customer enquiries route (protected for any authenticated user)
router.get('/my', protect, getMyInquiries);

// Protect all admin routes
router.use(protect);
router.use(authorize('admin', 'editor'));


router.get('/', getInquiries);
router.get('/:id', getInquiry);
router.route('/:id/status')
  .put(updateInquiryStatus)
  .patch(updateInquiryStatus);
router.post('/:id/notes', addInquiryNote);
router.delete('/:id', deleteInquiry);

export default router;
