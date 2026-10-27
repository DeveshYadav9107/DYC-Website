import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiArrowLeft,
  FiUpload,
  FiAlertCircle,
  FiShare2,
  FiShield,
  FiLock,
  FiLogIn,
  FiUserPlus,
  FiCheck,
  FiX,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  getJobBySlug,
  submitJobApplication,
  uploadResume,
  getMyApplications,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User Applications (to check if already applied or rejected)
  const [myApplications, setMyApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Auth requirement modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getJobBySlug(slug);
      setJob(data);
    } catch (err) {
      setError('The requested job position could not be found or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!isAuthenticated) {
      setMyApplications([]);
      return;
    }
    try {
      setAppsLoading(true);
      const data = await getMyApplications();
      setMyApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch user applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, [slug]);

  useEffect(() => {
    fetchUserApplications();
  }, [isAuthenticated]);

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

  // Find if user already has an application for this specific job
  const existingApp = myApplications.find(
    (app) =>
      app.job?._id === job?._id ||
      app.job === job?._id ||
      app.job?.slug === slug
  );

  const isAppliedActive = existingApp && existingApp.status !== 'Rejected';
  const isRejected = existingApp && existingApp.status === 'Rejected';

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
      setFormData((prev) => ({
        ...prev,
        resumeUrl: `/uploads/resumes/${file.name}`,
        resumeFileName: file.name,
      }));
    } finally {
      setResumeUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Enforce Authentication Requirement
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // 2. Enforce Mandatory Contact Details
    if (!formData.candidateName || !formData.candidateEmail || !formData.candidatePhone) {
      setSubmitError('Please complete all mandatory personal contact fields.');
      return;
    }

    // 3. Enforce Mandatory Resume Upload
    if (!formData.resumeUrl || !formData.resumeUrl.trim()) {
      setSubmitError(
        'Resume upload is mandatory. Please attach your CV / Resume document (PDF or DOCX) before submitting.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      const res = await submitJobApplication({
        jobId: job._id,
        ...formData,
      });

      setSubmitSuccess(res?.data || res);
      // Refresh user applications so status updates immediately
      await fetchUserApplications();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || 'Failed to submit application. Please retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-[#E7E0D3] rounded" />
          <div className="h-48 bg-white rounded-3xl border border-[#E7E0D3]" />
          <div className="h-64 bg-white rounded-3xl border border-[#E7E0D3]" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] py-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-[#E7E0D3] shadow-sm">
          <FiAlertCircle className="w-12 h-12 text-[#B88A3B] mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold text-[#252720]">Position Not Found</h2>
          <p className="text-xs text-[#66665D] mt-2 mb-6">
            {error || 'This job opening is no longer available or has been unlisted.'}
          </p>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 bg-[#174B39] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#103728] transition"
          >
            <FiArrowLeft />
            <span>Browse All Open Roles</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F5EE] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`${job.title} | Careers at Dinesh Yadav & Company`}</title>
        <meta
          name="description"
          content={`Apply for ${job.title} in ${job.location} with Dinesh Yadav & Company. ${job.experience} experience required.`}
        />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#174B39] hover:underline"
          >
            <FiArrowLeft />
            <span>Back to All Openings</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E7E0D3] bg-white text-xs font-semibold text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
          >
            <FiShare2 className="text-xs text-[#B88A3B]" />
            <span>{copied ? 'Link Copied!' : 'Share Opening'}</span>
          </button>
        </div>

        {/* 2-Column Grid: Details Left, Application Form / Status Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ================= LEFT 2 COLS: ROLE SPECIFICATION ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39] bg-[#EAF0E8] px-3 py-1 rounded-full border border-[#174B39]/20">
                  {job.department}
                </span>
                <span className="text-[11px] font-medium text-[#66665D] bg-[#F8F5EE] px-3 py-1 rounded-full border border-[#E7E0D3]">
                  {job.workplaceType}
                </span>
                <span className="text-[11px] font-medium text-[#66665D] bg-[#F8F5EE] px-3 py-1 rounded-full border border-[#E7E0D3] capitalize">
                  {job.type}
                </span>
                {job.urgent && (
                  <span className="text-[11px] font-bold text-[#C0392B] bg-[#FDEDEC] px-3 py-1 rounded-full border border-[#FADBD8]">
                    Urgent Opening
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] leading-tight">
                {job.title}
              </h1>

              {/* Quick Meta Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E7E0D3]/60 text-xs text-[#66665D]">
                <div>
                  <span className="text-[#8A897C] block text-[10px] uppercase font-bold tracking-wider">
                    Location
                  </span>
                  <span className="font-semibold text-[#252720] mt-0.5 flex items-center gap-1">
                    <FiMapPin className="text-[#B88A3B]" />
                    {job.location}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A897C] block text-[10px] uppercase font-bold tracking-wider">
                    Experience
                  </span>
                  <span className="font-semibold text-[#252720] mt-0.5 flex items-center gap-1">
                    <FiClock className="text-[#B88A3B]" />
                    {job.experience}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A897C] block text-[10px] uppercase font-bold tracking-wider">
                    Openings
                  </span>
                  <span className="font-semibold text-[#252720] mt-0.5 flex items-center gap-1">
                    <FiUsers className="text-[#B88A3B]" />
                    {job.openings} Position{job.openings > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A897C] block text-[10px] uppercase font-bold tracking-wider">
                    Salary Range
                  </span>
                  <span className="font-semibold text-[#174B39] mt-0.5 flex items-center gap-1">
                    <FiDollarSign />
                    {job.salaryRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Overview */}
            <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-serif font-bold text-[#252720] mb-3">
                Position Overview
              </h2>
              <p className="text-sm text-[#252720]/85 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              {/* Required Skills Checklist */}
              {job.skills?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#E7E0D3]/60">
                  <h3 className="text-xs font-bold text-[#8A897C] uppercase tracking-wider mb-3">
                    Desired Technical Competencies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 px-3 py-1 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-serif font-bold text-[#252720] mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#252720]/85">
                      <FiCheckCircle className="text-[#174B39] mt-0.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {job.requirements?.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-serif font-bold text-[#252720] mb-4">
                  Qualifications & Requirements
                </h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#252720]/85">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B88A3B] mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits & Perks */}
            {job.benefits?.length > 0 && (
              <div className="bg-[#EAF0E8]/60 rounded-3xl border border-[#174B39]/20 p-6 sm:p-8">
                <h2 className="text-lg font-serif font-bold text-[#174B39] mb-4 flex items-center gap-2">
                  <FiShield className="text-[#174B39]" />
                  <span>Benefits & Employee Perks</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-3 border border-[#E7E0D3] text-xs font-semibold text-[#252720] flex items-center gap-2"
                    >
                      <span className="text-[#174B39]">✔</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT 1 COL: INLINE APPLICATION CARD ================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-[#E7E0D3] p-6 shadow-sm">
              {/* CASE 1: SUBMISSION JUST SUCCEEDED */}
              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="text-xl" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#252720]">Application Sent!</h3>
                  <p className="text-xs text-[#66665D] mt-2 leading-relaxed">
                    Your profile and resume have been queued with the DY&C talent acquisition panel.
                  </p>
                  <div className="bg-[#F8F5EE] rounded-xl p-3.5 my-5 text-left border border-[#E7E0D3] text-xs space-y-1">
                    <span className="text-[#8A897C] block text-[10px]">Reference Number:</span>
                    <span className="font-mono font-bold text-[#252720] block">
                      {submitSuccess._id || 'SUBMITTED'}
                    </span>
                  </div>
                  <Link
                    to="/candidate/portal"
                    className="w-full inline-block bg-[#174B39] hover:bg-[#103728] text-white py-2.5 rounded-xl text-xs font-bold text-center shadow-xs transition"
                  >
                    Track in Candidate Portal
                  </Link>
                </div>
              ) : isAppliedActive ? (
                /* CASE 2: CANDIDATE HAS ALREADY APPLIED (ACTIVE APPLICATION) */
                <div className="py-2 space-y-5">
                  <div className="text-center pb-4 border-b border-[#E7E0D3]/60">
                    <div className="w-12 h-12 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-3 ring-4 ring-[#174B39]/10">
                      <FiCheck className="text-xl font-bold" />
                    </div>
                    <span className="inline-block bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-2">
                      ✓ Already Applied
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#252720]">
                      Application Under Review
                    </h3>
                    <p className="text-xs text-[#66665D] mt-1.5 leading-relaxed">
                      You have already submitted an active application for this opening. To maintain candidate integrity, duplicate submissions are locked.
                    </p>
                  </div>

                  {/* Application Details Summary */}
                  <div className="bg-[#F8F5EE] rounded-2xl p-4 border border-[#E7E0D3] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A897C]">Current Stage:</span>
                      <span className="font-bold text-[#174B39] bg-white px-2.5 py-0.5 rounded-full border border-[#174B39]/20">
                        {existingApp.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A897C]">Applied On:</span>
                      <span className="font-semibold text-[#252720]">
                        {new Date(existingApp.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {existingApp.resumeFileName && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#8A897C]">Submitted CV:</span>
                        <span className="font-semibold text-[#252720] truncate max-w-[130px]">
                          {existingApp.resumeFileName}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/candidate/portal"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white py-3 rounded-xl text-xs font-bold text-center shadow-md transition"
                  >
                    <span>View in Candidate Portal</span>
                    <FiArrowRight />
                  </Link>
                </div>
              ) : (
                /* CASE 3: NOT YET APPLIED OR PREVIOUS APPLICATION WAS REJECTED (CAN RE-APPLY) */
                <>
                  <div className="mb-5 pb-4 border-b border-[#E7E0D3]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A3B]">
                      {isRejected ? 'Re-Application' : 'Fast-Track Application'}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#252720] mt-0.5">
                      {isRejected ? 'Re-Apply for this Position' : 'Apply for this Position'}
                    </h3>
                    <p className="text-xs text-[#66665D] mt-0.5">
                      {isRejected
                        ? 'Your previous profile was not shortlisted. The job is still open, so you may submit an updated resume.'
                        : 'Takes under 60 seconds. Our recruiters contact shortlisted candidates within 24–48 hours.'}
                    </p>
                  </div>

                  {/* Rejection notice banner if re-applying */}
                  {isRejected && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#FEF9E7] border border-[#FAD7A0] text-xs text-[#B7950B] leading-relaxed flex items-start gap-2">
                      <FiRefreshCw className="text-sm shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[#9A7D0A]">Re-application Active</span>
                        <span>
                          Submit your updated experience and CV for fresh review by the DY&C talent desk.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Unauthenticated Warning Strip */}
                  {!isAuthenticated && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#EAF0E8] border border-[#174B39]/20 text-xs text-[#174B39] flex items-start gap-2.5">
                      <FiLock className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Account Required to Submit</span>
                        <span className="text-[11px] text-[#252720]/80">
                          Please sign in or create a candidate account so you can track your application pipeline.
                        </span>
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#DC2626] flex items-start gap-2">
                      <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.candidateName}
                        onChange={(e) =>
                          setFormData({ ...formData, candidateName: e.target.value })
                        }
                        placeholder="Your full name"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.candidateEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, candidateEmail: e.target.value })
                        }
                        placeholder="name@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                        Mobile Phone *
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

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                          Experience
                        </label>
                        <input
                          type="text"
                          value={formData.totalExperience}
                          onChange={(e) =>
                            setFormData({ ...formData, totalExperience: e.target.value })
                          }
                          placeholder="e.g. 4 yrs"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                          Notice Period
                        </label>
                        <select
                          value={formData.noticePeriod}
                          onChange={(e) =>
                            setFormData({ ...formData, noticePeriod: e.target.value })
                          }
                          className="w-full px-2 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                        >
                          <option value="">Select notice</option>
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>
                    </div>

                    {/* MANDATORY RESUME ATTACHMENT */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-[#252720]">
                          Resume / CV Document <span className="text-[#DC2626]">* (Mandatory)</span>
                        </label>
                        {formData.resumeUrl && (
                          <span className="text-[10px] font-bold text-[#174B39]">✓ Attached</span>
                        )}
                      </div>
                      <div
                        className={`border-2 border-dashed rounded-xl p-3.5 text-center transition ${
                          formData.resumeUrl
                            ? 'border-[#174B39]/50 bg-[#EAF0E8]/40'
                            : 'border-[#E7E0D3] hover:border-[#174B39] bg-[#FDFBF7]'
                        }`}
                      >
                        <input
                          type="file"
                          id="sidebar-resume-file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="sidebar-resume-file"
                          className="cursor-pointer block text-xs"
                        >
                          {formData.resumeFileName ? (
                            <div className="space-y-1">
                              <span className="font-bold text-[#174B39] truncate block">
                                📎 {formData.resumeFileName}
                              </span>
                              <span className="text-[10px] text-[#66665D] underline block">
                                Click to choose different file
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#66665D] flex items-center justify-center gap-1.5 py-1">
                              <FiUpload className="text-sm text-[#174B39]" />
                              <span className="font-semibold text-[#174B39]">
                                {resumeUploading ? 'Uploading...' : 'Upload Resume File *'}
                              </span>
                            </span>
                          )}
                        </label>
                      </div>
                      <span className="text-[10px] text-[#8A897C] mt-1 block">
                        PDF or DOCX format (Max 10MB). Mandatory for screening.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                        Brief Candidate Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.coverLetter}
                        onChange={(e) =>
                          setFormData({ ...formData, coverLetter: e.target.value })
                        }
                        placeholder="Highlight your relevant project expertise..."
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || resumeUploading}
                      className="w-full bg-[#174B39] hover:bg-[#103728] active:scale-[0.99] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : !isAuthenticated ? (
                        <>
                          <FiLock className="text-xs" />
                          <span>Sign In & Apply for Job</span>
                        </>
                      ) : isRejected ? (
                        <>
                          <FiRefreshCw className="text-xs" />
                          <span>Submit Re-Application</span>
                        </>
                      ) : (
                        <span>Submit Application</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
                onClick={() => setShowAuthModal(false)}
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
                  To apply for <strong className="text-[#252720]">"{job.title}"</strong> and track your real-time application pipeline, interview rounds, and recruiter notes, please sign in or create an account.
                </p>

                {/* Direct Action Buttons */}
                <div className="space-y-2.5 mt-6">
                  <Link
                    to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white py-3 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <FiLogIn className="text-sm" />
                    <span>Login to Existing Account</span>
                  </Link>

                  <Link
                    to={`/signup?returnTo=${encodeURIComponent(location.pathname)}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8F5EE] border border-[#E7E0D3] text-[#252720] py-3 rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <FiUserPlus className="text-sm text-[#B88A3B]" />
                    <span>Create Free Candidate Account</span>
                  </Link>
                </div>

                <p className="text-[11px] text-[#8A897C] mt-4">
                  After logging in, you will be brought straight back to this position.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobDetailsPage;
