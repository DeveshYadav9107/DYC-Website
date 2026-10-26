import express from 'express';
import {
  createSupportTicket,
  getMySupportTickets,
  getAdminSupportTickets,
  getSupportTicketStats,
  getSupportTicketByIdOrNumber,
  postTicketMessage,
  updateTicketStatus,
  assignTicket,
  rateTicketCSAT,
  uploadTicketFile,
} from '../controllers/supportTicketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadTicketAttachment } from '../middleware/upload.js';

const router = express.Router();

// Attachment upload
router.post('/upload-attachment', protect, uploadTicketAttachment.single('file'), uploadTicketFile);

// Stats & metrics
router.get('/stats', protect, getSupportTicketStats);

// Client-specific tickets
router.get('/my', protect, getMySupportTickets);

// Base ticket creation (client / authorized users) & admin list
router
  .route('/')
  .post(protect, createSupportTicket)
  .get(protect, authorize('admin', 'editor'), getAdminSupportTickets);

// Single ticket view & thread
router.get('/:idOrNumber', protect, getSupportTicketByIdOrNumber);

// Post messages / consultant updates / attachments
router.post('/:id/messages', protect, postTicketMessage);

// Admin status change & assignment
router.patch('/:id/status', protect, authorize('admin', 'editor'), updateTicketStatus);
router.post('/:id/assign', protect, authorize('admin', 'editor'), assignTicket);

// Client CSAT rating
router.post('/:id/rating', protect, rateTicketCSAT);

export default router;
