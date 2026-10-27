import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiClock,
  FiCalendar,
  FiVideo,
  FiMapPin,
  FiFileText,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiDownload,
  FiRefreshCw,
  FiUpload,
  FiArrowRight,
  FiLayers,
  FiCamera,
  FiTrash2,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiMail,
  FiPhone,
  FiSettings,
} from 'react-icons/fi';
import { getMyApplications, uploadResume, updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STAGES = ['Applied', 'Screening', 'Interview', 'Selected'];

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-[#EBF5FB] text-[#2980B9] border-[#D4E6F1]';
    case 'Screening':
      return 'bg-[#F4ECF7] text-[#8E44AD] border-[#E8DAEF]';
    case 'Interview':
      return 'bg-[#FEF9E7] text-[#B7950B] border-[#FAD7A0]';
    case 'Selected':
    case 'Placed':
      return 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/20';
    case 'Rejected':
      return 'bg-[#FDEDEC] text-[#C0392B] border-[#FADBD8]';
    default:
      return 'bg-[#F8F5EE] text-[#66665D] border-[#E7E0D3]';
  }
};

/**
 * Compresses an image file on an HTML5 canvas and converts it to a base64 Data URL.
 * Stored directly in MongoDB Atlas so it works reliably on Render, Vercel, and localhost.
 */
const compressImageToBase64 = (file, maxWidth = 360, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const CandidatePortalPage = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'interviews', 'profile'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Edit & Settings State
  const photoInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    designation: user?.designation || '',
    company: user?.company || '',
    totalExperience: user?.totalExperience || '',
    skills: user?.skills ? user.skills.join(', ') : '',
    noticePeriod: user?.noticePeriod || '',
    location: user?.location || '',
    bio: user?.bio || '',
    resumeUrl: user?.resumeUrl || '',
    resumeFileName: user?.resumeFileName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load your applications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        designation: user.designation || '',
        company: user.company || '',
        totalExperience: user.totalExperience || '',
        skills: user.skills ? user.skills.join(', ') : '',
        noticePeriod: user.noticePeriod || '',
        location: user.location || '',
        bio: user.bio || '',
        resumeUrl: user.resumeUrl || '',
        resumeFileName: user.resumeFileName || '',
      }));
    }
  }, [user]);

  // Extract all scheduled interviews across all candidate applications
  const scheduledInterviews = applications
    .flatMap((app) =>
      (app.interviews || []).map((round) => ({
        ...round,
        jobTitle: app.job?.title || 'Staffing Opportunity',
        applicationId: app._id,
      }))
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Profile Photo Upload (Instagram / WhatsApp style, directly into MongoDB Atlas)
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setProfileError('Image file is too large. Please select a photo under 8MB.');
      return;
    }

    try {
      setPhotoUploading(true);
      setProfileError('');
      const base64Image = await compressImageToBase64(file, 360, 0.85);

      setProfileForm((prev) => ({ ...prev, avatar: base64Image }));

      // Immediately persist photo directly to MongoDB Atlas
      await updateProfile({ avatar: base64Image });
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }

      setProfileSuccess('Profile photo updated and saved to database successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to compress/save photo:', err);
      setProfileError('Could not process this image. Please try another one.');
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setPhotoUploading(true);
      setProfileError('');
      setProfileForm((prev) => ({ ...prev, avatar: '' }));

      await updateProfile({ avatar: '' });
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }

      setProfileSuccess('Profile photo removed.');
      setTimeout(() => setProfileSuccess(''), 2500);
    } catch (err) {
      setProfileError('Failed to remove photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setResumeUploading(true);
      const res = await uploadResume(file);
      if (res?.url) {
        setProfileForm((prev) => ({
          ...prev,
          resumeUrl: res.url,
          resumeFileName: res.fileName || file.name,
        }));
        setProfileSuccess('Resume uploaded! Click Save below to apply.');
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      console.warn('Fallback resume filename:', err);
      setProfileForm((prev) => ({
        ...prev,
        resumeUrl: `/uploads/resumes/${file.name}`,
        resumeFileName: file.name,
      }));
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    try {
      setProfileSaving(true);
      setProfileSuccess('');
      setProfileError('');

      if (profileForm.newPassword) {
        if (!profileForm.currentPassword) {
          setProfileError('Please provide your current password to set a new password.');
          setProfileSaving(false);
          return;
        }
        if (profileForm.newPassword.length < 6) {
          setProfileError('New password must be at least 6 characters.');
          setProfileSaving(false);
          return;
        }
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setProfileError('New password and confirm password do not match.');
          setProfileSaving(false);
          return;
        }
      }

      const parsedSkills = profileForm.skills
        ? profileForm.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        designation: profileForm.designation,
        company: profileForm.company,
        totalExperience: profileForm.totalExperience,
        skills: parsedSkills,
        noticePeriod: profileForm.noticePeriod,
        location: profileForm.location,
        resumeUrl: profileForm.resumeUrl,
        resumeFileName: profileForm.resumeFileName,
        currentPassword: profileForm.currentPassword || undefined,
        newPassword: profileForm.newPassword || undefined,
      });

      if (typeof refreshUser === 'function') {
        await refreshUser();
      }

      setProfileForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setProfileSuccess('Profile & career settings saved successfully to database!');
      setTimeout(() => {
        setProfileSuccess('');
      }, 3500);
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setProfileSaving(false);
    }
  };

  const userInitials = profileForm.name
    ? profileForm.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DY';

  return (
    <div className="bg-[#F8F5EE] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Candidate Portal | Dinesh Yadav & Company</title>
        <meta
          name="description"
          content="Track your DY&C job applications, scheduled interview rounds, recruiter notes, and update your resume profile."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* ================= 1. CANDIDATE PROFILE HEADER ================= */}
        <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#174B39] to-[#B88A3B] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-sm shrink-0 overflow-hidden">
                {user?.avatar || profileForm.avatar ? (
                  <img
                    src={user?.avatar || profileForm.avatar}
                    alt={user?.name || 'Candidate'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'C'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
                    {user?.name || 'Candidate Profile'}
                  </h1>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#174B39] bg-[#EAF0E8] px-2.5 py-0.5 rounded-full border border-[#174B39]/20">
                    Candidate
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#66665D] mt-0.5">
                  {user?.designation || profileForm.designation || 'Open to Opportunities'}
                  {user?.company || profileForm.company
                    ? ` · ${user?.company || profileForm.company}`
                    : ''}
                  {user?.totalExperience || profileForm.totalExperience
                    ? ` · ${user?.totalExperience || profileForm.totalExperience} Exp`
                    : ''}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A897C] mt-2">
                  <span>✉ {user?.email}</span>
                  {(user?.phone || profileForm.phone) && (
                    <span>📞 {user?.phone || profileForm.phone}</span>
                  )}
                  {(user?.location || profileForm.location) && (
                    <span>📍 {user?.location || profileForm.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#174B39] text-white border-[#174B39]'
                    : 'border-[#E7E0D3] text-[#252720] hover:bg-[#F8F5EE]'
                }`}
              >
                <FiSettings className="text-xs text-[#B88A3B]" />
                <span>Profile Settings</span>
              </button>

              <Link
                to="/careers"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-[#174B39] hover:bg-[#103728] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
              >
                <FiBriefcase className="text-xs" />
                <span>Browse New Jobs</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E7E0D3]/60">
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#8A897C] tracking-wider block">
                Total Applied
              </span>
              <span className="text-xl font-bold font-serif text-[#252720]">
                {applications.length}
              </span>
            </div>
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#8A897C] tracking-wider block">
                Under Review
              </span>
              <span className="text-xl font-bold font-serif text-[#8E44AD]">
                {applications.filter((a) => a.status === 'Screening').length}
              </span>
            </div>
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#8A897C] tracking-wider block">
                Interviews
              </span>
              <span className="text-xl font-bold font-serif text-[#B7950B]">
                {scheduledInterviews.length}
              </span>
            </div>
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#8A897C] tracking-wider block">
                Selected / Offers
              </span>
              <span className="text-xl font-bold font-serif text-[#174B39]">
                {
                  applications.filter(
                    (a) => a.status === 'Selected' || a.status === 'Placed'
                  ).length
                }
              </span>
            </div>
          </div>
        </div>

        {/* ================= 2. NAVIGATION TABS ================= */}
        <div className="flex items-center gap-3 border-b border-[#E7E0D3] pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'applications'
                ? 'text-[#174B39] border-b-2 border-[#174B39]'
                : 'text-[#66665D] hover:text-[#252720]'
            }`}
          >
            <span>My Applications</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAF0E8] text-[#174B39] font-bold">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'interviews'
                ? 'text-[#174B39] border-b-2 border-[#174B39]'
                : 'text-[#66665D] hover:text-[#252720]'
            }`}
          >
            <span>Scheduled Interviews</span>
            {scheduledInterviews.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#FEF9E7] text-[#B7950B] font-bold border border-[#FAD7A0]">
                {scheduledInterviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'text-[#174B39] border-b-2 border-[#174B39]'
                : 'text-[#66665D] hover:text-[#252720]'
            }`}
          >
            <FiSettings className="inline mr-1.5 text-xs text-[#B88A3B]" />
            <span>Profile & Account Settings</span>
          </button>
        </div>

        {/* ================= 3. TAB 1: APPLICATIONS LIST & TIMELINE ================= */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-3xl p-8 border border-[#E7E0D3] animate-pulse space-y-4">
                <div className="h-5 bg-[#E7E0D3] rounded w-1/3" />
                <div className="h-20 bg-[#F8F5EE] rounded" />
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4">
                  <FiBriefcase className="text-2xl" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#252720]">No Applications Yet</h3>
                <p className="text-xs sm:text-sm text-[#66665D] max-w-md mx-auto mt-2 mb-6">
                  You haven't submitted any job applications yet. Explore our open positions across SAP consulting, manufacturing, and engineering.
                </p>
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-2 bg-[#174B39] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#103728] transition"
                >
                  <span>Explore Open Jobs</span>
                  <FiArrowRight />
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const currentStageIndex =
                  app.status === 'Rejected'
                    ? 1
                    : STAGES.indexOf(app.status) >= 0
                    ? STAGES.indexOf(app.status)
                    : 0;

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7E0D3]/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#8A897C] uppercase tracking-wider">
                            Ref: {app._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-[#252720] mt-1">
                          {app.job?.title || 'Open Staffing Position'}
                        </h2>
                        <p className="text-xs text-[#66665D] mt-0.5">
                          {app.job?.department} · {app.job?.location} · Applied on{' '}
                          {new Date(app.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Resume Download / Link */}
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E0D3] text-xs font-semibold text-[#174B39] hover:bg-[#F8F5EE] transition"
                        >
                          <FiDownload className="text-xs" />
                          <span>{app.resumeFileName || 'View Submitted CV'}</span>
                        </a>
                      )}
                    </div>

                    {/* Visual Stage Tracker (Stepper) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-3">
                        Application Progress Pipeline
                      </span>
                      <div className="grid grid-cols-4 gap-2 relative">
                        {STAGES.map((stage, idx) => {
                          const isDone = currentStageIndex >= idx;
                          const isCurrent = app.status === stage;
                          const isRejected = app.status === 'Rejected' && idx === currentStageIndex;

                          return (
                            <div key={stage} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs mb-1.5 ${
                                  isRejected
                                    ? 'bg-[#FDEDEC] text-[#C0392B] border-2 border-[#C0392B]'
                                    : isCurrent
                                    ? 'bg-[#174B39] text-white ring-4 ring-[#174B39]/20'
                                    : isDone
                                    ? 'bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/30'
                                    : 'bg-[#F8F5EE] text-[#8A897C] border border-[#E7E0D3]'
                                }`}
                              >
                                {isDone && !isCurrent ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] font-semibold ${
                                  isCurrent
                                    ? 'text-[#174B39] font-bold'
                                    : isDone
                                    ? 'text-[#252720]'
                                    : 'text-[#8A897C]'
                                }`}
                              >
                                {stage}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recruiter Status Notification Banner / Rejection Status */}
                    {app.status === 'Rejected' ? (
                      <div className="bg-[#FDEDEC] border border-[#FADBD8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <FiAlertCircle className="text-[#C0392B] mt-0.5 text-base shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-[#C0392B]">
                              Application Status: Rejected / Not Shortlisted
                            </p>
                            <p className="text-xs text-[#252720]/85 mt-0.5 leading-relaxed">
                              {app.statusNotification?.message ||
                                'Thank you for applying. Your profile was not shortlisted for this specific opening.'}
                            </p>
                            <span className="text-[10px] text-[#8A897C] block mt-1">
                              Updated {new Date(app.statusNotification?.updatedAt || app.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Re-apply action if job is still active & published */}
                        {app.job?.status === 'published' && app.job?.isActive ? (
                          <Link
                            to={`/careers/${app.job.slug}`}
                            className="inline-flex items-center gap-1.5 bg-[#174B39] hover:bg-[#103728] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition shrink-0 self-end sm:self-center"
                          >
                            <FiRefreshCw className="text-xs" />
                            <span>Re-Apply for Job</span>
                          </Link>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#8A897C] bg-white px-3 py-1 rounded-lg border border-[#E7E0D3] shrink-0 self-end sm:self-center">
                            Position Closed
                          </span>
                        )}
                      </div>
                    ) : app.statusNotification?.message ? (
                      <div className="bg-[#EAF0E8]/70 border border-[#174B39]/20 rounded-2xl p-4 flex items-start gap-3">
                        <FiAlertCircle className="text-[#174B39] mt-0.5 text-base shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#174B39]">
                            Recruiter Communication Update
                          </p>
                          <p className="text-xs text-[#252720]/85 mt-0.5 leading-relaxed">
                            {app.statusNotification.message}
                          </p>
                          <span className="text-[10px] text-[#8A897C] block mt-1">
                            Updated {new Date(app.statusNotification.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Interview Rounds Scheduled for this job */}
                    {app.interviews?.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A897C] mb-3">
                          Interview Rounds ({app.interviews.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {app.interviews.map((round, rIdx) => (
                            <div
                              key={rIdx}
                              className="bg-[#FDFBF7] border border-[#E7E0D3] rounded-2xl p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#252720]">
                                  {round.roundName}
                                </span>
                                <span className="text-[10px] font-bold text-[#B7950B] bg-[#FEF9E7] px-2 py-0.5 rounded-full border border-[#FAD7A0]">
                                  {round.status}
                                </span>
                              </div>
                              <div className="text-xs text-[#66665D] space-y-1">
                                <p className="flex items-center gap-1.5">
                                  <FiCalendar className="text-[#B88A3B]" />
                                  <span>
                                    {new Date(round.scheduledDate).toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                    })}{' '}
                                    at {round.time}
                                  </span>
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <FiVideo className="text-[#B88A3B]" />
                                  <span>{round.meetingType}</span>
                                </p>
                              </div>
                              {round.meetingLink && (
                                <a
                                  href={round.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174B39] hover:underline pt-1"
                                >
                                  <span>Join Video Call</span>
                                  <FiExternalLink className="text-xs" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= 4. TAB 2: SCHEDULED INTERVIEWS VIEW ================= */}
        {activeTab === 'interviews' && (
          <div className="space-y-4">
            {scheduledInterviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="text-2xl" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#252720]">
                  No Interviews Scheduled Yet
                </h3>
                <p className="text-xs sm:text-sm text-[#66665D] max-w-md mx-auto mt-2">
                  When a recruitment lead shortlists your profile, your interview round details and video call links will appear right here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledInterviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-[#E7E0D3] p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A3B] bg-[#FDFBF7] px-2.5 py-1 rounded-full border border-[#B88A3B]/25">
                          {item.jobTitle}
                        </span>
                        <span className="text-[11px] font-semibold text-[#174B39] bg-[#EAF0E8] px-2.5 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-base font-serif font-bold text-[#252720]">
                        {item.roundName}
                      </h3>

                      <div className="mt-3 space-y-2 text-xs text-[#66665D]">
                        <p className="flex items-center gap-2">
                          <FiCalendar className="text-[#174B39]" />
                          <span className="font-semibold text-[#252720]">
                            {new Date(item.scheduledDate).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FiClock className="text-[#174B39]" />
                          <span>Time: {item.time}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FiVideo className="text-[#174B39]" />
                          <span>Mode: {item.meetingType}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FiUser className="text-[#174B39]" />
                          <span>Interviewer: {item.interviewerName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E7E0D3]/60 flex items-center justify-between">
                      {item.meetingLink ? (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#174B39] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#103728] transition"
                        >
                          <FiVideo className="text-xs" />
                          <span>Join Video Meeting</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[#8A897C]">Venue details to be updated</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 5. TAB 3: COMPLETE SETTINGS & PROFILE PAGE ================= */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-10 shadow-xs space-y-8">
            {/* Header and Toast Messages */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E0D3]/80">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#252720]">
                  Candidate Profile & Account Settings
                </h2>
                <p className="text-xs sm:text-sm text-[#66665D] mt-1">
                  Manage your candidate profile photo, career credentials, resume attachment, and security credentials.
                </p>
              </div>

              {profileSuccess && (
                <div className="inline-flex items-center gap-2 bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <FiCheck className="text-sm" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="inline-flex items-center gap-2 bg-[#FDEDEC] text-[#C0392B] border border-[#FADBD8] px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <FiAlertCircle className="text-sm" />
                  <span>{profileError}</span>
                </div>
              )}
            </div>

            {/* ================= INSTAGRAM / WHATSAPP CIRCULAR PROFILE PHOTO ON TOP ================= */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-[#F8F5EE]/60 border border-[#E7E0D3]/80">
              {/* Circular Avatar Container with Camera Overlay Button */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl ring-2 ring-[#174B39]/20 overflow-hidden bg-gradient-to-tr from-[#174B39] to-[#B88A3B] flex items-center justify-center text-white text-3xl font-serif font-bold select-none">
                  {profileForm.avatar ? (
                    <img
                      src={profileForm.avatar}
                      alt="Candidate Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>

                {/* Camera Overlay Icon Button */}
                <label
                  htmlFor="candidate-portal-avatar-input"
                  className="absolute bottom-1 right-1 p-2.5 rounded-full bg-[#174B39] hover:bg-[#103728] text-white shadow-lg cursor-pointer border-2 border-white transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
                  title="Upload profile photo"
                >
                  <FiCamera className="text-sm" />
                </label>
                <input
                  type="file"
                  id="candidate-portal-avatar-input"
                  ref={photoInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Photo Actions & Description */}
              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label
                    htmlFor="candidate-portal-avatar-input"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E7E0D3] hover:border-[#174B39] text-xs font-semibold text-[#174B39] shadow-xs hover:bg-[#F8F5EE] transition cursor-pointer"
                  >
                    <FiCamera className="text-xs" />
                    <span>{photoUploading ? 'Optimizing...' : 'Change Photo'}</span>
                  </label>

                  {profileForm.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={photoUploading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#FDEDEC] text-xs font-semibold text-[#C0392B] hover:bg-[#FDEDEC] transition cursor-pointer"
                    >
                      <FiTrash2 className="text-xs" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#66665D] leading-relaxed">
                  Upload a clean, professional profile photo. JPG, PNG or WebP. Photo is compressed and saved directly in MongoDB Atlas so it works across Render and Vercel.
                </p>
                <p className="text-[11px] font-medium text-[#174B39]">
                  ✓ Cloud Database Storage Enabled (Render & Vercel compatible)
                </p>
              </div>
            </div>

            {/* ================= PROFILE DATA FORM BELOW PHOTO ================= */}
            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A897C] flex items-center gap-2">
                  <FiUser className="text-[#174B39]" />
                  <span>Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8A897C]" />
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8A897C]" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#E7E0D3]/30 border border-[#E7E0D3] text-xs text-[#66665D] cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[10px] text-[#174B39] font-medium mt-1 inline-flex items-center gap-1">
                      <FiCheckCircle className="text-[10px]" /> Verified Candidate Account
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Phone / Mobile Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8A897C]" />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROFESSIONAL & CAREER PROFILE */}
              <div className="space-y-4 pt-4 border-t border-[#E7E0D3]/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A897C] flex items-center gap-2">
                  <FiBriefcase className="text-[#174B39]" />
                  <span>Professional & Career Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Current / Target Designation
                    </label>
                    <input
                      type="text"
                      value={profileForm.designation}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, designation: e.target.value })
                      }
                      placeholder="e.g. Senior SAP S/4HANA Consultant"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Current Organization / Company
                    </label>
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, company: e.target.value })
                      }
                      placeholder="e.g. Infosys / Wipro / Freelance"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Total Experience
                    </label>
                    <input
                      type="text"
                      value={profileForm.totalExperience}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, totalExperience: e.target.value })
                      }
                      placeholder="e.g. 5.5 years"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Notice Period
                    </label>
                    <select
                      value={profileForm.noticePeriod}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, noticePeriod: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition cursor-pointer"
                    >
                      <option value="">Select notice period</option>
                      <option value="Immediate">Immediate (0-7 days)</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Current Location / City
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, location: e.target.value })
                      }
                      placeholder="e.g. Gurugram, NCR"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                    Core Skills & Competencies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="e.g. SAP ABAP, S/4HANA Migration, FICO, MM, SD, REST API, CDS Views"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                  />
                  <span className="text-[11px] text-[#8A897C] mt-1 block">
                    These keywords help our recruiters shortlist you for relevant high-priority client openings.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                    Professional Headline / Bio Summary
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Briefly introduce your career highlights, major project implementations, industries served, and staffing availability..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION 3: RESUME ATTACHMENT */}
              <div className="space-y-3 pt-4 border-t border-[#E7E0D3]/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A897C] flex items-center gap-2">
                  <FiFileText className="text-[#174B39]" />
                  <span>Resume & Curriculum Vitae</span>
                </h3>

                <div className="border border-dashed border-[#E7E0D3] rounded-2xl p-4 sm:p-5 bg-[#FDFBF7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#252720] block">
                      Active Resume Document
                    </span>
                    <span className="text-xs text-[#66665D] block">
                      {profileForm.resumeFileName
                        ? `File: ${profileForm.resumeFileName}`
                        : 'No resume attached yet. Uploading a resume increases shortlisting rates.'}
                    </span>
                    {profileForm.resumeUrl && (
                      <a
                        href={profileForm.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#174B39] hover:underline"
                      >
                        <FiDownload className="text-xs" />
                        <span>Preview current uploaded file</span>
                      </a>
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      id="candidate-settings-cv"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="candidate-settings-cv"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E7E0D3] hover:border-[#174B39] text-xs font-semibold text-[#174B39] hover:bg-[#F8F5EE] transition cursor-pointer shadow-xs"
                    >
                      <FiUpload className="text-xs" />
                      <span>{resumeUploading ? 'Uploading...' : 'Upload New Resume'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: SECURITY & PASSWORD UPDATE */}
              <div className="space-y-4 pt-4 border-t border-[#E7E0D3]/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A897C] flex items-center gap-2">
                  <FiLock className="text-[#174B39]" />
                  <span>Account Security (Optional)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={profileForm.currentPassword}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, currentPassword: e.target.value })
                        }
                        placeholder="Enter current password"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A897C] hover:text-[#252720]"
                      >
                        {showCurrentPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={profileForm.newPassword}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, newPassword: e.target.value })
                        }
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A897C] hover:text-[#252720]"
                      >
                        {showNewPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BUTTON */}
              <div className="pt-6 border-t border-[#E7E0D3] flex items-center justify-between">
                <p className="text-[11px] text-[#8A897C]">
                  All profile changes & photos are synced directly with MongoDB Atlas cloud database.
                </p>

                <button
                  type="submit"
                  disabled={profileSaving || photoUploading || resumeUploading}
                  className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <FiCheck className="text-sm" />
                  <span>
                    {profileSaving ? 'Saving Changes...' : 'Save Profile & Account Settings'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatePortalPage;
