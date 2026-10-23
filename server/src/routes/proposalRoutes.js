import express from 'express';
import {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  reviseProposal,
  updateProposalStatus,
  downloadProposalPdf,
  deleteProposal,
} from '../controllers/proposalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All proposal routes require authentication
router.use(protect);
router.use(authorize('admin', 'editor'));

// List proposals & create a new proposal
router.route('/')
  .get(getProposals)
  .post(createProposal);

// Proposal retrieval & draft updates
router.route('/:id')
  .get(getProposal)
  .put(updateProposal)
  .delete(authorize('admin'), deleteProposal);

// Proposal revision (v2, v3, etc.)
router.post('/:id/revise', reviseProposal);

// Proposal lifecycle status management (draft -> ready_for_review -> sent -> accepted/declined)
router.patch('/:id/status', updateProposalStatus);

// Generate & stream branded client-facing PDF
router.get('/:id/pdf', downloadProposalPdf);

export default router;
