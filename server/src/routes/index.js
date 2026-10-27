import express from 'express';
import authRoutes from './authRoutes.js';
import inquiryRoutes from './inquiryRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import jobRoutes from './jobRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import staffingRequestRoutes from './staffingRequestRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/proposals', proposalRoutes);
router.use('/settings', settingsRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/staffing-requests', staffingRequestRoutes);

export default router;
