import { useState, useEffect } from 'react';
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

const CandidatePortalPage = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'interviews', 'profile'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
    company: user?.company || '',
    totalExperience: user?.totalExperience || '',
    skills: user?.skills ? user.skills.join(', ') : '',
    noticePeriod: user?.noticePeriod || '30 Days',
    location: user?.location || '',
    resumeUrl: user?.resumeUrl || '',
    resumeFileName: user?.resumeFileName || '',
  });

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
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        designation: user.designation || '',
        company: user.company || '',
        totalExperience: user.totalExperience || '',
        skills: user.skills ? user.skills.join(', ') : '',
        noticePeriod: user.noticePeriod || '30 Days',
        location: user.location || '',
        resumeUrl: user.resumeUrl || '',
        resumeFileName: user.resumeFileName || '',
      });
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
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileSuccess('');
      const parsedSkills = profileForm.skills
        ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        designation: profileForm.designation,
        company: profileForm.company,
        totalExperience: profileForm.totalExperience,
        skills: parsedSkills,
        noticePeriod: profileForm.noticePeriod,
        location: profileForm.location,
        resumeUrl: profileForm.resumeUrl,
        resumeFileName: profileForm.resumeFileName,
      });

      await refreshUser();
      setProfileSuccess('Profile and career details updated successfully!');
      setTimeout(() => {
        setEditingProfile(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#174B39] to-[#B88A3B] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-sm shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'C'}
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
                  {user?.designation || 'Open to Opportunities'}{' '}
                  {user?.company ? `· ${user.company}` : ''}
                  {user?.totalExperience ? ` · ${user.totalExperience} Exp` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A897C] mt-2">
                  <span>✉ {user?.email}</span>
                  {user?.phone && <span>📞 {user.phone}</span>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#E7E0D3] text-xs font-semibold text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
              >
                <FiUser className="text-xs text-[#B88A3B]" />
                <span>{editingProfile ? 'Close Edit' : 'Edit Career Profile'}</span>
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
                In Screening
              </span>
              <span className="text-xl font-bold font-serif text-[#8E44AD]">
                {applications.filter((a) => a.status === 'Screening').length}
              </span>
            </div>
            <div className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#8A897C] tracking-wider block">
                Interviews Scheduled
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
                {applications.filter((a) => a.status === 'Selected' || a.status === 'Placed').length}
              </span>
            </div>
          </div>
        </div>

        {/* ================= 2. PROFILE EDIT ACCORDION ================= */}
        <AnimatePresence>
          {editingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-serif font-bold text-[#252720]">
                    Update Career Profile & Resume
                  </h3>
                  {profileSuccess && (
                    <span className="text-xs font-semibold text-[#174B39] bg-[#EAF0E8] px-3 py-1 rounded-full">
                      {profileSuccess}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Current Designation
                      </label>
                      <input
                        type="text"
                        value={profileForm.designation}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, designation: e.target.value })
                        }
                        placeholder="e.g. Senior SAP FICO Consultant"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Current Company
                      </label>
                      <input
                        type="text"
                        value={profileForm.company}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, company: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Total Experience
                      </label>
                      <input
                        type="text"
                        value={profileForm.totalExperience}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, totalExperience: e.target.value })
                        }
                        placeholder="e.g. 5.5 years"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1">
                        Notice Period
                      </label>
                      <select
                        value={profileForm.noticePeriod}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, noticePeriod: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                      >
                        <option value="Immediate">Immediate (0-7 days)</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#252720] mb-1">
                      Key Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={profileForm.skills}
                      onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                      placeholder="e.g. SAP ABAP, HANA, CDS Views, OData"
                      className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                    />
                  </div>

                  {/* Upload Resume Attachment */}
                  <div className="border border-dashed border-[#E7E0D3] rounded-2xl p-4 bg-[#FDFBF7]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#252720] block">
                          Resume Document
                        </span>
                        <span className="text-[11px] text-[#66665D]">
                          {profileForm.resumeFileName
                            ? `Current CV: ${profileForm.resumeFileName}`
                            : 'No resume attached yet.'}
                        </span>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="portal-profile-cv"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="portal-profile-cv"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E7E0D3] text-xs font-semibold text-[#174B39] hover:border-[#174B39] cursor-pointer"
                        >
                          <FiUpload className="text-xs" />
                          <span>{resumeUploading ? 'Uploading...' : 'Upload New CV'}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#66665D] hover:bg-[#F8F5EE] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving || resumeUploading}
                      className="bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      {profileSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= 3. NAVIGATION TABS ================= */}
        <div className="flex items-center gap-3 border-b border-[#E7E0D3] pb-1">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all relative cursor-pointer ${
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
            className={`pb-2.5 px-3 text-sm font-semibold transition-all relative cursor-pointer ${
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
        </div>

        {/* ================= 4. TAB 1: APPLICATIONS LIST & TIMELINE ================= */}
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

                    {/* Recruiter Status Notification Banner */}
                    {app.statusNotification?.message && (
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
                    )}

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

        {/* ================= 5. TAB 2: SCHEDULED INTERVIEWS VIEW ================= */}
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

      </div>
    </div>
  );
};

export default CandidatePortalPage;
