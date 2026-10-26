import express from 'express';
import {
  getPublicJobs,
  getJobBySlugOrId,
  getAdminJobs,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPublicJobs);
router.get('/admin/all', protect, authorize('admin', 'editor'), getAdminJobs);
router.get('/:idOrSlug', getJobBySlugOrId);

// Recruiter / Admin routes
router.post('/', protect, authorize('admin', 'editor'), createJob);
router.put('/:id', protect, authorize('admin', 'editor'), updateJob);
router.delete('/:id', protect, authorize('admin', 'editor'), deleteJob);

export default router;
