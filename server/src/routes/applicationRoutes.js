import express from 'express';
import {
  uploadResumeFile,
  submitApplication,
  getMyApplications,
  getAdminApplications,
  getApplicationStats,
  getApplicationById,
  updateApplicationStatus,
  scheduleInterview,
  updateInterviewRound,
  addRecruiterNote,
} from '../controllers/applicationController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

// File upload
router.post('/upload-resume', uploadResume.single('resume'), uploadResumeFile);

// Authenticated Candidate submission
router.post('/', protect, submitApplication);

// Candidate portal
router.get('/my', protect, getMyApplications);

// Admin / Recruiter Dashboard
router.get('/stats', protect, authorize('admin', 'editor'), getApplicationStats);
router.get('/', protect, authorize('admin', 'editor'), getAdminApplications);
router.get('/:id', protect, getApplicationById);

// Admin / Recruiter actions
router.patch('/:id/status', protect, authorize('admin', 'editor'), updateApplicationStatus);
router.post('/:id/interviews', protect, authorize('admin', 'editor'), scheduleInterview);
router.patch('/:id/interviews/:interviewId', protect, authorize('admin', 'editor'), updateInterviewRound);
router.post('/:id/notes', protect, authorize('admin', 'editor'), addRecruiterNote);

export default router;
