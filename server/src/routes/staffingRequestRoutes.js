import express from 'express';
import {
  submitStaffingRequest,
  getMyStaffingRequests,
  getAdminStaffingRequests,
  getStaffingRequestById,
  updateStaffingRequestStatus,
  updateStaffingProgress,
  addStaffingNote,
} from '../controllers/staffingRequestController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Submission (Guest company or logged-in client)
router.post('/', optionalAuth, submitStaffingRequest);

// Client portal - track own requests
router.get('/my', protect, getMyStaffingRequests);

// Admin / Recruiter
router.get('/', protect, authorize('admin', 'editor'), getAdminStaffingRequests);
router.get('/:id', protect, getStaffingRequestById);

// Admin actions
router.patch('/:id/status', protect, authorize('admin', 'editor'), updateStaffingRequestStatus);
router.patch('/:id/progress', protect, authorize('admin', 'editor'), updateStaffingProgress);
router.post('/:id/notes', protect, authorize('admin', 'editor'), addStaffingNote);

export default router;
