import Proposal from '../models/Proposal.js';
import Inquiry from '../models/Inquiry.js';
import ApiError from '../utils/apiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { generateProposalPdf } from '../services/pdfService.js';

/**
 * Helper: Generates a sequential, professional proposal number
 * Format: DYC-PROP-YYYY-XXXX (e.g. DYC-PROP-2026-0001)
 */
const generateProposalNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `DYC-PROP-${year}-`;
  
  // Find highest current sequence for this year
  const latest = await Proposal.findOne({ proposalNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select('proposalNumber');

  let seq = 1;
  if (latest && latest.proposalNumber) {
    const parts = latest.proposalNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      seq = lastNum + 1;
    }
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
};

/**
 * 1. Create a New Proposal for an Enquiry
 * @route POST /api/v1/proposals
 * @access Private (Admin / Editor)
 */
export const createProposal = async (req, res, next) => {
  try {
    const {
      inquiryId,
      title,
      serviceCategory,
      client,
      clientRequirementSummary,
      solutionSummary,
      scopeOfWork,
      deliverables,
      resourceRequirements,
      timeline,
      currency,
      currencySymbol,
      lineItems,
      discountType,
      discountValue,
      taxLabel,
      taxRate,
      paymentTerms,
      assumptions,
      exclusions,
      clientResponsibilities,
      validUntil,
      closingNotes,
      internalNotes,
    } = req.body;

    if (!inquiryId) {
      return next(new ApiError(400, 'Source enquiry ID (inquiryId) is required'));
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return next(new ApiError(404, 'Referenced source enquiry not found'));
    }

    if (!title || !title.trim()) {
      return next(new ApiError(400, 'Proposal title is required'));
    }

    if (!validUntil) {
      return next(new ApiError(400, 'Proposal validity date is required'));
    }

    const proposalNumber = await generateProposalNumber();
    const actorName = req.user?.name || 'DYC Admin';
    const actorId = req.user?._id;

    // Snapshot recipient information from request or enquiry
    const clientSnapshot = {
      name: client?.name || inquiry.name,
      company: client?.company || inquiry.company || 'Private Client',
      email: client?.email || inquiry.email,
      phone: client?.phone || inquiry.phone || '',
      designation: client?.designation || inquiry.designation || '',
      address: client?.address || '',
    };

    const newProposal = new Proposal({
      proposalNumber,
      version: 1,
      inquiry: inquiry._id,
      client: clientSnapshot,
      title: title.trim(),
      serviceCategory: serviceCategory || inquiry.type || 'general',
      clientRequirementSummary: clientRequirementSummary || inquiry.message || inquiry.requirement || '',
      solutionSummary: solutionSummary || '',
      scopeOfWork: Array.isArray(scopeOfWork) ? scopeOfWork.filter(Boolean) : [],
      deliverables: Array.isArray(deliverables) ? deliverables.filter(Boolean) : [],
      resourceRequirements: resourceRequirements || '',
      timeline: timeline || '',
      currency: currency || 'INR',
      currencySymbol: currencySymbol || '₹',
      lineItems: Array.isArray(lineItems) ? lineItems : [],
      discountType: discountType || 'flat',
      discountValue: Number(discountValue) || 0,
      taxLabel: taxLabel || 'GST',
      taxRate: Number(taxRate) || 0,
      paymentTerms: paymentTerms || '50% advance upon contract signing, 50% upon milestone deliverables completion.',
      assumptions: Array.isArray(assumptions) ? assumptions.filter(Boolean) : [],
      exclusions: Array.isArray(exclusions) ? exclusions.filter(Boolean) : [],
      clientResponsibilities: Array.isArray(clientResponsibilities) ? clientResponsibilities.filter(Boolean) : [],
      validUntil: new Date(validUntil),
      closingNotes: closingNotes || 'Thank you for considering Dinesh Yadav & Company for your enterprise solutions.',
      internalNotes: internalNotes || '',
      status: 'draft',
      statusHistory: [{
        status: 'draft',
        changedAt: new Date(),
        changedBy: actorId,
        changedByName: actorName,
        note: 'Proposal draft initialized',
      }],
      createdBy: actorId,
      createdByName: actorName,
      updatedBy: actorId,
      updatedByName: actorName,
    });

    await newProposal.save();

    // Log activity in the source enquiry's audit timeline
    inquiry.timeline.push({
      type: 'proposal_created',
      description: `Commercial proposal ${proposalNumber} (Draft - ${newProposal.currencySymbol}${newProposal.grandTotal}) created by ${actorName}`,
      performedBy: actorId,
      performedByName: actorName,
      metadata: { proposalId: newProposal._id, proposalNumber, grandTotal: newProposal.grandTotal },
    });

    // Advance inquiry stage to 'qualified' if currently 'new'
    if (inquiry.leadStage === 'new') {
      inquiry.leadStage = 'qualified';
      inquiry.status = 'qualified';
    }

    await inquiry.save();

    return successResponse(res, 201, 'Proposal created successfully', newProposal);
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get All Proposals (with filters & pagination)
 * @route GET /api/v1/proposals
 * @access Private (Admin / Editor)
 */
export const getProposals = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.inquiryId) {
      filter.inquiry = req.query.inquiryId;
    }

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.serviceCategory && req.query.serviceCategory !== 'all') {
      filter.serviceCategory = req.query.serviceCategory;
    }

    if (req.query.search && req.query.search.trim()) {
      const regex = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { proposalNumber: regex },
        { title: regex },
        { 'client.name': regex },
        { 'client.company': regex },
        { 'client.email': regex },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate('inquiry', 'name company email type status leadStage priority enquiryNumber')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Proposal.countDocuments(filter),
    ]);

    return successResponse(res, 200, 'Proposals retrieved successfully', {
      proposals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Get Single Proposal by ID
 * @route GET /api/v1/proposals/:id
 * @access Private (Admin / Editor)
 */
export const getProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('inquiry', 'name company email phone type status leadStage priority enquiryNumber createdAt')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('parentProposal', 'proposalNumber version grandTotal status');

    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    return successResponse(res, 200, 'Proposal details retrieved', proposal);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Update Proposal Draft
 * @route PUT /api/v1/proposals/:id
 * @access Private (Admin / Editor)
 */
export const updateProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    // Do not allow direct edits to proposals that have already been sent or decided
    if (['sent', 'accepted', 'declined'].includes(proposal.status)) {
      return next(
        new ApiError(
          400,
          `Proposal ${proposal.proposalNumber} is in "${proposal.status}" status and cannot be edited directly. Please create a revised version instead.`
        )
      );
    }

    const actorName = req.user?.name || 'DYC Admin';
    const actorId = req.user?._id;

    const allowedFields = [
      'title',
      'serviceCategory',
      'client',
      'clientRequirementSummary',
      'solutionSummary',
      'scopeOfWork',
      'deliverables',
      'resourceRequirements',
      'timeline',
      'currency',
      'currencySymbol',
      'lineItems',
      'discountType',
      'discountValue',
      'taxLabel',
      'taxRate',
      'paymentTerms',
      'assumptions',
      'exclusions',
      'clientResponsibilities',
      'validUntil',
      'closingNotes',
      'internalNotes',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        proposal[field] = req.body[field];
      }
    });

    proposal.updatedBy = actorId;
    proposal.updatedByName = actorName;

    await proposal.save();

    // Log activity in enquiry timeline
    await Inquiry.findByIdAndUpdate(proposal.inquiry, {
      $push: {
        timeline: {
          type: 'proposal_updated',
          description: `Proposal ${proposal.proposalNumber} updated by ${actorName}`,
          performedBy: actorId,
          performedByName: actorName,
          metadata: { proposalId: proposal._id, grandTotal: proposal.grandTotal },
        },
      },
    });

    return successResponse(res, 200, 'Proposal updated successfully', proposal);
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Create a Revised Version of an Existing Proposal
 * @route POST /api/v1/proposals/:id/revise
 * @access Private (Admin / Editor)
 */
export const reviseProposal = async (req, res, next) => {
  try {
    const existing = await Proposal.findById(req.params.id);
    if (!existing) {
      return next(new ApiError(404, 'Proposal to revise not found'));
    }

    const actorName = req.user?.name || 'DYC Admin';
    const actorId = req.user?._id;

    // Increment version
    const newVersion = (existing.version || 1) + 1;
    const baseNumber = existing.proposalNumber.split('-v')[0];
    const newProposalNumber = `${baseNumber}-v${newVersion}`;

    const revisedProposal = new Proposal({
      proposalNumber: newProposalNumber,
      version: newVersion,
      parentProposal: existing._id,
      inquiry: existing.inquiry,
      client: req.body.client || existing.client,
      title: req.body.title || `${existing.title} (Rev ${newVersion})`,
      serviceCategory: req.body.serviceCategory || existing.serviceCategory,
      clientRequirementSummary: req.body.clientRequirementSummary || existing.clientRequirementSummary,
      solutionSummary: req.body.solutionSummary || existing.solutionSummary,
      scopeOfWork: req.body.scopeOfWork || existing.scopeOfWork,
      deliverables: req.body.deliverables || existing.deliverables,
      resourceRequirements: req.body.resourceRequirements || existing.resourceRequirements,
      timeline: req.body.timeline || existing.timeline,
      currency: req.body.currency || existing.currency,
      currencySymbol: req.body.currencySymbol || existing.currencySymbol,
      lineItems: req.body.lineItems || existing.lineItems,
      discountType: req.body.discountType || existing.discountType,
      discountValue: req.body.discountValue !== undefined ? req.body.discountValue : existing.discountValue,
      taxLabel: req.body.taxLabel || existing.taxLabel,
      taxRate: req.body.taxRate !== undefined ? req.body.taxRate : existing.taxRate,
      paymentTerms: req.body.paymentTerms || existing.paymentTerms,
      assumptions: req.body.assumptions || existing.assumptions,
      exclusions: req.body.exclusions || existing.exclusions,
      clientResponsibilities: req.body.clientResponsibilities || existing.clientResponsibilities,
      validUntil: req.body.validUntil ? new Date(req.body.validUntil) : existing.validUntil,
      closingNotes: req.body.closingNotes || existing.closingNotes,
      internalNotes: req.body.internalNotes || existing.internalNotes,
      status: 'draft',
      statusHistory: [{
        status: 'draft',
        changedAt: new Date(),
        changedBy: actorId,
        changedByName: actorName,
        note: `Revised from version ${existing.version} (${existing.proposalNumber})`,
      }],
      createdBy: actorId,
      createdByName: actorName,
      updatedBy: actorId,
      updatedByName: actorName,
    });

    await revisedProposal.save();

    // Log revision in source enquiry
    await Inquiry.findByIdAndUpdate(existing.inquiry, {
      $push: {
        timeline: {
          type: 'proposal_revised',
          description: `Revised proposal ${newProposalNumber} (v${newVersion}) created by ${actorName}`,
          performedBy: actorId,
          performedByName: actorName,
          metadata: { newProposalId: revisedProposal._id, parentId: existing._id },
        },
      },
    });

    return successResponse(res, 201, `Revised proposal ${newProposalNumber} created successfully`, revisedProposal);
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Update Proposal Lifecycle Status (Draft -> Ready for Review -> Sent -> Accepted / Declined)
 * @route PATCH /api/v1/proposals/:id/status
 * @access Private (Admin / Editor)
 */
export const updateProposalStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['draft', 'ready_for_review', 'sent', 'accepted', 'declined', 'expired'];

    if (!status || !validStatuses.includes(status)) {
      return next(new ApiError(400, `Invalid proposal status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    const actorName = req.user?.name || 'DYC Admin';
    const actorId = req.user?._id;
    const oldStatus = proposal.status;

    if (oldStatus === status) {
      return successResponse(res, 200, 'Proposal status already up to date', proposal);
    }

    proposal.status = status;
    proposal.updatedBy = actorId;
    proposal.updatedByName = actorName;

    // Track status history
    proposal.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: actorId,
      changedByName: actorName,
      note: note || `Status transitioned from "${oldStatus}" to "${status}"`,
    });

    // Handle specific status side-effects
    if (status === 'sent') {
      proposal.sentAt = new Date();
      proposal.sentBy = actorId;
      proposal.sentByName = actorName;

      // Automatically sync inquiry lead stage
      await Inquiry.findByIdAndUpdate(proposal.inquiry, {
        leadStage: 'proposal-sent',
        status: 'proposal',
        $push: {
          timeline: {
            type: 'proposal_sent',
            description: `Proposal ${proposal.proposalNumber} marked as Sent to client by ${actorName}`,
            performedBy: actorId,
            performedByName: actorName,
            metadata: { proposalId: proposal._id, proposalNumber: proposal.proposalNumber },
          },
        },
      });
    } else if (status === 'accepted') {
      // Sync inquiry stage to Won / Converted
      await Inquiry.findByIdAndUpdate(proposal.inquiry, {
        leadStage: 'won',
        status: 'converted',
        $push: {
          timeline: {
            type: 'proposal_accepted',
            description: `Proposal ${proposal.proposalNumber} Accepted by client! Deal Won.`,
            performedBy: actorId,
            performedByName: actorName,
            metadata: { proposalId: proposal._id, grandTotal: proposal.grandTotal },
          },
        },
      });
    } else if (status === 'declined') {
      // Sync inquiry stage to Lost / Closed
      await Inquiry.findByIdAndUpdate(proposal.inquiry, {
        leadStage: 'lost',
        status: 'closed',
        $push: {
          timeline: {
            type: 'proposal_declined',
            description: `Proposal ${proposal.proposalNumber} Declined by client.${note ? ` Reason: ${note}` : ''}`,
            performedBy: actorId,
            performedByName: actorName,
            metadata: { proposalId: proposal._id },
          },
        },
      });
    } else {
      // Generic timeline update on inquiry
      await Inquiry.findByIdAndUpdate(proposal.inquiry, {
        $push: {
          timeline: {
            type: 'proposal_updated',
            description: `Proposal ${proposal.proposalNumber} status updated to "${status}" by ${actorName}`,
            performedBy: actorId,
            performedByName: actorName,
            metadata: { oldStatus, newStatus: status },
          },
        },
      });
    }

    await proposal.save();

    return successResponse(res, 200, `Proposal status updated to "${status}"`, proposal);
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Download Proposal as Professional Client-Facing PDF
 * @route GET /api/v1/proposals/:id/pdf
 * @access Private (Admin / Editor)
 */
export const downloadProposalPdf = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    const pdfBuffer = await generateProposalPdf(proposal);

    const safeFilename = `${proposal.proposalNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    next(new ApiError(500, `Failed to generate proposal PDF: ${error.message}`));
  }
};

/**
 * 8. Delete Proposal (Drafts only)
 * @route DELETE /api/v1/proposals/:id
 * @access Private (Admin only)
 */
export const deleteProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return next(new ApiError(404, 'Proposal not found'));
    }

    if (proposal.status !== 'draft') {
      return next(new ApiError(400, 'Only draft proposals can be permanently deleted.'));
    }

    await Proposal.deleteOne({ _id: proposal._id });

    return successResponse(res, 200, 'Draft proposal deleted successfully');
  } catch (error) {
    next(error);
  }
};
