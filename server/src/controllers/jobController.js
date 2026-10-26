import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import slugify from 'slugify';

/**
 * @desc Get all public published jobs with search & filters
 * @route GET /api/v1/jobs
 * @access Public
 */
export const getPublicJobs = async (req, res, next) => {
  try {
    const { search, department, type, location, experience, workplaceType, page = 1, limit = 20 } = req.query;

    const query = { status: 'published', isActive: true };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
        { skills: searchRegex },
        { description: searchRegex },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (workplaceType && workplaceType !== 'All') {
      query.workplaceType = workplaceType;
    }

    if (location && location !== 'All') {
      query.location = new RegExp(location.trim(), 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ urgent: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get department counts for quick filter pill counters
    const departmentCounts = await Job.aggregate([
      { $match: { status: 'published', isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const deptMap = {};
    departmentCounts.forEach(d => {
      deptMap[d._id] = d.count;
    });

    return res.status(200).json(
      new ApiResponse(200, {
        jobs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
        deptMap,
      }, 'Jobs retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single job by slug or ID
 * @route GET /api/v1/jobs/:idOrSlug
 * @access Public
 */
export const getJobBySlugOrId = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let job;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      job = await Job.findById(idOrSlug);
    } else {
      job = await Job.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!job) {
      return next(new ApiError(404, 'Job vacancy not found or no longer available'));
    }

    // Increment views asynchronously
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    return res.status(200).json(new ApiResponse(200, job, 'Job details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all jobs for Admin / Recruiter Dashboard
 * @route GET /api/v1/jobs/admin/all
 * @access Private (Admin, Editor)
 */
export const getAdminJobs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Calculate live applications count per job
    const applicationsCounts = await JobApplication.aggregate([
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    applicationsCounts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const jobsWithCounts = jobs.map(j => {
      const jobObj = j.toObject();
      jobObj.applicationsCount = countMap[j._id.toString()] || 0;
      return jobObj;
    });

    return res.status(200).json(
      new ApiResponse(200, { jobs: jobsWithCounts, total: jobs.length }, 'Admin jobs retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new Job Requisition
 * @route POST /api/v1/jobs
 * @access Private (Admin, Editor)
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      workplaceType,
      type,
      experience,
      openings,
      salaryRange,
      skills,
      description,
      responsibilities,
      requirements,
      benefits,
      urgent,
      status,
    } = req.body;

    if (!title || !description) {
      return next(new ApiError(400, 'Title and description are required'));
    }

    // Generate unique slug
    let baseSlug = slugify(title, { lower: true, strict: true }) || 'job';
    let slug = baseSlug;
    let counter = 1;
    while (await Job.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const job = await Job.create({
      title,
      slug,
      department: department || 'General Staffing',
      location: location || 'Gurugram, Haryana',
      workplaceType: workplaceType || 'On-site',
      type: type || 'full-time',
      experience: experience || '2-5 years',
      openings: openings ? parseInt(openings) : 1,
      salaryRange: salaryRange || 'Competitive / As per industry',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n').map(r => r.trim()).filter(Boolean) : []),
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').map(r => r.trim()).filter(Boolean) : []),
      benefits: Array.isArray(benefits) ? benefits : (benefits ? benefits.split('\n').map(b => b.trim()).filter(Boolean) : []),
      urgent: Boolean(urgent),
      status: status || 'published',
      isActive: status !== 'closed',
      postedBy: req.user?._id,
    });

    return res.status(201).json(new ApiResponse(201, job, 'Job created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update Job Requisition
 * @route PUT /api/v1/jobs/:id
 * @access Private (Admin, Editor)
 */
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }

    const updates = { ...req.body };
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.responsibilities && typeof updates.responsibilities === 'string') {
      updates.responsibilities = updates.responsibilities.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (updates.requirements && typeof updates.requirements === 'string') {
      updates.requirements = updates.requirements.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (updates.benefits && typeof updates.benefits === 'string') {
      updates.benefits = updates.benefits.split('\n').map(b => b.trim()).filter(Boolean);
    }

    if (updates.status) {
      updates.isActive = updates.status !== 'closed';
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return res.status(200).json(new ApiResponse(200, updatedJob, 'Job updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete Job Requisition
 * @route DELETE /api/v1/jobs/:id
 * @access Private (Admin, Editor)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return next(new ApiError(404, 'Job not found'));
    }

    await Job.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, 'Job deleted successfully'));
  } catch (error) {
    next(error);
  }
};
