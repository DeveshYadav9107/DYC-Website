import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
} from 'react-icons/fi';
import { getJobBySlug, submitJobApplication, uploadResume } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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

    fetchJobData();
  }, [slug]);

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

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('Resume size cannot exceed 10MB.');
      return;
    }

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
    if (!formData.candidateName || !formData.candidateEmail || !formData.candidatePhone) {
      setSubmitError('Please complete all mandatory personal contact fields.');
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
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to submit application. Please retry.');
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
      <div className="bg-[#F8F5EE] min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-[#E7E0D3] animate-pulse space-y-6">
          <div className="h-6 bg-[#E7E0D3] rounded w-1/4" />
          <div className="h-10 bg-[#E7E0D3] rounded w-3/4" />
          <div className="h-40 bg-[#F8F5EE] rounded" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-[#F8F5EE] min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#E7E0D3] text-center">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#252720]">Job Position Not Found</h2>
          <p className="text-sm text-[#66665D] mt-2 mb-6">
            The job vacancy you are looking for has either been filled or is no longer accepting submissions.
          </p>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 bg-[#174B39] text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            <FiArrowLeft />
            <span>Back to Careers</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F5EE] min-h-screen pb-20">
      <Helmet>
        <title>{`${job.title} | Careers at DY&C`}</title>
        <meta name="description" content={job.description?.slice(0, 160)} />
      </Helmet>

      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E7E0D3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174B39] hover:underline"
          >
            <FiArrowLeft />
            <span>All Career Opportunities</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E7E0D3] text-xs font-medium text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
          >
            <FiShare2 className="text-xs text-[#B88A3B]" />
            <span>{copied ? 'Link Copied!' : 'Share Role'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= LEFT 2 COLS: JOB DETAILS ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39] bg-[#EAF0E8] px-3 py-1 rounded-full border border-[#174B39]/20">
                  {job.department}
                </span>
                <span className="text-[11px] font-semibold text-[#66665D] bg-[#F8F5EE] px-2.5 py-1 rounded-full capitalize">
                  {job.type}
                </span>
                <span className="text-[11px] font-semibold text-[#B88A3B] bg-[#FDFBF7] px-2.5 py-1 rounded-full border border-[#B88A3B]/30">
                  {job.workplaceType || 'On-site'}
                </span>
                {job.urgent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-[#FEE2E2]">
                    Urgent Requirement
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] leading-snug">
                {job.title}
              </h1>

              {/* Highlights Strip */}
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
              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="text-xl" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#252720]">Application Sent!</h3>
                  <p className="text-xs text-[#66665D] mt-2 leading-relaxed">
                    Your profile has been routed to our recruitment panel.
                  </p>
                  <div className="bg-[#F8F5EE] rounded-xl p-3.5 my-5 text-left border border-[#E7E0D3] text-xs space-y-1">
                    <span className="text-[#8A897C] block text-[10px]">Reference Number:</span>
                    <span className="font-mono font-bold text-[#252720] block">
                      {submitSuccess._id || 'LOGGED-OK'}
                    </span>
                  </div>
                  <Link
                    to="/candidate/portal"
                    className="w-full inline-block bg-[#174B39] text-white py-2.5 rounded-xl text-xs font-bold text-center"
                  >
                    View Status in Candidate Portal
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-5 pb-4 border-b border-[#E7E0D3]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A3B]">
                      Fast-Track Application
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#252720] mt-0.5">
                      Apply for this Position
                    </h3>
                    <p className="text-xs text-[#66665D] mt-0.5">
                      Takes under 60 seconds. Our recruiters contact shortlisted candidates within 24–48 hours.
                    </p>
                  </div>

                  {submitError && (
                    <div className="mb-4 p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#DC2626]">
                      {submitError}
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
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="60 Days">60 Days</option>
                        </select>
                      </div>
                    </div>

                    {/* Resume Attachment */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                        Resume / CV (PDF, DOCX)
                      </label>
                      <div className="border border-dashed border-[#E7E0D3] hover:border-[#174B39] rounded-xl p-3 text-center bg-[#FDFBF7] transition">
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
                            <span className="font-bold text-[#174B39] truncate block">
                              📎 {formData.resumeFileName}
                            </span>
                          ) : (
                            <span className="text-[#66665D] flex items-center justify-center gap-1.5">
                              <FiUpload className="text-xs" />
                              <span>{resumeUploading ? 'Uploading...' : 'Choose Resume File'}</span>
                            </span>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || resumeUploading}
                      className="w-full bg-[#174B39] hover:bg-[#103728] disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer mt-2"
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application Now'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
