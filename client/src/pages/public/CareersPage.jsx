import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'react-icons/fi';
import { getJobs, submitJobApplication, uploadResume } from '../../services/api';
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
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [deptCounts, setDeptCounts] = useState({});

  // Application Modal state
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    candidateName: user?.name || '',
    candidateEmail: user?.email || '',
    candidatePhone: user?.phone || '',
    currentCompany: user?.company || '',
    currentDesignation: user?.designation || '',
    totalExperience: user?.totalExperience || '3 years',
    currentSalary: user?.currentSalary || '',
    expectedSalary: user?.expectedSalary || '',
    noticePeriod: user?.noticePeriod || '30 Days',
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

  useEffect(() => {
    fetchJobs();
  }, [selectedDept, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleOpenApplyModal = (job) => {
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

    setResumeFile(file);
    try {
      setResumeUploading(true);
      const uploadRes = await uploadResume(file);
      if (uploadRes?.url) {
        setFormData((prev) => ({
          ...prev,
          resumeUrl: uploadRes.url,
          resumeFileName: uploadRes.fileName || file.name,
        }));
        setSubmitError('');
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
    if (!formData.candidateName || !formData.candidateEmail || !formData.candidatePhone) {
      setSubmitError('Please fill in your name, email, and mobile number.');
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
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit application. Please try again.');
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
              <p className="text-2xl font-bold font-serif text-[#D7B875]">48 Hrs</p>
              <p className="text-xs text-[#EAF0E8]/70 mt-0.5">Screening Turnaround</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-serif text-[#D7B875]">100%</p>
              <p className="text-xs text-[#EAF0E8]/70 mt-0.5">PF & ESIC Compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. SEARCH & FILTER STRIP ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-[#FFFFFF] rounded-2xl shadow-[0_8px_30px_rgba(23,75,57,0.08)] border border-[#E7E0D3] p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative flex items-center">
              <FiSearch className="absolute left-3.5 text-[#8A897C] text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills (e.g. SAP FICO, CNC, Logistics)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-sm text-[#252720] placeholder-[#8A897C] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
              />
            </div>

            {/* Employment Type */}
            <div className="w-full md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-sm text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
              >
                <option value="All">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="contract">Contract Staffing</option>
                <option value="part-time">Part Time</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-[#174B39] hover:bg-[#103728] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiSearch className="text-sm" />
              <span>Search Roles</span>
            </button>
          </form>

          {/* Department Pills */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E7E0D3]/60 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-[#8A897C] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <FiFilter className="text-xs" /> Dept:
            </span>
            {departmentsList.map((dept) => {
              const count = dept === 'All' ? jobs.length : deptCounts[dept] || 0;
              const isSelected = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#174B39] text-white shadow-xs font-bold'
                      : 'bg-[#F8F5EE] text-[#66665D] hover:bg-[#EAF0E8] hover:text-[#174B39]'
                  }`}
                >
                  {dept}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#E7E0D3] text-[#252720]'
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

      {/* ================= 3. CANDIDATE PORTAL TEASER BANNER ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-[#EAF0E8] border border-[#174B39]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#174B39] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FiBriefcase className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#174B39] font-serif">
                Already Applied for a Role with DY&C?
              </h3>
              <p className="text-xs text-[#252720]/80 mt-0.5">
                Check your screening status, interview schedule, and recruiter feedback on your dedicated Candidate Portal.
              </p>
            </div>
          </div>
          <Link
            to={isAuthenticated ? '/candidate/portal' : '/login'}
            className="shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-[#FDFBF7] text-[#174B39] border border-[#174B39]/30 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <span>{isAuthenticated ? 'Open Candidate Portal' : 'Login to Track Application'}</span>
            <FiArrowRight className="text-xs" />
          </Link>
        </div>
      </section>

      {/* ================= 4. JOB LISTINGS GRID ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
              Open Job Positions
            </h2>
            <p className="text-xs sm:text-sm text-[#66665D] mt-0.5">
              Showing {jobs.length} active opportunities available for immediate consideration
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#E7E0D3] animate-pulse space-y-4"
              >
                <div className="h-5 bg-[#E7E0D3] rounded w-2/3" />
                <div className="h-4 bg-[#E7E0D3] rounded w-1/3" />
                <div className="h-16 bg-[#F8F5EE] rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7E0D3] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4 border border-[#174B39]/20 shadow-xs">
              <FiBriefcase className="text-2xl" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#252720]">
              {searchQuery || selectedDept !== 'All' || selectedType !== 'All'
                ? 'No matching jobs found'
                : 'No Open Positions at the Moment'}
            </h3>
            <p className="text-xs sm:text-sm text-[#66665D] mt-2 mb-6 leading-relaxed">
              {searchQuery || selectedDept !== 'All' || selectedType !== 'All'
                ? 'Try adjusting your search criteria or resetting filters to see other openings.'
                : 'Our recruitment desk regularly publishes verified enterprise openings. Please check back soon or track your existing applications on the Candidate Portal.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {(searchQuery || selectedDept !== 'All' || selectedType !== 'All') && (
                <button
                  onClick={() => {
                    setSelectedDept('All');
                    setSelectedType('All');
                    setSearchQuery('');
                  }}
                  className="bg-[#F8F5EE] hover:bg-[#EAF0E8] text-[#174B39] px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Reset all filters
                </button>
              )}

              {user && (user.role === 'admin' || user.role === 'editor') && (
                <Link
                  to="/admin/jobs"
                  className="inline-flex items-center gap-1.5 bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <span>+ Post Job via Admin Console</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-xs hover:shadow-[0_8px_24px_rgba(23,75,57,0.08)] hover:border-[#174B39]/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top tags row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39] bg-[#EAF0E8] px-2.5 py-1 rounded-full border border-[#174B39]/15">
                      {job.department}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {job.urgent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FEE2E2]">
                          Urgent Hiring
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-[#66665D] bg-[#F8F5EE] px-2 py-0.5 rounded-full capitalize">
                        {job.type}
                      </span>
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

                  <button
                    onClick={() => handleOpenApplyModal(job)}
                    className="bg-[#174B39] hover:bg-[#103728] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ================= 5. QUICK APPLICATION MODAL ================= */}
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
                          placeholder="e.g. Rahul Sharma"
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
                          placeholder="rahul@example.com"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                    </div>

                    {/* Phone & Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Mobile Number *
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
                          placeholder="e.g. 4.5 years"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                    </div>

                    {/* Current Company & Notice Period */}
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

                    {/* Resume Upload Box */}
                    <div className="border-2 border-dashed border-[#E7E0D3] hover:border-[#174B39]/60 rounded-2xl p-4 text-center bg-[#FDFBF7] transition">
                      <input
                        type="file"
                        id="resume-file-input"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume-file-input"
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
                            <span className="text-[10px] text-[#8A897C]">Click to replace file</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-[#252720]">
                              {resumeUploading ? 'Uploading Resume...' : 'Upload Resume / CV (PDF, DOCX)'}
                            </p>
                            <span className="text-[10px] text-[#8A897C]">
                              Maximum file size: 10MB
                            </span>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Pitch / Cover Note */}
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Brief Cover Note / Pitch (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        placeholder="Highlight your domain strengths or shift preferences..."
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                      />
                    </div>

                    {/* Submit Button */}
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
                        className="bg-[#174B39] hover:bg-[#103728] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {isSubmitting ? 'Submitting...' : 'Send Application'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareersPage;
