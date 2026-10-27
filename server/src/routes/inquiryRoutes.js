import express from 'express';
import {
  createInquiry,
  getMyInquiries,
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

const router = express.Router();

// 1. Enterprise enquiry submission (Requires authenticated client)
router.post('/', protect, createInquiry);

// 2. Customer enquiries route (Protected for authenticated client/user - notes excluded)
router.get('/my', protect, getMyInquiries);

// 3. Admin & Editor protected routes
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

// Permanent deletion
router.delete('/:id', deleteInquiry);

export default router;
