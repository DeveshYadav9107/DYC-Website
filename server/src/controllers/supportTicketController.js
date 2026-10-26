import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Safe email sender for SAP support desk
const sendSupportEmail = async ({ to, subject, html }) => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
      console.log(`[Support Email Mock] To: ${to} | Subject: ${subject}`);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST || 'smtp.gmail.com',
      port: env.EMAIL_PORT || 587,
      secure: env.EMAIL_SECURE,
      family: 4,
      connectionTimeout: 5000,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM || '"DY&C SAP Enterprise Support" <support@dyc.co.in>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.warn('Support email delivery warning:', err?.message || err);
  }
};

/**
 * @desc Upload log / screenshot / dump file for support ticket
 * @route POST /api/v1/support-tickets/upload-attachment
 * @access Private
 */
export const uploadTicketFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please select a file to upload'));
    }

    const fileUrl = `/uploads/tickets/${req.file.filename}`;
    return res.status(200).json(
      new ApiResponse(200, {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      }, 'Attachment uploaded successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new SAP Support Ticket
 * @route POST /api/v1/support-tickets
 * @access Private (Client / Authorized user)
 */
export const createSupportTicket = async (req, res, next) => {
  try {
    const {
      module,
      environment,
      tCode,
      sapVersion,
      category,
      subject,
      description,
      priority,
      attachments,
      companyName,
    } = req.body;

    if (!subject || !description) {
      return next(new ApiError(400, 'Subject and detailed description are required'));
    }

    const clientUser = req.user;
    const finalCompanyName = companyName || clientUser.company || clientUser.name || 'Enterprise Client';

    const ticket = await SupportTicket.create({
      clientUser: clientUser._id,
      clientName: clientUser.name,
      clientEmail: clientUser.email,
      clientPhone: clientUser.phone || '',
      companyName: finalCompanyName,
      module: module || 'FICO',
      environment: environment || 'Production (PRD)',
      tCode: tCode || '',
      sapVersion: sapVersion || clientUser.sapSystem || 'SAP S/4HANA Enterprise',
      category: category || 'Functional Issue',
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'P3 - Medium',
      status: 'Open',
      attachments: Array.isArray(attachments) ? attachments : [],
      messages: [
        {
          sender: clientUser._id,
          senderName: clientUser.name,
          senderRole: clientUser.role === 'admin' ? 'admin' : 'client',
          message: description.trim(),
          attachments: Array.isArray(attachments) ? attachments : [],
          createdAt: new Date(),
        },
      ],
      activityLogs: [
        {
          action: `Ticket logged by ${clientUser.name} (${finalCompanyName}) with priority ${priority || 'P3 - Medium'}`,
          performedBy: clientUser.name,
          timestamp: new Date(),
        },
      ],
    });

    // Send confirmation email to client
    sendSupportEmail({
      to: clientUser.email,
      subject: `[${ticket.ticketNumber}] SAP Support Ticket Registered: ${ticket.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
          <h2 style="color: #174B39; margin-top: 0;">SAP Support Request Acknowledged</h2>
          <p>Dear <strong>${clientUser.name}</strong>,</p>
          <p>Your support ticket has been registered in the DY&C SAP Enterprise AMS Helpdesk.</p>
          <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #E7E0D3; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Ticket Number:</strong> <span style="font-family: monospace; font-weight: bold; color: #174B39;">${ticket.ticketNumber}</span></p>
            <p style="margin: 4px 0;"><strong>Module:</strong> ${ticket.module} · <strong>Environment:</strong> ${ticket.environment}</p>
            ${ticket.tCode ? `<p style="margin: 4px 0;"><strong>T-Code:</strong> ${ticket.tCode}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Priority:</strong> <span style="font-weight: bold; color: ${ticket.priority.includes('P1') ? '#DC2626' : '#B88A3B'};">${ticket.priority}</span></p>
            <p style="margin: 4px 0;"><strong>Resolution Target SLA:</strong> ${ticket.slaTargetHours} Hours (Target: ${new Date(ticket.slaResolutionDeadline).toLocaleString('en-IN')})</p>
          </div>
          <p>A certified SAP consultant from our support desk has been allocated and is investigating. You can track progress and reply with logs directly in your Support Portal.</p>
          <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C SAP Technical & Functional Support Desk</strong></p>
        </div>
      `,
    });

    return res.status(201).json(new ApiResponse(201, ticket, 'Support ticket created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get support tickets for currently logged-in client
 * @route GET /api/v1/support-tickets/my
 * @access Private
 */
export const getMySupportTickets = async (req, res, next) => {
  try {
    const { status, priority, module, search, page = 1, limit = 50 } = req.query;

    const query = { clientUser: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (module && module !== 'All') {
      query.module = module;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { ticketNumber: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
        { tCode: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SupportTicket.countDocuments(query);

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Evaluate live SLA status on every ticket before returning
    const updatedTickets = tickets.map((t) => {
      t.evaluateSlaStatus();
      return t;
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tickets: updatedTickets,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1,
        },
        'Client support tickets retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all support tickets for Admin / Support Lead
 * @route GET /api/v1/support-tickets
 * @access Private (Admin, Editor)
 */
export const getAdminSupportTickets = async (req, res, next) => {
  try {
    const { status, priority, module, slaStatus, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (module && module !== 'All') {
      query.module = module;
    }

    if (slaStatus && slaStatus !== 'All') {
      query.slaStatus = slaStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { ticketNumber: searchRegex },
        { companyName: searchRegex },
        { clientName: searchRegex },
        { subject: searchRegex },
        { tCode: searchRegex },
        { assignedToName: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SupportTicket.countDocuments(query);

    const tickets = await SupportTicket.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Update live SLA statuses
    tickets.forEach((t) => t.evaluateSlaStatus());

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          tickets,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1,
        },
        'All support tickets retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get Support Desk Statistics & SLA metrics
 * @route GET /api/v1/support-tickets/stats
 * @access Private
 */
export const getSupportTicketStats = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'editor'
      ? {}
      : { clientUser: req.user._id };

    const [
      total,
      open,
      inProgress,
      pendingClient,
      inTesting,
      resolved,
      closed,
      criticalP1,
    ] = await Promise.all([
      SupportTicket.countDocuments(query),
      SupportTicket.countDocuments({ ...query, status: 'Open' }),
      SupportTicket.countDocuments({ ...query, status: 'In Progress' }),
      SupportTicket.countDocuments({ ...query, status: 'Pending Client Info' }),
      SupportTicket.countDocuments({ ...query, status: 'In Testing / UAT' }),
      SupportTicket.countDocuments({ ...query, status: 'Resolved' }),
      SupportTicket.countDocuments({ ...query, status: 'Closed' }),
      SupportTicket.countDocuments({ ...query, priority: 'P1 - Critical', status: { $nin: ['Resolved', 'Closed'] } }),
    ]);

    // Calculate SLA breaches
    const now = new Date();
    const slaBreachedCount = await SupportTicket.countDocuments({
      ...query,
      status: { $nin: ['Resolved', 'Closed'] },
      slaResolutionDeadline: { $lt: now },
    });

    const activeTicketsCount = open + inProgress + pendingClient + inTesting;
    const slaComplianceRate = total > 0
      ? Math.max(0, Math.round(((total - slaBreachedCount) / total) * 1000) / 10)
      : 100;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total,
          open,
          inProgress,
          pendingClient,
          inTesting,
          resolved,
          closed,
          activeTicketsCount,
          criticalP1,
          slaBreachedCount,
          slaComplianceRate,
        },
        'Support ticket stats retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single ticket details and conversation thread
 * @route GET /api/v1/support-tickets/:idOrNumber
 * @access Private
 */
export const getSupportTicketByIdOrNumber = async (req, res, next) => {
  try {
    const { idOrNumber } = req.params;

    let ticket;
    if (idOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(idOrNumber);
    } else {
      ticket = await SupportTicket.findOne({ ticketNumber: idOrNumber.toUpperCase() });
    }

    if (!ticket) {
      return next(new ApiError(404, 'Support ticket not found'));
    }

    // Permission check for clients
    const isAdmin = req.user.role === 'admin' || req.user.role === 'editor';
    if (!isAdmin && ticket.clientUser.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to view this ticket'));
    }

    ticket.evaluateSlaStatus();

    // If client, filter out internal consultant notes
    const ticketObj = ticket.toObject();
    if (!isAdmin) {
      ticketObj.messages = ticketObj.messages.filter((m) => !m.isInternalNote);
    }

    return res.status(200).json(new ApiResponse(200, ticketObj, 'Ticket details retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Post reply or communication update in ticket thread
 * @route POST /api/v1/support-tickets/:id/messages
 * @access Private
 */
export const postTicketMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, attachments, isInternalNote } = req.body;

    if (!message || !message.trim()) {
      return next(new ApiError(400, 'Message body is required'));
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return next(new ApiError(404, 'Ticket not found'));
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'editor';
    if (!isAdmin && ticket.clientUser.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to reply to this ticket'));
    }

    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: isAdmin ? 'consultant' : 'client',
      message: message.trim(),
      isInternalNote: isAdmin && Boolean(isInternalNote),
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);

    if (isAdmin) {
      if (!ticket.firstRespondedAt) {
        ticket.firstRespondedAt = new Date();
      }
      if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }
      ticket.activityLogs.push({
        action: isInternalNote
          ? `Internal consultant note added by ${req.user.name}`
          : `Consultant reply sent by ${req.user.name}`,
        performedBy: req.user.name,
        timestamp: new Date(),
      });

      // Send email to client if this is a public client reply
      if (!isInternalNote) {
        sendSupportEmail({
          to: ticket.clientEmail,
          subject: `[${ticket.ticketNumber}] New Update from SAP Support Desk`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
              <h3 style="color: #174B39;">Update on Ticket ${ticket.ticketNumber}</h3>
              <p>Dear <strong>${ticket.clientName}</strong>,</p>
              <p>Our SAP consultant <strong>${req.user.name}</strong> has posted an update regarding: <em>"${ticket.subject}"</em></p>
              <div style="background: white; padding: 16px; border-left: 4px solid #174B39; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #252720; white-space: pre-line;">${message.trim()}</p>
              </div>
              <p>You can review and reply directly via the DY&C SAP Support Portal.</p>
              <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C SAP Technical Support</strong></p>
            </div>
          `,
        });
      }
    } else {
      // Client replied
      if (ticket.status === 'Pending Client Info') {
        ticket.status = 'In Progress';
      }
      ticket.activityLogs.push({
        action: `Client update posted by ${req.user.name}`,
        performedBy: req.user.name,
        timestamp: new Date(),
      });
    }

    await ticket.save();

    // Format response without internal notes if client
    const ticketObj = ticket.toObject();
    if (!isAdmin) {
      ticketObj.messages = ticketObj.messages.filter((m) => !m.isInternalNote);
    }

    return res.status(200).json(new ApiResponse(200, ticketObj, 'Message posted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update Ticket Status & Lifecycle Workflow
 * @route PATCH /api/v1/support-tickets/:id/status
 * @access Private (Admin, Editor)
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionSummary, transportRequest, rootCause, note } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Pending Client Info', 'In Testing / UAT', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return next(new ApiError(404, 'Ticket not found'));
    }

    const prevStatus = ticket.status;
    ticket.status = status;

    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
      if (resolutionSummary) ticket.resolutionSummary = resolutionSummary;
      if (transportRequest) ticket.transportRequest = transportRequest;
      if (rootCause) ticket.rootCause = rootCause;
    } else if (status === 'Closed') {
      ticket.closedAt = new Date();
    }

    ticket.activityLogs.push({
      action: `Status transitioned from "${prevStatus}" to "${status}" by ${req.user.name}${note ? ` (${note})` : ''}`,
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    ticket.evaluateSlaStatus();
    await ticket.save();

    // Send resolution email if resolved
    if (status === 'Resolved') {
      sendSupportEmail({
        to: ticket.clientEmail,
        subject: `[${ticket.ticketNumber}] Ticket Resolved: ${ticket.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
            <h2 style="color: #174B39; margin-top: 0;">SAP Support Issue Resolved</h2>
            <p>Dear <strong>${ticket.clientName}</strong>,</p>
            <p>We are pleased to inform you that support ticket <strong>${ticket.ticketNumber}</strong> has been resolved by our SAP consulting team.</p>
            <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #E7E0D3; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Resolution Summary:</strong> ${ticket.resolutionSummary || 'Issue verified and tested in QAS/PRD.'}</p>
              ${ticket.transportRequest ? `<p style="margin: 4px 0;"><strong>Transport Request (TR):</strong> <span style="font-family: monospace; font-weight: bold; color: #174B39;">${ticket.transportRequest}</span></p>` : ''}
              ${ticket.rootCause ? `<p style="margin: 4px 0;"><strong>Root Cause:</strong> ${ticket.rootCause}</p>` : ''}
              <p style="margin: 4px 0;"><strong>SLA Compliance:</strong> <span style="color: #174B39; font-weight: bold;">${ticket.slaStatus}</span></p>
            </div>
            <p>Please test in your system and confirm closure. You can rate the support experience in your portal.</p>
            <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C SAP Technical Support Team</strong></p>
          </div>
        `,
      });
    }

    return res.status(200).json(
      new ApiResponse(200, ticket, `Ticket status updated to ${status}`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Assign Support Ticket to Consultant / Specialist
 * @route POST /api/v1/support-tickets/:id/assign
 * @access Private (Admin, Editor)
 */
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedToName, assignedTeam } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return next(new ApiError(404, 'Ticket not found'));
    }

    ticket.assignedTo = assignedTo || req.user._id;
    ticket.assignedToName = assignedToName || req.user.name;
    if (assignedTeam) ticket.assignedTeam = assignedTeam;

    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    ticket.activityLogs.push({
      action: `Ticket assigned to ${ticket.assignedToName} (${ticket.assignedTeam}) by ${req.user.name}`,
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    await ticket.save();

    return res.status(200).json(
      new ApiResponse(200, ticket, `Ticket assigned to ${ticket.assignedToName}`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Rate CSAT on resolved ticket
 * @route POST /api/v1/support-tickets/:id/rating
 * @access Private (Client Owner)
 */
export const rateTicketCSAT = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return next(new ApiError(404, 'Ticket not found'));
    }

    if (ticket.clientUser.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Only ticket owner can provide feedback'));
    }

    ticket.rating = rating ? parseInt(rating) : 5;
    ticket.feedback = feedback || '';

    ticket.activityLogs.push({
      action: `Client submitted CSAT rating: ${ticket.rating}/5 stars`,
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    await ticket.save();

    return res.status(200).json(
      new ApiResponse(200, ticket, 'Thank you for your valuable feedback!')
    );
  } catch (error) {
    next(error);
  }
};
