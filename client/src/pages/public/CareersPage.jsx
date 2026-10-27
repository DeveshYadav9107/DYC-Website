import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiFilter,
  FiUpload,
  FiX,
  FiAlertCircle,
  FiStar,
  FiCheck,
  FiLock,
  FiLogIn,
  FiUserPlus,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  getJobs,
  submitJobApplication,
  uploadResume,
  getMyApplications,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const departmentsList = [
  'All',
  'SAP & ERP',
  'Manufacturing & Production',
  'Engineering & Technical',
  'Logistics & Supply Chain',
  'Operations & Facility',
];

const CareersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [deptCounts, setDeptCounts] = useState({});

  // User Applications (to detect already applied vs rejected vs new)
  const [myApplications, setMyApplications] = useState([]);

  // Auth requirement modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTargetJob, setAuthModalTargetJob] = useState(null);

  // Application Modal state
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    candidateName: user?.name || '',
    candidateEmail: user?.email || '',
    candidatePhone: user?.phone || '',
    currentCompany: user?.company || '',
    currentDesignation: user?.designation || '',
    totalExperience: user?.totalExperience || '',
    currentSalary: user?.currentSalary || '',
    expectedSalary: user?.expectedSalary || '',
    noticePeriod: user?.noticePeriod || '',
    skills: user?.skills ? user.skills.join(', ') : '',
    coverLetter: '',
    resumeUrl: user?.resumeUrl || '',
    resumeFileName: user?.resumeFileName || '',
  });

  // Pre-fill user data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        candidateName: user.name || prev.candidateName,
        candidateEmail: user.email || prev.candidateEmail,
        candidatePhone: user.phone || prev.candidatePhone,
        currentCompany: user.company || prev.currentCompany,
        currentDesignation: user.designation || prev.currentDesignation,
        totalExperience: user.totalExperience || prev.totalExperience,
        skills: user.skills?.length ? user.skills.join(', ') : prev.skills,
        resumeUrl: user.resumeUrl || prev.resumeUrl,
        resumeFileName: user.resumeFileName || prev.resumeFileName,
      }));
    }
  }, [user]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedType !== 'All') params.type = selectedType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await getJobs(params);
      const jobList = data?.jobs || data || [];
      setJobs(jobList);
      if (data?.deptMap) {
        setDeptCounts(data.deptMap);
      }
    } catch (err) {
      console.error('Failed to load careers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidate applications
  const fetchUserApplications = async () => {
    if (!isAuthenticated) {
      setMyApplications([]);
      return;
    }
    try {
      const data = await getMyApplications();
      setMyApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load user applications on careers page:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedDept, selectedType]);

  useEffect(() => {
    fetchUserApplications();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleOpenApplyModal = (job) => {
    // If not authenticated, prompt login/signup immediately
    if (!isAuthenticated) {
      setAuthModalTargetJob(job);
      setShowAuthModal(true);
      return;
    }

    setApplyModalJob(job);
    setSubmitSuccess(null);
    setSubmitError('');
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('Resume size cannot exceed 10MB.');
      return;
    }

    try {
      setResumeUploading(true);
      setSubmitError('');
      const uploadRes = await uploadResume(file);
      if (uploadRes?.url) {
        setFormData((prev) => ({
          ...prev,
          resumeUrl: uploadRes.url,
          resumeFileName: uploadRes.fileName || file.name,
        }));
      }
    } catch (err) {
      console.warn('Resume upload issue, using file reference:', err);
      setFormData((prev) => ({
        ...prev,
        resumeUrl: `/uploads/resumes/${file.name}`,
        resumeFileName: file.name,
      }));
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    // 1. Enforce Authentication Requirement
    if (!isAuthenticated) {
      setApplyModalJob(null);
      setShowAuthModal(true);
      return;
    }

    // 2. Validate mandatory personal contact details
    if (!formData.candidateName || !formData.candidateEmail || !formData.candidatePhone) {
      setSubmitError('Please fill in your name, email, and mobile number.');
      return;
    }

    // 3. Enforce Mandatory Resume Upload
    if (!formData.resumeUrl || !formData.resumeUrl.trim()) {
      setSubmitError(
        'Resume upload is mandatory. Please upload your CV / Resume document (PDF or DOCX) to proceed.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      const payload = {
        jobId: applyModalJob._id,
        ...formData,
      };

      const res = await submitJobApplication(payload);
      setSubmitSuccess(res?.data || res);
      // Refresh user applications so the card button updates to "Applied"
      await fetchUserApplications();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F5EE] min-h-screen">
      <Helmet>
        <title>Careers & Open Positions | Dinesh Yadav & Company</title>
        <meta
          name="description"
          content="Explore high-growth career opportunities in SAP consulting, industrial manufacturing, logistics, and engineering staffing with DY&C."
        />
      </Helmet>

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative bg-gradient-to-b from-[#103728] via-[#174B39] to-[#103728] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#B88A3B]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#1E5C46]/20 blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D7B875] text-xs font-semibold tracking-wide uppercase mb-6">
            <FiStar className="text-sm" />
            <span>DY&C Manpower & Talent Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Build Your Career with India's Leading{' '}
            <span className="text-[#D7B875] underline decoration-[#D7B875]/40 underline-offset-8">
              Staffing & SAP Solutions Partner
            </span>
          </h1>

          <p className="text-[#EAF0E8]/85 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover permanent and contract placements across Fortune 500 enterprises, automotive hubs, and top-tier SAP projects. Transparent process, verified pay, and dedicated career support.
          </p>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl font-bold font-serif text-[#D7B875]">450+</p>
              <p className="text-xs text-[#EAF0E8]/70 mt-0.5">Active Client Placements</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#D7B875]">15+ Yrs</p>
              <p className="text-xs text-[#EAF0E8]/70 mt-0.5">Industry Staffing Legacy</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#D7B875]">100%</p>
              <p className="text-xs text-[#EAF0E8]/70 mt-0.5">Statutory & Labor Compliance</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#D7B875]">24-48 Hrs</p>
              <p className="text-xs text-[#EAF0E8]/70 mt-0.5">Fast-Track Screening</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. SEARCH & FILTER STRIP ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E7E0D3] shadow-lg p-4 sm:p-5">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
          >
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A897C] text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills (e.g. SAP FICO, PLC, CNC, ABAP)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs sm:text-sm text-[#252720] focus:outline-none focus:border-[#174B39] transition"
              />
            </div>

            {/* Employment Type Dropdown */}
            <div className="md:col-span-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs sm:text-sm text-[#252720] focus:outline-none focus:border-[#174B39] transition"
              >
                <option value="All">All Employment Types</option>
                <option value="full-time">Full-Time Permanent</option>
                <option value="contract">Contract Staffing</option>
                <option value="remote">Remote / Telecommute</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-[#174B39] hover:bg-[#103728] text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FiFilter className="text-xs" />
                <span>Filter Jobs</span>
              </button>
            </div>
          </form>

          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-[#E7E0D3]/60 pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#8A897C] uppercase tracking-wider whitespace-nowrap mr-1">
              Verticals:
            </span>
            {departmentsList.map((dept) => {
              const isSelected = selectedDept === dept;
              const count = deptCounts[dept];
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#174B39] text-white shadow-xs'
                      : 'bg-[#F8F5EE] text-[#66665D] hover:bg-[#EAF0E8] hover:text-[#174B39]'
                  }`}
                >
                  {dept}
                  {count !== undefined && (
                    <span
                      className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E7E0D3] text-[#252720]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 3. OPEN POSITIONS LISTING ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
              Available Positions ({jobs.length})
            </h2>
            <p className="text-xs text-[#66665D] mt-0.5">
              Verified corporate requisitions with guaranteed compliance and direct recruiter contact.
            </p>
          </div>

          {/* Candidate Portal Shortcut */}
          <Link
            to="/candidate/portal"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#174B39] hover:text-[#103728] transition bg-white px-3.5 py-2 rounded-xl border border-[#E7E0D3] shadow-xs"
          >
            <FiBriefcase className="text-xs text-[#B88A3B]" />
            <span>My Candidate Portal</span>
            <FiArrowRight className="text-xs" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-[#E7E0D3] space-y-4">
                <div className="h-4 bg-[#E7E0D3] rounded w-1/4" />
                <div className="h-6 bg-[#E7E0D3] rounded w-3/4" />
                <div className="h-12 bg-[#F8F5EE] rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7E0D3] p-12 text-center">
            <FiBriefcase className="w-12 h-12 text-[#8A897C] mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-[#252720]">
              No Openings Found Matching Your Filter
            </h3>
            <p className="text-xs text-[#66665D] max-w-sm mx-auto mt-1 mb-6">
              Try choosing a different department or clearing your search term to see all current job openings.
            </p>
            <button
              onClick={() => {
                setSelectedDept('All');
                setSelectedType('All');
                setSearchQuery('');
              }}
              className="bg-[#174B39] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#103728] transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              // Check user application status for this specific job
              const userApp = myApplications.find(
                (a) =>
                  a.job?._id === job._id ||
                  a.job === job._id ||
                  a.job?.slug === job.slug
              );

              const isAppliedActive = userApp && userApp.status !== 'Rejected';
              const isRejected = userApp && userApp.status === 'Rejected';

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-[#E7E0D3] p-6 shadow-xs hover:shadow-md hover:border-[#174B39]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39] bg-[#EAF0E8] px-2.5 py-0.5 rounded-full border border-[#174B39]/20">
                        {job.department}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-[#66665D] bg-[#F8F5EE] px-2 py-0.5 rounded-md border border-[#E7E0D3]">
                          {job.workplaceType}
                        </span>
                        {job.urgent && (
                          <span className="text-[10px] font-bold text-[#C0392B] bg-[#FDEDEC] px-2 py-0.5 rounded-full border border-[#FADBD8]">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Slug Link */}
                    <Link
                      to={`/careers/${job.slug}`}
                      className="text-lg font-serif font-bold text-[#252720] group-hover:text-[#174B39] transition-colors leading-snug block"
                    >
                      {job.title}
                    </Link>

                    {/* Metadata line: Location, Exp, Compensation */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#66665D] mt-3 mb-4">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="text-[#B88A3B]" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="text-[#B88A3B]" />
                        <span>{job.experience}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#252720]">
                        <FiDollarSign className="text-[#174B39]" />
                        <span>{job.salaryRange}</span>
                      </span>
                    </div>

                    {/* Description snippet */}
                    <p className="text-xs sm:text-sm text-[#66665D] line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    {/* Skills tags */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {job.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium bg-[#F8F5EE] text-[#252720] px-2 py-0.5 rounded-md border border-[#E7E0D3]"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-[11px] text-[#8A897C] self-center">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-[#E7E0D3]/60 flex items-center justify-between gap-3">
                    <Link
                      to={`/careers/${job.slug}`}
                      className="text-xs font-semibold text-[#174B39] hover:underline flex items-center gap-1"
                    >
                      <span>Role Details</span>
                      <FiArrowRight className="text-xs" />
                    </Link>

                    {/* APPLY ACTION BUTTON / STATUS BADGE */}
                    {isAppliedActive ? (
                      /* 1. Already Applied & Active */
                      <Link
                        to="/candidate/portal"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAF0E8] hover:bg-[#174B39] text-[#174B39] hover:text-white border border-[#174B39]/20 text-xs font-bold transition shadow-xs"
                        title={`Already applied (Stage: ${userApp.status}). Click to view candidate portal.`}
                      >
                        <FiCheck className="text-xs" />
                        <span>Applied ({userApp.status})</span>
                      </Link>
                    ) : isRejected ? (
                      /* 2. Previous application was Rejected, job is still open -> Can Re-Apply */
                      <button
                        onClick={() => handleOpenApplyModal(job)}
                        className="bg-[#174B39] hover:bg-[#103728] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        title="Your previous application was not shortlisted. Click to re-apply with an updated resume."
                      >
                        <FiRefreshCw className="text-xs" />
                        <span>Re-Apply Now</span>
                      </button>
                    ) : (
                      /* 3. Not yet applied */
                      <button
                        onClick={() => handleOpenApplyModal(job)}
                        className="bg-[#174B39] hover:bg-[#103728] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Apply Now</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= 4. QUICK APPLICATION MODAL ================= */}
      <AnimatePresence>
        {applyModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252720]/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl border border-[#E7E0D3] shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setApplyModalJob(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-[#8A897C] hover:text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>

              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4 border border-[#174B39]/20 shadow-xs">
                    <FiCheckCircle className="text-2xl" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#252720]">
                    Application Submitted!
                  </h3>
                  <p className="text-sm text-[#66665D] max-w-md mx-auto mt-2 leading-relaxed">
                    Thank you, <strong>{formData.candidateName}</strong>. Your profile for{' '}
                    <strong>{applyModalJob.title}</strong> has been logged into our talent pipeline.
                  </p>

                  <div className="bg-[#F8F5EE] rounded-2xl p-4 my-6 text-left border border-[#E7E0D3] text-xs space-y-1.5 max-w-md mx-auto">
                    <div className="flex justify-between">
                      <span className="text-[#8A897C]">Application Reference:</span>
                      <span className="font-mono font-bold text-[#252720]">
                        {submitSuccess._id || 'LOGGED-OK'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A897C]">Position:</span>
                      <span className="font-semibold text-[#252720]">{applyModalJob.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A897C]">Current Stage:</span>
                      <span className="font-bold text-[#174B39]">Applied / Screening</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/candidate/portal"
                      className="bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      Track on Candidate Portal
                    </Link>
                    <button
                      onClick={() => setApplyModalJob(null)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#66665D] hover:bg-[#F8F5EE] transition cursor-pointer"
                    >
                      Browse More Jobs
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 pr-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88A3B] block mb-1">
                      Direct Application
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
                      Apply for {applyModalJob.title}
                    </h3>
                    <p className="text-xs text-[#66665D] mt-1">
                      {applyModalJob.department} · {applyModalJob.location} · {applyModalJob.type}
                    </p>
                  </div>

                  {submitError && (
                    <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#DC2626] flex items-center gap-2">
                      <FiAlertCircle className="shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.candidateName}
                          onChange={(e) =>
                            setFormData({ ...formData, candidateName: e.target.value })
                          }
                          placeholder="e.g. Devesh Yadav"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.candidateEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, candidateEmail: e.target.value })
                          }
                          placeholder="name@company.com"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                    </div>

                    {/* Phone & Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.candidatePhone}
                          onChange={(e) =>
                            setFormData({ ...formData, candidatePhone: e.target.value })
                          }
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Total Experience
                        </label>
                        <input
                          type="text"
                          value={formData.totalExperience}
                          onChange={(e) =>
                            setFormData({ ...formData, totalExperience: e.target.value })
                          }
                          placeholder="e.g. 5 years"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                    </div>

                    {/* Company & Notice */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Current Company / Employer
                        </label>
                        <input
                          type="text"
                          value={formData.currentCompany}
                          onChange={(e) =>
                            setFormData({ ...formData, currentCompany: e.target.value })
                          }
                          placeholder="e.g. Maruti Suzuki / Freelance"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Notice Period
                        </label>
                        <select
                          value={formData.noticePeriod}
                          onChange={(e) =>
                            setFormData({ ...formData, noticePeriod: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        >
                          <option value="">Select notice period</option>
                          <option value="Immediate">Immediate Joiner (0-7 days)</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>
                    </div>

                    {/* Key Skills */}
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Key Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="e.g. SAP FICO, S/4HANA, GL, Financial Close"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                      />
                    </div>

                    {/* MANDATORY RESUME UPLOAD */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#252720]">
                          Resume / CV Document <span className="text-[#DC2626]">* (Mandatory)</span>
                        </label>
                        {formData.resumeUrl && (
                          <span className="text-[10px] font-bold text-[#174B39]">✓ Attached</span>
                        )}
                      </div>

                      <div
                        className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
                          formData.resumeUrl
                            ? 'border-[#174B39]/50 bg-[#EAF0E8]/40'
                            : 'border-[#E7E0D3] hover:border-[#174B39]/60 bg-[#FDFBF7]'
                        }`}
                      >
                        <input
                          type="file"
                          id="careers-resume-input"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="careers-resume-input"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mb-2">
                            <FiUpload className="text-base" />
                          </div>
                          {formData.resumeFileName ? (
                            <div>
                              <p className="text-xs font-bold text-[#174B39]">
                                Selected: {formData.resumeFileName}
                              </p>
                              <span className="text-[10px] text-[#8A897C] underline mt-0.5 block">
                                Click to replace file
                              </span>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-[#174B39]">
                                {resumeUploading
                                  ? 'Uploading Resume...'
                                  : 'Click to Upload Resume / CV (PDF or DOCX) *'}
                              </p>
                              <span className="text-[10px] text-[#8A897C]">
                                Maximum file size: 10MB · Mandatory for screening
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setApplyModalJob(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-[#66665D] hover:bg-[#F8F5EE] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || resumeUploading}
                        className="bg-[#174B39] hover:bg-[#103728] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <span>Submit Application</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= AUTH REQUIREMENT MODAL (IF NOT LOGGED IN) ================= */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252720]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl border border-[#E7E0D3] shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthModalTargetJob(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full text-[#8A897C] hover:text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>

              <div className="text-center pt-2">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4 border border-[#174B39]/20 shadow-xs">
                  <FiLock className="text-2xl" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88A3B] block mb-1">
                  Candidate Verification
                </span>
                <h3 className="text-xl font-serif font-bold text-[#252720]">
                  Login or Sign Up to Apply
                </h3>
                <p className="text-xs text-[#66665D] mt-2 leading-relaxed">
                  {authModalTargetJob ? (
                    <>
                      To apply for <strong className="text-[#252720]">"{authModalTargetJob.title}"</strong> and track your real-time application pipeline, interview rounds, and recruiter notes, please sign in or create an account.
                    </>
                  ) : (
                    'To apply for open positions and access your real-time recruitment pipeline, interview schedule, and recruiter messages, please log in or create an account.'
                  )}
                </p>

                {/* Direct Action Buttons */}
                <div className="space-y-2.5 mt-6">
                  <Link
                    to={`/login?returnTo=${encodeURIComponent(
                      authModalTargetJob
                        ? `/careers/${authModalTargetJob.slug}`
                        : location.pathname
                    )}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white py-3 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <FiLogIn className="text-sm" />
                    <span>Login to Existing Account</span>
                  </Link>

                  <Link
                    to={`/signup?returnTo=${encodeURIComponent(
                      authModalTargetJob
                        ? `/careers/${authModalTargetJob.slug}`
                        : location.pathname
                    )}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8F5EE] border border-[#E7E0D3] text-[#252720] py-3 rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <FiUserPlus className="text-sm text-[#B88A3B]" />
                    <span>Create Free Candidate Account</span>
                  </Link>
                </div>

                <p className="text-[11px] text-[#8A897C] mt-4">
                  After logging in, you will be brought straight back to your application.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareersPage;
