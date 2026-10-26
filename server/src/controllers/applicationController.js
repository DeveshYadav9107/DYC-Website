import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

// Safe email sender for recruitment notifications
const sendRecruitmentEmail = async ({ to, subject, html }) => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
      console.log(`[Recruitment Email Mock] To: ${to} | Subject: ${subject}`);
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
      from: env.EMAIL_FROM || '"DY&C Recruitment Desk" <no-reply@dyc.co.in>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.warn('Recruitment email delivery warning:', err?.message || err);
  }
};

/**
 * @desc Upload resume file
 * @route POST /api/v1/applications/upload-resume
 * @access Public
 */
export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please select a resume file (PDF, DOC, DOCX) to upload'));
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    return res.status(200).json(
      new ApiResponse(200, {
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
      }, 'Resume uploaded successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Submit job application
 * @route POST /api/v1/applications
 * @access Public / Authenticated Candidate
 */
export const submitApplication = async (req, res, next) => {
  try {
    const {
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      currentCompany,
      currentDesignation,
      totalExperience,
      currentSalary,
      expectedSalary,
      noticePeriod,
      skills,
      resumeUrl,
      resumeFileName,
      coverLetter,
      portfolioLink,
    } = req.body;

    if (!jobId || !candidateName || !candidateEmail || !candidatePhone) {
      return next(new ApiError(400, 'Please provide Job ID, Name, Email, and Phone'));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new ApiError(404, 'The requested job posting does not exist'));
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    // Optional user association if candidate is logged in
    const candidateUserId = req.user?._id || null;

    const application = await JobApplication.create({
      job: job._id,
      candidate: candidateUserId,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.toLowerCase().trim(),
      candidatePhone: candidatePhone.trim(),
      currentCompany: currentCompany || '',
      currentDesignation: currentDesignation || '',
      totalExperience: totalExperience || '0 years',
      currentSalary: currentSalary || '',
      expectedSalary: expectedSalary || '',
      noticePeriod: noticePeriod || '30 Days',
      skills: parsedSkills,
      resumeUrl: resumeUrl || '',
      resumeFileName: resumeFileName || (resumeUrl ? 'Candidate_Resume.pdf' : ''),
      coverLetter: coverLetter || '',
      portfolioLink: portfolioLink || '',
      status: 'Applied',
      stageHistory: [
        {
          status: 'Applied',
          changedAt: new Date(),
          changedByName: 'Candidate',
          note: 'Application successfully submitted online',
        },
      ],
      statusNotification: {
        message: `Your application for "${job.title}" has been received and is queued for recruiter screening.`,
        updatedAt: new Date(),
        unread: true,
      },
    });

    // Update job applications count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    // If candidate is logged in, optionally save skills and resume to their profile
    if (candidateUserId) {
      await User.findByIdAndUpdate(candidateUserId, {
        $addToSet: { skills: { $each: parsedSkills } },
        ...(resumeUrl ? { resumeUrl, resumeFileName } : {}),
        totalExperience: totalExperience || undefined,
        designation: currentDesignation || undefined,
        company: currentCompany || undefined,
      });
    }

    // Send confirmation email asynchronously
    sendRecruitmentEmail({
      to: candidateEmail,
      subject: `Application Confirmed: ${job.title} at DY&C Staffing`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
          <h2 style="color: #174B39; margin-top: 0;">Application Received!</h2>
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>Thank you for applying for the <strong>${job.title}</strong> position (${job.department}) with Dinesh Yadav & Company.</p>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #E7E0D3; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Application ID:</strong> ${application._id}</p>
            <p style="margin: 4px 0;"><strong>Position:</strong> ${job.title}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${job.location}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #174B39; font-weight: bold;">Applied / Under Review</span></p>
          </div>
          <p>Our staffing specialists are reviewing your resume. You can track your application status anytime via the DY&C Candidate Portal.</p>
          <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C Recruitment & Staffing Team</strong></p>
        </div>
      `,
    });

    return res.status(201).json(
      new ApiResponse(201, application, 'Application submitted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get applications of currently logged-in candidate
 * @route GET /api/v1/applications/my
 * @access Private (Candidate/Customer)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const candidateId = req.user?._id;
    const candidateEmail = req.user?.email?.toLowerCase();

    // Find applications linked to this user ID or user email
    const applications = await JobApplication.find({
      $or: [{ candidate: candidateId }, { candidateEmail }],
    })
      .populate('job', 'title department location type salaryRange workplaceType')
      .sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, applications, 'My applications retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all applications for Recruiter / Admin Dashboard with filters
 * @route GET /api/v1/applications
 * @access Private (Admin, Editor)
 */
export const getAdminApplications = async (req, res, next) => {
  try {
    const { status, jobId, skill, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (jobId && jobId !== 'All') {
      query.job = jobId;
    }

    if (skill && skill.trim()) {
      query.skills = new RegExp(skill.trim(), 'i');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { candidateName: searchRegex },
        { candidateEmail: searchRegex },
        { candidatePhone: searchRegex },
        { currentCompany: searchRegex },
        { currentDesignation: searchRegex },
        { skills: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await JobApplication.countDocuments(query);

    const applications = await JobApplication.find(query)
      .populate('job', 'title department location type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          applications,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1,
        },
        'Applications retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get recruitment dashboard statistics
 * @route GET /api/v1/applications/stats
 * @access Private (Admin, Editor)
 */
export const getApplicationStats = async (req, res, next) => {
  try {
    const [total, applied, screening, interview, selected, rejected, placed] = await Promise.all([
      JobApplication.countDocuments(),
      JobApplication.countDocuments({ status: 'Applied' }),
      JobApplication.countDocuments({ status: 'Screening' }),
      JobApplication.countDocuments({ status: 'Interview' }),
      JobApplication.countDocuments({ status: 'Selected' }),
      JobApplication.countDocuments({ status: 'Rejected' }),
      JobApplication.countDocuments({ status: 'Placed' }),
    ]);

    const activeJobs = await Job.countDocuments({ status: 'published', isActive: true });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalApplications: total,
          applied,
          screening,
          interview,
          selected,
          rejected,
          placed,
          activeJobs,
        },
        'Recruitment stats retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get application detail by ID
 * @route GET /api/v1/applications/:id
 * @access Private (Admin, Editor, or Candidate Owner)
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id).populate('job');
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }

    // If regular candidate, ensure they own the application
    if (req.user?.role !== 'admin' && req.user?.role !== 'editor') {
      const isOwner =
        (application.candidate && application.candidate.toString() === req.user?._id?.toString()) ||
        application.candidateEmail === req.user?.email;
      if (!isOwner) {
        return next(new ApiError(403, 'Not authorized to view this application'));
      }
    }

    return res.status(200).json(new ApiResponse(200, application, 'Application details retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update Application Stage Status (Applied -> Screening -> Interview -> Selected -> Rejected)
 * @route PATCH /api/v1/applications/:id/status
 * @access Private (Admin, Editor)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected', 'Placed'];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    const application = await JobApplication.findById(id).populate('job', 'title');
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }

    const prevStatus = application.status;
    application.status = status;

    // Push into stage history
    application.stageHistory.push({
      status,
      changedAt: new Date(),
      changedByName: req.user?.name || 'Recruiter',
      note: note || `Status updated from ${prevStatus} to ${status}`,
    });

    // Update candidate notification
    let statusMsg = `Your application for "${application.job?.title || 'position'}" has moved to: ${status}.`;
    if (status === 'Screening') {
      statusMsg = `Your profile is being screened by our technical recruiter for "${application.job?.title}".`;
    } else if (status === 'Interview') {
      statusMsg = `Great news! You have been shortlisted for an interview for "${application.job?.title}".`;
    } else if (status === 'Selected') {
      statusMsg = `Congratulations! You have been selected for the "${application.job?.title}" position.`;
    } else if (status === 'Rejected') {
      statusMsg = `Update on your application for "${application.job?.title}": Unfortunately we will not be moving forward at this time.`;
    }

    application.statusNotification = {
      message: statusMsg,
      updatedAt: new Date(),
      unread: true,
    };

    await application.save();

    // Send email notification to candidate
    sendRecruitmentEmail({
      to: application.candidateEmail,
      subject: `Status Update: ${application.job?.title || 'Job Application'} - ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
          <h2 style="color: #174B39; margin-top: 0;">Application Status Update</h2>
          <p>Dear <strong>${application.candidateName}</strong>,</p>
          <p>${statusMsg}</p>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #E7E0D3; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Current Stage:</strong> <span style="color: #174B39; font-weight: bold; font-size: 16px;">${status}</span></p>
            ${note ? `<p style="margin: 4px 0;"><strong>Recruiter Note:</strong> ${note}</p>` : ''}
          </div>
          <p>Please check your Candidate Portal for next steps and upcoming interview details.</p>
          <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C Recruitment Desk</strong></p>
        </div>
      `,
    });

    return res.status(200).json(
      new ApiResponse(200, application, `Application status updated to ${status}`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Schedule an interview round for candidate
 * @route POST /api/v1/applications/:id/interviews
 * @access Private (Admin, Editor)
 */
export const scheduleInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      roundName,
      scheduledDate,
      time,
      meetingType,
      meetingLink,
      location,
      interviewerName,
      note,
    } = req.body;

    if (!roundName || !scheduledDate || !time) {
      return next(new ApiError(400, 'Round name, scheduled date, and time are required'));
    }

    const application = await JobApplication.findById(id).populate('job', 'title location');
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }

    const newInterview = {
      roundName,
      scheduledDate: new Date(scheduledDate),
      time,
      meetingType: meetingType || 'Online (Google Meet / Zoom)',
      meetingLink: meetingLink || '',
      location: location || '',
      interviewerName: interviewerName || 'DY&C Recruitment Panel',
      status: 'Scheduled',
      createdAt: new Date(),
    };

    application.interviews.push(newInterview);
    application.status = 'Interview';

    application.stageHistory.push({
      status: 'Interview',
      changedAt: new Date(),
      changedByName: req.user?.name || 'Recruiter',
      note: `Interview scheduled: ${roundName} on ${new Date(scheduledDate).toLocaleDateString()} at ${time}`,
    });

    const notifMsg = `Interview Scheduled! ${roundName} has been booked for ${new Date(
      scheduledDate
    ).toLocaleDateString()} at ${time}.`;

    application.statusNotification = {
      message: notifMsg,
      updatedAt: new Date(),
      unread: true,
    };

    await application.save();

    // Dispatch interview invitation email
    sendRecruitmentEmail({
      to: application.candidateEmail,
      subject: `Interview Scheduled: ${roundName} - ${application.job?.title || 'DY&C Position'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F8F5EE; border-radius: 12px;">
          <h2 style="color: #174B39; margin-top: 0;">Interview Invitation</h2>
          <p>Dear <strong>${application.candidateName}</strong>,</p>
          <p>You have been scheduled for an interview for the position of <strong>${application.job?.title || 'Candidate'}</strong>.</p>
          <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #E7E0D3; margin: 16px 0;">
            <p style="margin: 6px 0;"><strong>Round:</strong> ${roundName}</p>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 6px 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 6px 0;"><strong>Format:</strong> ${meetingType || 'Online Video Call'}</p>
            ${meetingLink ? `<p style="margin: 6px 0;"><strong>Video Link:</strong> <a href="${meetingLink}" target="_blank" style="color: #174B39; font-weight: bold;">${meetingLink}</a></p>` : ''}
            ${location ? `<p style="margin: 6px 0;"><strong>Venue / Address:</strong> ${location}</p>` : ''}
            <p style="margin: 6px 0;"><strong>Interviewer:</strong> ${interviewerName || 'DY&C Selection Committee'}</p>
          </div>
          ${note ? `<p style="background: #EAF0E8; padding: 12px; border-radius: 6px; color: #174B39;"><strong>Notes for Candidate:</strong> ${note}</p>` : ''}
          <p>Please ensure you are ready 5 minutes prior to the scheduled time. Reach out to your recruiter if you need to reschedule.</p>
          <p style="color: #66665D; font-size: 13px;">Warm regards,<br/><strong>DY&C Recruitment & Staffing Team</strong></p>
        </div>
      `,
    });

    return res.status(200).json(
      new ApiResponse(200, application, 'Interview round scheduled successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update Interview round outcome & feedback
 * @route PATCH /api/v1/applications/:id/interviews/:interviewId
 * @access Private (Admin, Editor)
 */
export const updateInterviewRound = async (req, res, next) => {
  try {
    const { id, interviewId } = req.params;
    const { status, feedback, rating } = req.body;

    const application = await JobApplication.findById(id);
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }

    const round = application.interviews.id(interviewId);
    if (!round) {
      return next(new ApiError(404, 'Interview round not found'));
    }

    if (status) round.status = status;
    if (feedback !== undefined) round.feedback = feedback;
    if (rating !== undefined) round.rating = rating;

    await application.save();

    return res.status(200).json(
      new ApiResponse(200, application, 'Interview round updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add recruiter internal evaluation note
 * @route POST /api/v1/applications/:id/notes
 * @access Private (Admin, Editor)
 */
export const addRecruiterNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return next(new ApiError(400, 'Note text is required'));
    }

    const application = await JobApplication.findById(id);
    if (!application) {
      return next(new ApiError(404, 'Application not found'));
    }

    application.recruiterNotes.push({
      note: note.trim(),
      authorName: req.user?.name || 'Recruiter',
      authorId: req.user?._id,
      createdAt: new Date(),
    });

    await application.save();

    return res.status(200).json(
      new ApiResponse(200, application, 'Recruiter note added successfully')
    );
  } catch (error) {
    next(error);
  }
};
