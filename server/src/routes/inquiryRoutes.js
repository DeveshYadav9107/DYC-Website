import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  getMyInquiryDetails,
  uploadInquiryAttachment,
  addInquiryMessage,
  closeInquiry,
  reopenInquiry,
  getInquiryStats,
  getAssignableTeam,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  assignInquiry,
  manageFollowUp,
  addInquiryNote,
  deleteInquiry,
  exportInquiries,
} from '../controllers/inquiryController.js';
import { getProposals } from '../controllers/proposalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadTicketAttachment } from '../middleware/upload.js';

const router = express.Router();

// 1. Enterprise enquiry submission (Requires authenticated client)
router.post('/', protect, createInquiry);

// 2. Attachment upload for enquiries / tickets
router.post('/upload-attachment', protect, uploadTicketAttachment.single('file'), uploadInquiryAttachment);

// 3. Customer enquiries listing & single ticket retrieval (Protected for authenticated client/user - notes excluded)
router.get('/my', protect, getMyInquiries);
router.get('/my/:id', protect, getMyInquiryDetails);

// 4. Two-way message creation for ticket discussion (Client owner or Staff)
router.post('/:id/messages', protect, addInquiryMessage);

// 5. Admin & Editor protected routes
router.use(protect);
router.use(authorize('admin', 'editor'));

// Operational metadata endpoints (registered before /:id parameterized routes)
router.get('/stats', getInquiryStats);
router.get('/team', getAssignableTeam);
router.get('/export', exportInquiries);

// Enquiry listing & single document retrieval
router.get('/', getInquiries);
router.get('/:id', getInquiry);

// Workflow, Stage & Priority updates
router.route('/:id/status')
  .put(updateInquiryStatus)
  .patch(updateInquiryStatus);

// Close and Reopen ticket actions
router.patch('/:id/close', closeInquiry);
router.patch('/:id/reopen', reopenInquiry);

// Lead ownership assignment
router.post('/:id/assign', assignInquiry);

// Follow-up scheduling & lifecycle
router.post('/:id/follow-up', manageFollowUp);

// Private internal notes (staff-only)
router.post('/:id/notes', addInquiryNote);

// Proposals associated with this inquiry
router.get('/:id/proposals', (req, res, next) => {
  req.query.inquiryId = req.params.id;
  return getProposals(req, res, next);
});

// Permanent deletion (available for admins if ever needed via direct admin api, but UI replaces delete with close)
router.delete('/:id', deleteInquiry);

export default router;
