import express from 'express';
import authRoutes from './authRoutes.js';
import inquiryRoutes from './inquiryRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/settings', settingsRoutes);

export default router;
