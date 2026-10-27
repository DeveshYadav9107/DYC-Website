import Inquiry from '../models/Inquiry.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Helper: Sanitizes a string for CSV cell export
 * Protects against CSV Formula Injection (CWE-1236)
 */
const sanitizeCsvCell = (val) => {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // If the cell begins with formula characters, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape inner quotes
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * 1. Public Enquiry Submission
 */
export const createInquiry = async (req, res, next) => {
  try {
    const inquiryData = { ...req.body };

    // Prevent mass-assignment of privileged/internal fields
    delete inquiryData.assignedTo;
    delete inquiryData.assignedAt;
    delete inquiryData.assignedBy;
    delete inquiryData.notes;
    delete inquiryData.approvedBy;
    delete inquiryData.approvedAt;
    delete inquiryData.rejectedBy;
    delete inquiryData.rejectedAt;
    delete inquiryData.followUpStatus;
    delete inquiryData.nextFollowUpAt;
    delete inquiryData.followUpNotes;
    delete inquiryData.followUpCompletedAt;
    delete inquiryData.followUpCompletedBy;
    delete inquiryData.closedAt;
    delete inquiryData.closedBy;
    delete inquiryData.closedByName;
    delete inquiryData.closureReason;

    // Public enquiries always start at initial stage
    inquiryData.leadStage = 'new';
    inquiryData.status = 'new';
    
    // Priority validation
    if (inquiryData.priority && !['low', 'normal', 'high', 'urgent'].includes(inquiryData.priority)) {
      inquiryData.priority = 'normal';
    } else {
      inquiryData.priority = inquiryData.priority || 'normal';
    }

    if (!req.user || !req.user._id) {
      return next(
        new ApiError(401, 'Please log in or create an account to submit your enquiry.')
      );
    }
    inquiryData.user = req.user._id;

    // Seed initial message if text was supplied
    if (inquiryData.message && (!inquiryData.messages || inquiryData.messages.length === 0)) {
      inquiryData.messages = [{
        sender: req.user._id,
        senderName: inquiryData.name || req.user.name || 'Customer',
        senderRole: 'customer',
        message: inquiryData.message,
        attachments: Array.isArray(inquiryData.attachments) ? inquiryData.attachments : [],
        createdAt: new Date(),
      }];
    }

    const initialTimeline = [{
      type: 'created',
      description: `Enquiry submitted via website form (${inquiryData.type || 'general'})`,
      performedByName: inquiryData.name || 'Website Visitor',
      createdAt: new Date(),
    }];
    inquiryData.timeline = initialTimeline;

    const inquiry = await Inquiry.create(inquiryData);
    return successResponse(res, 201, 'Inquiry submitted successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Customer Enquiries (Client Portal)
 * STRICT SECURITY: Never returns internal staff notes or audit timeline
 */
export const getMyInquiries = async (req, res, next) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    const userId = req.user._id;

    const queryConditions = [];
    if (userId) queryConditions.push({ user: userId });
    if (userEmail) queryConditions.push({ email: userEmail });

    const inquiries = await Inquiry.find({
      $or: queryConditions,
    })
      .select('-notes -timeline -followUpCompletedBy')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Your enquiries retrieved successfully', inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Dashboard KPI Metrics (Real database aggregation)
 */
export const getInquiryStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalEnquiries,
      newEnquiries,
      followUpsDue,
      qualifiedLeads,
      proposalsSent,
      wonLeads,
      overdueFollowUps,
      todayFollowUps,
      upcomingFollowUps,
      urgentPriority,
      highPriority,
      normalPriority,
      lowPriority,
      typeAgg,
      recentInquiries,
    ] = await Promise.all([
      // 1. Total Enquiries
      Inquiry.countDocuments(),
      // 2. New Enquiries
      Inquiry.countDocuments({
        $or: [{ status: 'new' }, { leadStage: 'new' }],
      }),
      // 3. Follow-ups Due (Scheduled and due on or before today)
      Inquiry.countDocuments({
        followUpStatus: 'scheduled',
        nextFollowUpAt: { $lte: endOfToday },
      }),
      // 4. Qualified Leads
      Inquiry.countDocuments({
        leadStage: 'qualified',
      }),
      // 5. Proposals Sent
      Inquiry.countDocuments({
        $or: [{ leadStage: 'proposal-sent' }, { status: 'proposal' }],
      }),
      // 6. Won Leads
      Inquiry.countDocuments({
        $or: [{ leadStage: 'won' }, { status: 'converted' }],
      }),
      // Follow-up sub-metrics
      Inquiry.countDocuments({
        followUpStatus: 'scheduled',
        nextFollowUpAt: { $lt: startOfToday },
      }),
      Inquiry.countDocuments({
        followUpStatus: 'scheduled',
        nextFollowUpAt: { $gte: startOfToday, $lte: endOfToday },
      }),
      Inquiry.countDocuments({
        followUpStatus: 'scheduled',
        nextFollowUpAt: { $gt: endOfToday },
      }),
      // Priority counts
      Inquiry.countDocuments({ priority: 'urgent' }),
      Inquiry.countDocuments({ priority: 'high' }),
      Inquiry.countDocuments({ priority: 'normal' }),
      Inquiry.countDocuments({ priority: 'low' }),
      // Breakdown by service classification
      Inquiry.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      // Recent enquiries for quick preview
      Inquiry.find()
        .select('name company email type status leadStage priority createdAt nextFollowUpAt followUpStatus')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const serviceBreakdown = typeAgg.reduce((acc, curr) => {
      acc[curr._id || 'general'] = curr.count;
      return acc;
    }, {});

    const stats = {
      totalEnquiries,
      newEnquiries,
      followUpsDue,
      qualifiedLeads,
      proposalsSent,
      wonLeads,
      followUps: {
        due: followUpsDue,
        overdue: overdueFollowUps,
        today: todayFollowUps,
        upcoming: upcomingFollowUps,
      },
      priorities: {
        urgent: urgentPriority,
        high: highPriority,
        normal: normalPriority,
        low: lowPriority,
      },
      serviceBreakdown,
      recentInquiries,
    };

    return successResponse(res, 200, 'Dashboard metrics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Assignable Staff Team List
 */
export const getAssignableTeam = async (req, res, next) => {
  try {
    const teamMembers = await User.find({
      role: { $in: ['admin', 'editor'] },
      isActive: { $ne: false },
    })
      .select('_id name email role')
      .sort({ name: 1 });

    return successResponse(res, 200, 'Team members retrieved', teamMembers);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Builds MongoDB query filter from request parameters
 */
const buildInquiryFilter = (query) => {
  const filter = {};

  // Status Filter
  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  // Lead Stage Filter
  if (query.leadStage && query.leadStage !== 'all') {
    filter.leadStage = query.leadStage;
  }

  // Priority Filter
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority;
  }

  // Classification Type Filter
  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  // Assigned Owner Filter
  if (query.assignedTo) {
    if (query.assignedTo === 'unassigned') {
      filter.assignedTo = { $exists: false };
    } else if (query.assignedTo !== 'all') {
      filter.assignedTo = query.assignedTo;
    }
  }

  // Follow-up Filters
  if (query.followUpFilter && query.followUpFilter !== 'all') {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (query.followUpFilter === 'overdue') {
      filter.followUpStatus = 'scheduled';
      filter.nextFollowUpAt = { $lt: startOfToday };
    } else if (query.followUpFilter === 'today') {
      filter.followUpStatus = 'scheduled';
      filter.nextFollowUpAt = { $gte: startOfToday, $lte: endOfToday };
    } else if (query.followUpFilter === 'due') {
      filter.followUpStatus = 'scheduled';
      filter.nextFollowUpAt = { $lte: endOfToday };
    } else if (query.followUpFilter === 'upcoming') {
      filter.followUpStatus = 'scheduled';
      filter.nextFollowUpAt = { $gt: endOfToday };
    } else if (query.followUpFilter === 'completed') {
      filter.followUpStatus = 'completed';
    } else if (query.followUpFilter === 'none') {
      filter.followUpStatus = { $in: ['none', null] };
    }
  }

  // Date Range Filter (createdAt)
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) {
      const fromDate = new Date(query.dateFrom);
      if (!isNaN(fromDate.getTime())) {
        filter.createdAt.$gte = fromDate;
      }
    }
    if (query.dateTo) {
      const toDate = new Date(query.dateTo);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }
  }

  // Search Query across multiple fields
  if (query.search && query.search.trim()) {
    const term = query.search.trim();
    // Escape regex special chars
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeTerm, 'i');

    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { company: regex },
      { message: regex },
      { requirement: regex },
      { service: regex },
      { sapModule: regex },
    ];
  }

  return filter;
};

/**
 * 5. Admin Inquiries List with Search, Filter, Sort, Pagination
 */
export const getInquiries = async (req, res, next) => {
  try {
    const filter = buildInquiryFilter(req.query);

    // Sorting
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const allowedSortFields = ['createdAt', 'name', 'priority', 'status', 'leadStage', 'nextFollowUpAt', 'type'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'createdAt';
    const sortOptions = { [safeSortField]: sortOrder };

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [inquiries, total, totalAll] = await Promise.all([
      Inquiry.find(filter)
        .populate('assignedTo', '_id name email role')
        .populate('notes.addedBy', '_id name email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Inquiry.countDocuments(filter),
      Inquiry.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    // Provide rich paginated structure with backward-compatibility for array checks
    const responsePayload = {
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        allTotal: totalAll,
      },
    };

    return successResponse(res, 200, 'Inquiries retrieved successfully', responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Single Enquiry Detail View
 */
export const getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role')
      .populate('followUpCompletedBy', '_id name email role');

    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry not found'));
    }
    return successResponse(res, 200, 'Enquiry retrieved successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Update Status, Lead Stage, Priority, or Approval
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, leadStage, priority, reason } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry not found'));
    }

    const actorName = req.user?.name || 'Administrator';
    const actorId = req.user?._id;

    let changesRecorded = 0;

    // 1. Lead Stage Update
    if (leadStage && inquiry.leadStage !== leadStage) {
      const oldStage = inquiry.leadStage;
      inquiry.leadStage = leadStage;
      inquiry.timeline.push({
        type: 'stage_updated',
        description: `Lead stage changed from "${oldStage}" to "${leadStage}"${reason ? ` (${reason})` : ''}`,
        performedBy: actorId,
        performedByName: actorName,
        metadata: { oldStage, newStage: leadStage },
      });
      changesRecorded++;
    }

    // 2. Status Update
    if (status && inquiry.status !== status) {
      const oldStatus = inquiry.status;
      inquiry.status = status;
      const eventType = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'status_updated';
      inquiry.timeline.push({
        type: eventType,
        description: `Status updated from "${oldStatus}" to "${status}"${reason ? ` (${reason})` : ''}`,
        performedBy: actorId,
        performedByName: actorName,
        metadata: { oldStatus, newStatus: status },
      });
      changesRecorded++;
    }

    // 3. Priority Update
    if (priority && inquiry.priority !== priority) {
      const oldPriority = inquiry.priority;
      inquiry.priority = priority;
      inquiry.timeline.push({
        type: 'priority_updated',
        description: `Priority updated from "${oldPriority}" to "${priority}"`,
        performedBy: actorId,
        performedByName: actorName,
        metadata: { oldPriority, newPriority: priority },
      });
      changesRecorded++;
    }

    await inquiry.save();

    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role');

    return successResponse(res, 200, 'Enquiry updated successfully', populatedInquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Assign or Reassign Lead
 */
export const assignInquiry = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry not found'));
    }

    const actorName = req.user?.name || 'Administrator';
    const actorId = req.user?._id;

    if (!assignedTo || assignedTo === 'unassigned') {
      inquiry.assignedTo = undefined;
      inquiry.timeline.push({
        type: 'unassigned',
        description: 'Lead unassigned from owner',
        performedBy: actorId,
        performedByName: actorName,
      });
    } else {
      const targetUser = await User.findOne({
        _id: assignedTo,
        role: { $in: ['admin', 'editor'] },
        isActive: { $ne: false },
      });

      if (!targetUser) {
        return next(new ApiError(400, 'Assigned user must be an active administrator or editor'));
      }

      inquiry.assignedTo = targetUser._id;
      inquiry.timeline.push({
        type: 'assigned',
        description: `Lead assigned to ${targetUser.name} (${targetUser.email})`,
        performedBy: actorId,
        performedByName: actorName,
        metadata: { assignedUserId: targetUser._id, assignedUserName: targetUser.name },
      });
    }

    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role');

    return successResponse(res, 200, 'Lead assignment updated', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Schedule, Reschedule, or Complete Follow-up
 */
export const manageFollowUp = async (req, res, next) => {
  try {
    const { action, nextFollowUpAt, followUpNote } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry not found'));
    }

    const actorName = req.user?.name || 'Administrator';
    const actorId = req.user?._id;

    if (action === 'schedule' || action === 'reschedule') {
      if (!nextFollowUpAt) {
        return next(new ApiError(400, 'A valid follow-up date and time is required'));
      }
      const followUpDate = new Date(nextFollowUpAt);
      if (isNaN(followUpDate.getTime())) {
        return next(new ApiError(400, 'Invalid follow-up date format'));
      }

      const isReschedule = inquiry.followUpStatus === 'scheduled' && inquiry.nextFollowUpAt;
      inquiry.nextFollowUpAt = followUpDate;
      inquiry.followUpStatus = 'scheduled';
      if (followUpNote !== undefined) {
        inquiry.followUpNote = followUpNote ? String(followUpNote).trim() : '';
      }

      const formattedDate = followUpDate.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      inquiry.timeline.push({
        type: isReschedule ? 'follow_up_rescheduled' : 'follow_up_scheduled',
        description: `Follow-up ${isReschedule ? 'rescheduled' : 'scheduled'} for ${formattedDate}${
          inquiry.followUpNote ? ` • "${inquiry.followUpNote}"` : ''
        }`,
        performedBy: actorId,
        performedByName: actorName,
        metadata: { scheduledDate: followUpDate, note: inquiry.followUpNote },
      });
    } else if (action === 'complete') {
      if (inquiry.followUpStatus !== 'scheduled') {
        return next(new ApiError(400, 'No scheduled follow-up is active for this enquiry'));
      }

      inquiry.followUpStatus = 'completed';
      inquiry.followUpCompletedAt = new Date();
      inquiry.followUpCompletedBy = actorId;

      inquiry.timeline.push({
        type: 'follow_up_completed',
        description: `Follow-up marked as completed${followUpNote ? ` • Outcome: "${followUpNote}"` : ''}`,
        performedBy: actorId,
        performedByName: actorName,
        metadata: { completedAt: inquiry.followUpCompletedAt },
      });
    } else if (action === 'cancel') {
      inquiry.followUpStatus = 'cancelled';
      inquiry.timeline.push({
        type: 'follow_up_cancelled',
        description: 'Follow-up cancelled',
        performedBy: actorId,
        performedByName: actorName,
      });
    } else {
      return next(new ApiError(400, 'Invalid follow-up action. Allowed: schedule, reschedule, complete, cancel'));
    }

    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role');

    return successResponse(res, 200, 'Follow-up updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Add Private Internal Note
 */
export const addInquiryNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return next(new ApiError(400, 'Note text cannot be empty'));
    }
    const cleanText = String(text).trim();
    if (cleanText.length > 2000) {
      return next(new ApiError(400, 'Note text cannot exceed 2000 characters'));
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry not found'));
    }

    const authorName = req.user?.name || 'Administrator';
    const authorId = req.user?._id;

    inquiry.notes.push({
      text: cleanText,
      addedBy: authorId,
      authorName,
      addedAt: new Date(),
    });

    inquiry.timeline.push({
      type: 'note_added',
      description: `Internal note added by ${authorName}`,
      performedBy: authorId,
      performedByName: authorName,
    });

    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role');

    return successResponse(res, 200, 'Internal note added successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Delete Enquiry
 */
export const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry not found'));
    }
    return successResponse(res, 200, 'Enquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * 12. Export Enquiries to CSV
 * Supports active filters and protects against formula injection
 */
export const exportInquiries = async (req, res, next) => {
  try {
    const filter = buildInquiryFilter(req.query);

    // Limit export to safe upper bound
    const inquiries = await Inquiry.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      'Enquiry ID',
      'Date Submitted',
      'Customer Name',
      'Email',
      'Phone',
      'Company',
      'Service Type',
      'Lead Stage',
      'Status',
      'Priority',
      'Assigned Owner',
      'Next Follow-up',
      'Follow-up Status',
      'Requirement or Message',
    ];

    const rows = inquiries.map((inq) => [
      sanitizeCsvCell(inq._id),
      sanitizeCsvCell(inq.createdAt ? inq.createdAt.toISOString() : ''),
      sanitizeCsvCell(inq.name),
      sanitizeCsvCell(inq.email),
      sanitizeCsvCell(inq.phone || ''),
      sanitizeCsvCell(inq.company || ''),
      sanitizeCsvCell(inq.type || 'general'),
      sanitizeCsvCell(inq.leadStage || 'new'),
      sanitizeCsvCell(inq.status || 'new'),
      sanitizeCsvCell(inq.priority || 'normal'),
      sanitizeCsvCell(inq.assignedTo?.name || 'Unassigned'),
      sanitizeCsvCell(inq.nextFollowUpAt ? inq.nextFollowUpAt.toISOString() : ''),
      sanitizeCsvCell(inq.followUpStatus || 'none'),
      sanitizeCsvCell(inq.message || inq.requirement || ''),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const fileName = `DYC_Leads_Export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * 13. Customer: Get Single Enquiry / Ticket Details
 * Strictly verified: customer can only fetch tickets owned by their account or email.
 */
export const getMyInquiryDetails = async (req, res, next) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    const userId = req.user._id;

    const query = {
      _id: req.params.id,
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    };

    const inquiry = await Inquiry.findOne(query)
      .select('-notes -timeline -followUpCompletedBy')
      .populate('messages.sender', '_id name email role');

    if (!inquiry) {
      return next(new ApiError(404, 'Ticket / Enquiry not found or access denied'));
    }

    return successResponse(res, 200, 'Ticket details retrieved successfully', inquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * 14. Upload Attachment for Enquiry / Support Ticket
 */
export const uploadInquiryAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please select a file to upload'));
    }

    const fileUrl = `/uploads/tickets/${req.file.filename}`;
    return successResponse(res, 200, 'Attachment uploaded successfully', {
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 15. Two-Way Message Creation for Tickets
 * Rules:
 * - Both client owner and authorized admin/editor can participate.
 * - When closed, conversation is read-only; new messages are strictly rejected with 400.
 */
export const addInquiryMessage = async (req, res, next) => {
  try {
    const { message, attachments } = req.body;
    if (!message || !String(message).trim()) {
      return next(new ApiError(400, 'Message body cannot be empty'));
    }

    const cleanMessage = String(message).trim();
    if (cleanMessage.length > 5000) {
      return next(new ApiError(400, 'Message cannot exceed 5000 characters'));
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry / Ticket not found'));
    }

    // MANDATORY REQUIREMENT: If ticket is closed, reject new messages
    if (inquiry.status === 'closed') {
      return next(new ApiError(400, 'This ticket has been closed. You can view the conversation history, but new replies are no longer available.'));
    }

    const isStaff = ['admin', 'editor'].includes(req.user.role);
    const isOwner =
      (inquiry.user && inquiry.user.toString() === req.user._id.toString()) ||
      (inquiry.email && req.user.email && inquiry.email.toLowerCase() === req.user.email.toLowerCase());

    if (!isStaff && !isOwner) {
      return next(new ApiError(403, 'You are not authorized to post messages to this ticket.'));
    }

    const senderRole = isStaff ? (req.user.role === 'admin' ? 'admin' : 'editor') : 'customer';
    const senderName = req.user.name || (isStaff ? 'DY&C Support' : 'Customer');

    const validatedAttachments = Array.isArray(attachments)
      ? attachments
          .map((att) => ({
            fileName: att.fileName || 'Attachment',
            fileUrl: att.fileUrl,
            fileSize: att.fileSize || 0,
            fileType: att.fileType || '',
            uploadedAt: new Date(),
            uploadedByName: senderName,
          }))
          .filter((att) => att.fileUrl)
      : [];

    const newMessage = {
      sender: req.user._id,
      senderName,
      senderRole,
      message: cleanMessage,
      attachments: validatedAttachments,
      createdAt: new Date(),
    };

    inquiry.messages.push(newMessage);

    inquiry.timeline.push({
      type: 'message_sent',
      description: `Message sent by ${senderName} (${senderRole})`,
      performedBy: req.user._id,
      performedByName: senderName,
    });

    await inquiry.save();

    return successResponse(res, 201, 'Message sent successfully', newMessage);
  } catch (error) {
    next(error);
  }
};

/**
 * 16. Admin Close Ticket Action
 * Replaces permanent Delete with Close.
 * Stores closedAt, closedBy, closureReason, and locks the conversation as read-only.
 */
export const closeInquiry = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry / Ticket not found'));
    }

    if (inquiry.status === 'closed') {
      return next(new ApiError(400, 'This ticket is already closed'));
    }

    const actorName = req.user?.name || 'Administrator';
    const actorId = req.user?._id;

    inquiry.status = 'closed';
    inquiry.leadStage = 'lost';
    inquiry.closedAt = new Date();
    inquiry.closedBy = actorId;
    inquiry.closedByName = actorName;
    inquiry.closureReason = reason ? String(reason).trim() : 'Closed by administrator';

    inquiry.timeline.push({
      type: 'ticket_closed',
      description: `Ticket closed by ${actorName}${reason ? `: ${reason}` : ''}. Conversation is now read-only.`,
      performedBy: actorId,
      performedByName: actorName,
      metadata: { reason: inquiry.closureReason, closedAt: inquiry.closedAt },
    });

    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role');

    return successResponse(res, 200, 'Ticket closed successfully. Conversation is now read-only.', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * 17. Admin Reopen Ticket Action (Optional safe staff workflow)
 * Restores conversation capabilities if admin explicitly reopens.
 */
export const reopenInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return next(new ApiError(404, 'Enquiry / Ticket not found'));
    }

    if (inquiry.status !== 'closed') {
      return next(new ApiError(400, 'This ticket is not closed'));
    }

    const actorName = req.user?.name || 'Administrator';
    const actorId = req.user?._id;

    inquiry.status = 'contacted';
    inquiry.leadStage = 'contacted';
    inquiry.closedAt = null;
    inquiry.closedBy = null;
    inquiry.closedByName = null;
    inquiry.closureReason = null;

    inquiry.timeline.push({
      type: 'ticket_reopened',
      description: `Ticket reopened by ${actorName}. Conversation unlocked.`,
      performedBy: actorId,
      performedByName: actorName,
    });

    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', '_id name email role')
      .populate('notes.addedBy', '_id name email role')
      .populate('timeline.performedBy', '_id name email role');

    return successResponse(res, 200, 'Ticket reopened successfully', populated);
  } catch (error) {
    next(error);
  }
};
