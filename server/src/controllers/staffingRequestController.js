import StaffingRequest from '../models/StaffingRequest.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Safe email sender for client staffing notifications
const sendStaffingEmail = async ({ to, subject, html }) => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
      console.log(`[Staffing Email Mock] To: ${to} | Subject: ${subject}`);
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
      from: env.EMAIL_FROM || '"DY&C Client Staffing Desk" <no-reply@dyc.co.in>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.warn('Staffing email delivery warning:', err?.message || err);
  }
};

/**
 * @desc Submit new client manpower requirement
 * @route POST /api/v1/staffing-requests
 * @access Public / Authenticated Client
 */
export const submitStaffingRequest = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      industry,
      roleTitle,
      employmentType,
      headcount,
      experienceRequired,
      requiredSkills,
      workLocation,
      timeline,
      budgetPerResource,
      jobDescription,
    } = req.body;

    if (!companyName || !contactPerson || !contactEmail || !contactPhone || !roleTitle || !workLocation) {
      return next(new ApiError(400, 'Company name, contact details, role title, and work location are required'));
    }

    const parsedSkills = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const staffingReq = await StaffingRequest.create({
      clientUser: req.user?._id || null,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      contactEmail: contactEmail.toLowerCase().trim(),
      contactPhone: contactPhone.trim(),
      industry: industry || 'Manufacturing & Production',
      roleTitle: roleTitle.trim(),
      employmentType: employmentType || 'Contract Manpower',
      headcount: headcount ? parseInt(headcount) : 1,
      experienceRequired: experienceRequired || '2-5 years',
      requiredSkills: parsedSkills,
      workLocation: workLocation.trim(),
      timeline: timeline || '15 Days',
      budgetPerResource: budgetPerResource || 'Standard / Negotiable',
      jobDescription: jobDescription || '',
      status: 'Submitted',
      fulfillmentProgress: {
        sourcedCount: 0,
        interviewedCount: 0,
        joinedCount: 0,
      },
    });

    // Send confirmation email to client
    sendStaffingEmail({
      to: contactEmail,
      subject: `Manpower Requirement Registered: ${staffingReq.requestNumber} - ${roleTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
          <h2 style="color: #174B39; margin-top: 0;">Manpower Requirement Logged</h2>
          <p>Dear <strong>${contactPerson}</strong> (${companyName}),</p>
          <p>We have successfully received your manpower staffing request for <strong>${roleTitle}</strong> (${headcount} position${headcount > 1 ? 's' : ''}).</p>
          <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #E7E0D3; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Requisition No:</strong> ${staffingReq.requestNumber}</p>
            <p style="margin: 4px 0;"><strong>Role:</strong> ${roleTitle}</p>
            <p style="margin: 4px 0;"><strong>Headcount:</strong> ${headcount}</p>
            <p style="margin: 4px 0;"><strong>Engagement Type:</strong> ${employmentType}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${workLocation}</p>
            <p style="margin: 4px 0;"><strong>Target Timeline:</strong> ${timeline}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #174B39; font-weight: bold;">Submitted / Assigned to Sourcing Team</span></p>
          </div>
          <p>A dedicated DY&C recruitment lead will contact you within 24 hours with pre-screened talent profiles.</p>
          <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C Corporate Staffing Solutions</strong></p>
        </div>
      `,
    });

    return res.status(201).json(
      new ApiResponse(201, staffingReq, 'Staffing requirement submitted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get staffing requests submitted by logged-in client
 * @route GET /api/v1/staffing-requests/my
 * @access Private
 */
export const getMyStaffingRequests = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email?.toLowerCase();

    const requests = await StaffingRequest.find({
      $or: [{ clientUser: userId }, { contactEmail: userEmail }],
    }).sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, requests, 'Client staffing requests retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all staffing requests for Admin / Recruiter
 * @route GET /api/v1/staffing-requests
 * @access Private (Admin, Editor)
 */
export const getAdminStaffingRequests = async (req, res, next) => {
  try {
    const { status, industry, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (industry && industry !== 'All') {
      query.industry = industry;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { requestNumber: searchRegex },
        { companyName: searchRegex },
        { contactPerson: searchRegex },
        { contactEmail: searchRegex },
        { roleTitle: searchRegex },
        { workLocation: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await StaffingRequest.countDocuments(query);

    const requests = await StaffingRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          requests,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1,
        },
        'Staffing requests retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single staffing request by ID
 * @route GET /api/v1/staffing-requests/:id
 * @access Private
 */
export const getStaffingRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await StaffingRequest.findById(id);
    if (!request) {
      return next(new ApiError(404, 'Staffing request not found'));
    }

    // Permission check for non-admins
    if (req.user?.role !== 'admin' && req.user?.role !== 'editor') {
      const isOwner =
        (request.clientUser && request.clientUser.toString() === req.user?._id?.toString()) ||
        request.contactEmail === req.user?.email;
      if (!isOwner) {
        return next(new ApiError(403, 'Not authorized to view this request'));
      }
    }

    return res.status(200).json(new ApiResponse(200, request, 'Staffing request retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update staffing request status
 * @route PATCH /api/v1/staffing-requests/:id/status
 * @access Private (Admin, Editor)
 */
export const updateStaffingRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedRecruiterName, note } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'Sourcing Talent', 'Interviews Ongoing', 'Fulfilled', 'Closed'];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const request = await StaffingRequest.findById(id);
    if (!request) {
      return next(new ApiError(404, 'Staffing request not found'));
    }

    request.status = status;
    if (assignedRecruiterName) request.assignedRecruiterName = assignedRecruiterName;

    if (note) {
      request.recruiterNotes.push({
        note: note.trim(),
        authorName: req.user?.name || 'Recruitment Desk',
        createdAt: new Date(),
      });
    }

    await request.save();

    return res.status(200).json(
      new ApiResponse(200, request, `Staffing request status updated to ${status}`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update fulfillment progress (sourced, interviewed, joined counts)
 * @route PATCH /api/v1/staffing-requests/:id/progress
 * @access Private (Admin, Editor)
 */
export const updateStaffingProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sourcedCount, interviewedCount, joinedCount } = req.body;

    const request = await StaffingRequest.findById(id);
    if (!request) {
      return next(new ApiError(404, 'Staffing request not found'));
    }

    if (sourcedCount !== undefined) request.fulfillmentProgress.sourcedCount = Math.max(0, parseInt(sourcedCount));
    if (interviewedCount !== undefined) request.fulfillmentProgress.interviewedCount = Math.max(0, parseInt(interviewedCount));
    if (joinedCount !== undefined) {
      request.fulfillmentProgress.joinedCount = Math.max(0, parseInt(joinedCount));
      // Auto-mark fulfilled if joined count meets or exceeds headcount
      if (request.fulfillmentProgress.joinedCount >= request.headcount && request.status !== 'Closed') {
        request.status = 'Fulfilled';
      }
    }

    await request.save();

    return res.status(200).json(
      new ApiResponse(200, request, 'Staffing fulfillment progress updated')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add note to staffing request
 * @route POST /api/v1/staffing-requests/:id/notes
 * @access Private (Admin, Editor)
 */
export const addStaffingNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return next(new ApiError(400, 'Note text is required'));
    }

    const request = await StaffingRequest.findById(id);
    if (!request) {
      return next(new ApiError(404, 'Staffing request not found'));
    }

    request.recruiterNotes.push({
      note: note.trim(),
      authorName: req.user?.name || 'Recruitment Lead',
      createdAt: new Date(),
    });

    await request.save();

    return res.status(200).json(
      new ApiResponse(200, request, 'Note added to staffing request')
    );
  } catch (error) {
    next(error);
  }
};
