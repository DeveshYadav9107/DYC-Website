import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiEye,
  FiCalendar,
  FiClock,
  FiVideo,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiPlus,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiFileText,
  FiExternalLink,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiAward,
} from 'react-icons/fi';
import {
  getAdminApplications,
  getRecruitmentStats,
  getAdminJobs,
  updateApplicationStatus,
  scheduleInterviewRound,
  addApplicationNote,
  downloadCandidateResume,
} from '../../services/api';

const STAGES = ['Applied', 'Screening', 'Interview', 'Selected', 'Rejected', 'Placed'];

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

const AdminCandidates = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'All';

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // Candidate Dossier & CV Viewer State
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewingCv, setViewingCv] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState('application'); // 'application' | 'candidateProfile'
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Lock outer screen scroll while candidate dossier / CV preview is open
  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setViewingCv(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedApp]);

  const getResumeFullUrl = (url) => {
    if (!url) return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')
    ) {
      return url;
    }
    const apiBase = import.meta.env.VITE_API_URL || '';
    if (apiBase && apiBase.startsWith('http')) {
      try {
        const origin = new URL(apiBase).origin;
        return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
      } catch {
        // ignore
      }
    }
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  const handleDownloadCV = async (app) => {
    if (!app || !app.resumeUrl) {
      alert('No CV file attached to this application.');
      return;
    }
    try {
      setDownloadingResume(true);
      const fileName =
        app.resumeFileName ||
        `${(app.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
      await downloadCandidateResume(app._id, fileName);
    } catch (err) {
      console.warn('Backend resume download endpoint failed, trying direct blob fetch:', err);
      try {
        const fullUrl = getResumeFullUrl(app.resumeUrl);
        const res = await fetch(fullUrl);
        if (!res.ok) throw new Error('File fetch failed');
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download =
          app.resumeFileName ||
          `${(app.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } catch (fallbackErr) {
        window.open(getResumeFullUrl(app.resumeUrl), '_blank');
      }
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleRejectCandidate = async (app) => {
    if (!app) return;
    const reason = window.prompt(
      `Reject application for "${app.candidateName}"?\nEnter optional note/feedback for candidate portal:`,
      'Application reviewed; currently not shortlisted for this role.'
    );
    if (reason === null) return; // User cancelled prompt

    try {
      setStatusUpdating(true);
      const updated = await updateApplicationStatus(app._id, {
        status: 'Rejected',
        note: reason.trim() || 'Application rejected by recruiter.',
      });
      setSelectedApp(updated?.data || updated);
      setStatusNote('');
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject candidate');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Interview Scheduler State
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Round 1 - Technical Assessment',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '03:00 PM IST',
    meetingType: 'Online (Google Meet / Zoom)',
    meetingLink: '',
    location: '',
    interviewerName: 'DY&C Recruitment Panel',
    note: '',
  });

  // Note State
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getRecruitmentStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to fetch recruitment stats:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await getAdminJobs();
      setJobs(res?.jobs || []);
    } catch (err) {
      console.warn('Failed to load jobs list:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (selectedJobId !== 'All') params.jobId = selectedJobId;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (skillFilter.trim()) params.skill = skillFilter.trim();

      const res = await getAdminApplications(params);
      setApplications(res?.applications || []);
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, selectedJobId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedApp) return;
    try {
      setStatusUpdating(true);
      const updated = await updateApplicationStatus(selectedApp._id, {
        status: newStatus,
        note: statusNote || undefined,
      });
      setSelectedApp(updated?.data || updated);
      setStatusNote('');
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      setStatusUpdating(true);
      const updated = await scheduleInterviewRound(selectedApp._id, interviewForm);
      setSelectedApp(updated?.data || updated);
      setSchedulingInterview(false);
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedApp) return;
    try {
      setAddingNote(true);
      const updated = await addApplicationNote(selectedApp._id, newNote.trim());
      setSelectedApp(updated?.data || updated);
      setNewNote('');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
            Candidate Database & Recruitment Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#66665D] mt-0.5">
            Screen applications, conduct skill-based searches, schedule interviews, and track candidate placements.
          </p>
        </div>

        <button
          onClick={() => {
            fetchApplications();
            fetchStats();
          }}
          className="self-start sm:self-auto p-2 rounded-xl border border-[#E7E0D3] bg-white text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
          title="Refresh"
        >
          <FiRefreshCw className="text-sm" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D3] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8A897C] tracking-wider block">
            Total Candidates
          </span>
          <span className="text-2xl font-bold font-serif text-[#252720] mt-1 block">
            {stats?.totalApplications || 0}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D3] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#2980B9] tracking-wider block">
            Applied
          </span>
          <span className="text-2xl font-bold font-serif text-[#2980B9] mt-1 block">
            {stats?.applied || 0}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D3] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8E44AD] tracking-wider block">
            Screening
          </span>
          <span className="text-2xl font-bold font-serif text-[#8E44AD] mt-1 block">
            {stats?.screening || 0}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D3] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#B7950B] tracking-wider block">
            In Interview
          </span>
          <span className="text-2xl font-bold font-serif text-[#B7950B] mt-1 block">
            {stats?.interview || 0}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D3] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#174B39] tracking-wider block">
            Selected
          </span>
          <span className="text-2xl font-bold font-serif text-[#174B39] mt-1 block">
            {stats?.selected || 0}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E7E0D3] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#C0392B] tracking-wider block">
            Rejected
          </span>
          <span className="text-2xl font-bold font-serif text-[#C0392B] mt-1 block">
            {stats?.rejected || 0}
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl border border-[#E7E0D3] p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Candidate Search */}
          <div className="sm:col-span-2 relative">
            <FiSearch className="absolute left-3 top-3 text-[#8A897C] text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, email, phone, or company..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
            />
          </div>

          {/* Skill Filter */}
          <div className="relative">
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Skill filter (e.g. SAP FICO, CNC)..."
              className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
            />
          </div>

          {/* Job Filter */}
          <div>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
            >
              <option value="All">All Job Postings</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Stage Status Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#E7E0D3]/60 overflow-x-auto pb-1">
          {['All', ...STAGES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#174B39] text-white'
                  : 'bg-[#F8F5EE] text-[#66665D] hover:bg-[#EAF0E8]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Applications Table */}
      <div className="bg-white rounded-3xl border border-[#E7E0D3] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#66665D]">Loading candidate database...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="text-3xl text-[#8A897C] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#252720]">No candidate applications match filters</p>
            <p className="text-xs text-[#66665D] mt-1">Try widening your search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#E7E0D3] text-[#8A897C] uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Applied Role</th>
                  <th className="py-3.5 px-4">Experience & Company</th>
                  <th className="py-3.5 px-4">Skills</th>
                  <th className="py-3.5 px-3">Resume</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D3]/60">
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-[#FDFBF7] transition cursor-pointer"
                    onClick={() => {
                      setSelectedApp(app);
                      setActiveDossierTab('application');
                    }}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {app.candidate?.avatar ? (
                          <img
                            src={app.candidate.avatar}
                            alt={app.candidateName}
                            className="w-9 h-9 rounded-full object-cover border border-[#E7E0D3] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#174B39]/10 text-[#174B39] font-bold text-xs flex items-center justify-center border border-[#174B39]/20 shrink-0">
                            {(app.candidateName || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#252720] text-sm block">
                              {app.candidateName}
                            </span>
                            {app.candidate && (
                              <span
                                className="text-[9px] font-bold text-[#174B39] bg-[#EAF0E8] px-1.5 py-0.2 rounded border border-[#174B39]/20"
                                title="Registered Career Profile configured in Candidate Portal"
                              >
                                Registered
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#66665D] block">
                            {app.candidateEmail} · {app.candidatePhone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[#252720] block">
                        {app.job?.title || 'Position'}
                      </span>
                      <span className="text-[10px] text-[#8A897C]">{app.job?.department}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#252720] font-medium block">
                        {app.totalExperience || 'N/A'}
                      </span>
                      <span className="text-[11px] text-[#66665D] block">
                        {app.currentCompany || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(app.skills || []).slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#F8F5EE] text-[#252720] px-1.5 py-0.5 rounded border border-[#E7E0D3]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                      {app.resumeUrl ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadCV(app)}
                            className="inline-flex items-center gap-1 text-xs text-[#174B39] font-bold hover:underline cursor-pointer"
                            title="Download CV"
                          >
                            <FiDownload className="text-xs" />
                            <span>Download</span>
                          </button>
                          <span className="text-[#C4C4BA]">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setViewingCv(true);
                              setActiveDossierTab('application');
                            }}
                            className="inline-flex items-center gap-1 text-xs text-[#2980B9] font-bold hover:underline cursor-pointer"
                            title="View CV in Left Preview"
                          >
                            <FiEye className="text-xs" />
                            <span>View</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8A897C]">None</span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                          setActiveDossierTab('application');
                        }}
                        className="bg-[#174B39] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#103728] transition cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= CANDIDATE DOSSIER & CV VIEWER MODAL ================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141715]/80 backdrop-blur-xs overflow-hidden p-0 sm:p-3 lg:p-4">
          <div
            className={`bg-white w-full ${
              viewingCv ? 'max-w-7xl h-full sm:h-[95vh] sm:rounded-3xl' : 'max-w-2xl h-full ml-auto'
            } shadow-2xl border border-[#E7E0D3] flex flex-col lg:flex-row overflow-hidden transition-all duration-300`}
          >
            {/* ================= LEFT SIDE: VIEW CV PANEL ================= */}
            {viewingCv && (
              <div className="w-full lg:w-7/12 h-[50vh] lg:h-full flex flex-col bg-[#141815] border-b lg:border-b-0 lg:border-r border-[#2C332E] overflow-hidden shrink-0">
                {/* CV Viewer Header */}
                <div className="px-5 py-3.5 bg-[#191F1A] border-b border-[#2C332E] flex items-center justify-between text-white shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#174B39] text-[#78D6A2] flex items-center justify-center shrink-0">
                      <FiFileText className="text-base" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#78D6A2]">
                          Candidate CV Preview
                        </span>
                        <span className="text-[10px] text-[#8A897C]">• Independent Scroll</span>
                      </div>
                      <h3 className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-sm">
                        {selectedApp.resumeFileName || 'Candidate_Resume.pdf'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadCV(selectedApp)}
                      disabled={downloadingResume}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                      title="Download uploaded CV"
                    >
                      <FiDownload className={downloadingResume ? 'animate-bounce' : ''} />
                      <span>{downloadingResume ? 'Downloading...' : 'Download CV'}</span>
                    </button>

                    <a
                      href={getResumeFullUrl(selectedApp.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#252C27] hover:bg-[#333C36] text-[#C4C4BA] hover:text-white transition cursor-pointer"
                      title="Open CV in New Browser Tab"
                    >
                      <FiExternalLink className="text-sm" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setViewingCv(false)}
                      className="p-2 rounded-xl bg-[#252C27] hover:bg-[#333C36] text-[#C4C4BA] hover:text-white transition cursor-pointer"
                      title="Close Preview Panel"
                    >
                      <FiX className="text-base" />
                    </button>
                  </div>
                </div>

                {/* CV Document Viewer Box (Screen stays fixed, ONLY this container scrolls) */}
                <div className="flex-1 h-full overflow-y-auto p-3 sm:p-4 bg-[#0F1210]">
                  {selectedApp.resumeUrl ? (
                    <div className="w-full h-full min-h-[550px] lg:min-h-full flex flex-col">
                      <iframe
                        src={`${getResumeFullUrl(selectedApp.resumeUrl)}#toolbar=1&navpanes=0`}
                        className="w-full h-full min-h-[550px] lg:min-h-full rounded-2xl bg-white shadow-2xl border border-gray-800"
                        title={`CV Preview - ${selectedApp.candidateName}`}
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8A897C]">
                      <FiAlertCircle className="text-4xl mb-3 text-[#B88A3B]" />
                      <p className="text-sm font-bold text-white">No CV File Uploaded</p>
                      <p className="text-xs text-[#8A897C] mt-1">
                        This candidate application does not have an attached resume.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= RIGHT SIDE: CANDIDATE DOSSIER & PROFILE ================= */}
            <div
              className={`w-full ${
                viewingCv ? 'lg:w-5/12' : 'w-full'
              } h-full flex flex-col bg-white overflow-hidden`}
            >
              {/* Header */}
              <div className="p-5 border-b border-[#E7E0D3] bg-[#FDFBF7] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedApp.candidate?.avatar ? (
                    <img
                      src={selectedApp.candidate.avatar}
                      alt={selectedApp.candidateName}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#E7E0D3] shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#174B39]/10 text-[#174B39] font-bold text-lg flex items-center justify-center border border-[#174B39]/20 shrink-0">
                      {(selectedApp.candidateName || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A3B]">
                        Candidate Dossier
                      </span>
                      {selectedApp.candidate && (
                        <span className="text-[9px] font-bold text-[#174B39] bg-[#EAF0E8] px-2 py-0.5 rounded-full border border-[#174B39]/20">
                          Portal Profile Connected
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252720] truncate">
                      {selectedApp.candidateName}
                    </h2>
                    <p className="text-xs text-[#66665D] truncate">
                      Applied for: <strong>{selectedApp.job?.title || 'Open Position'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedApp(null);
                      setViewingCv(false);
                    }}
                    className="p-2 rounded-xl text-[#8A897C] hover:text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
                    title="Close"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs (Application vs Registered Career Profile) */}
              <div className="flex border-b border-[#E7E0D3] bg-[#FDFBF7] px-5 gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('application')}
                  className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    activeDossierTab === 'application'
                      ? 'border-[#174B39] text-[#174B39]'
                      : 'border-transparent text-[#8A897C] hover:text-[#252720]'
                  }`}
                >
                  Job Application Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('candidateProfile')}
                  className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeDossierTab === 'candidateProfile'
                      ? 'border-[#174B39] text-[#174B39]'
                      : 'border-transparent text-[#8A897C] hover:text-[#252720]'
                  }`}
                >
                  <FiUser className="text-xs" />
                  <span>View Registered Profile</span>
                  {selectedApp.candidate && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#174B39]"></span>
                  )}
                </button>
              </div>

              {/* Scrollable Content View */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {activeDossierTab === 'application' ? (
                  <>
                    {/* CV Action Bar (Download CV & View CV side-by-side) */}
                    <div className="bg-[#174B39]/5 border border-[#174B39]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#174B39] text-white flex items-center justify-center shrink-0">
                          <FiFileText className="text-lg" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#174B39] tracking-wider block">
                            Uploaded Resume
                          </span>
                          <span className="text-xs font-semibold text-[#252720] truncate block max-w-xs">
                            {selectedApp.resumeFileName || 'Resume.pdf'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Download CV Button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadCV(selectedApp)}
                          disabled={downloadingResume || !selectedApp.resumeUrl}
                          className="inline-flex items-center gap-1.5 bg-[#174B39] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#103728] transition cursor-pointer disabled:opacity-50"
                          title="Download Candidate CV"
                        >
                          <FiDownload className={downloadingResume ? 'animate-bounce' : ''} />
                          <span>{downloadingResume ? 'Downloading...' : 'Download CV'}</span>
                        </button>

                        {/* View CV Button */}
                        <button
                          type="button"
                          disabled={!selectedApp.resumeUrl}
                          onClick={() => setViewingCv(!viewingCv)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer shadow-xs disabled:opacity-50 ${
                            viewingCv
                              ? 'bg-[#252720] text-white border-[#252720]'
                              : 'bg-white text-[#174B39] border-[#174B39]/30 hover:bg-[#EAF0E8]'
                          }`}
                          title="Open Left Side CV Viewer"
                        >
                          <FiEye className="text-sm" />
                          <span>{viewingCv ? 'Hide CV' : 'View CV'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Profile Application Summary Box */}
                    <div className="bg-[#F8F5EE] rounded-2xl p-4 sm:p-5 border border-[#E7E0D3] text-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D3]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C]">
                          Application Parameters
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveDossierTab('candidateProfile')}
                          className="text-[11px] font-bold text-[#174B39] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FiUser className="text-xs" />
                          <span>
                            {selectedApp.candidate ? 'View Full Profile ➔' : 'View Registered Profile'}
                          </span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold">
                            Email
                          </span>
                          <span className="font-semibold text-[#252720]">
                            {selectedApp.candidateEmail}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold">
                            Phone
                          </span>
                          <span className="font-semibold text-[#252720]">
                            {selectedApp.candidatePhone}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold">
                            Total Experience
                          </span>
                          <span className="font-semibold text-[#252720]">
                            {selectedApp.totalExperience}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold">
                            Notice Period
                          </span>
                          <span className="font-semibold text-[#252720]">
                            {selectedApp.noticePeriod || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold">
                            Current Company
                          </span>
                          <span className="font-semibold text-[#252720]">
                            {selectedApp.currentCompany || 'Not stated'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold">
                            Current / Expected CTC
                          </span>
                          <span className="font-semibold text-[#174B39]">
                            {selectedApp.currentSalary || 'N/A'} ➔ {selectedApp.expectedSalary || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Skills tags */}
                      {selectedApp.skills?.length > 0 && (
                        <div className="pt-2 border-t border-[#E7E0D3]">
                          <span className="text-[#8A897C] block text-[10px] uppercase font-bold mb-1.5">
                            Skills Applied With
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedApp.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className="bg-white text-[#174B39] font-bold px-2 py-0.5 rounded border border-[#174B39]/20"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Transition Action Box */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E0D3] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#174B39] block">
                          Workflow Pipeline Stage: {selectedApp.status}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                            selectedApp.status
                          )}`}
                        >
                          {selectedApp.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {STAGES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={statusUpdating || selectedApp.status === st}
                            onClick={() => handleUpdateStatus(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              selectedApp.status === st
                                ? 'bg-[#174B39] text-white border-[#174B39]'
                                : 'bg-[#F8F5EE] text-[#252720] border-[#E7E0D3] hover:bg-[#EAF0E8]'
                            }`}
                          >
                            Move to {st}
                          </button>
                        ))}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Optional recruiter note for status change..."
                          className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                        />
                      </div>
                    </div>

                    {/* Interview Rounds & Scheduling */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E0D3] shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#174B39]">
                          Interview Rounds ({selectedApp.interviews?.length || 0})
                        </span>
                        <button
                          onClick={() => setSchedulingInterview(!schedulingInterview)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#174B39] bg-[#EAF0E8] px-3 py-1.5 rounded-xl hover:bg-[#174B39] hover:text-white transition cursor-pointer"
                        >
                          <FiCalendar className="text-xs" />
                          <span>{schedulingInterview ? 'Cancel' : 'Schedule Round'}</span>
                        </button>
                      </div>

                      {/* Scheduling Form */}
                      {schedulingInterview && (
                        <form
                          onSubmit={handleScheduleInterviewSubmit}
                          className="bg-[#F8F5EE] rounded-2xl p-4 border border-[#E7E0D3] space-y-3 text-xs"
                        >
                          <h4 className="font-bold text-[#252720]">Schedule Interview Round</h4>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                              Round Title
                            </label>
                            <input
                              type="text"
                              required
                              value={interviewForm.roundName}
                              onChange={(e) =>
                                setInterviewForm({ ...interviewForm, roundName: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E0D3]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                required
                                value={interviewForm.scheduledDate}
                                onChange={(e) =>
                                  setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E0D3]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                                Time (IST)
                              </label>
                              <input
                                type="text"
                                required
                                value={interviewForm.time}
                                onChange={(e) =>
                                  setInterviewForm({ ...interviewForm, time: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E0D3]"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                              Meeting Mode
                            </label>
                            <select
                              value={interviewForm.meetingType}
                              onChange={(e) =>
                                setInterviewForm({ ...interviewForm, meetingType: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E0D3]"
                            >
                              <option value="Online (Google Meet / Zoom)">
                                Online (Google Meet / Zoom)
                              </option>
                              <option value="In-person Office">In-person Office</option>
                              <option value="Telephonic">Telephonic</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                              Meeting Link or Venue Address
                            </label>
                            <input
                              type="text"
                              value={interviewForm.meetingLink}
                              onChange={(e) =>
                                setInterviewForm({ ...interviewForm, meetingLink: e.target.value })
                              }
                              placeholder="https://meet.google.com/..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E0D3]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#252720] mb-1">
                              Interviewer Name / Panel
                            </label>
                            <input
                              type="text"
                              value={interviewForm.interviewerName}
                              onChange={(e) =>
                                setInterviewForm({
                                  ...interviewForm,
                                  interviewerName: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E0D3]"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setSchedulingInterview(false)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#66665D]"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={statusUpdating}
                              className="bg-[#174B39] text-white px-4 py-1.5 rounded-xl text-xs font-bold"
                            >
                              {statusUpdating ? 'Booking...' : 'Confirm & Notify Candidate'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* List of existing rounds */}
                      {selectedApp.interviews?.length > 0 && (
                        <div className="space-y-2.5">
                          {selectedApp.interviews.map((round, idx) => (
                            <div
                              key={idx}
                              className="bg-[#FDFBF7] rounded-xl p-3 border border-[#E7E0D3] text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-[#252720]">
                                <span>{round.roundName}</span>
                                <span className="text-[10px] text-[#B7950B] bg-[#FEF9E7] px-2 py-0.5 rounded border border-[#FAD7A0]">
                                  {round.status}
                                </span>
                              </div>
                              <p className="text-[#66665D]">
                                {new Date(round.scheduledDate).toLocaleDateString()} at {round.time}{' '}
                                ({round.meetingType})
                              </p>
                              {round.meetingLink && (
                                <a
                                  href={round.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#174B39] font-bold hover:underline block"
                                >
                                  Link: {round.meetingLink}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recruiter Evaluation Notes Thread */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E0D3] shadow-xs space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#174B39] block">
                        Internal Recruiter Evaluation Notes
                      </span>

                      <form onSubmit={handleAddNote} className="flex gap-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Log interview feedback, expected salary, remarks..."
                          className="flex-1 px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                        />
                        <button
                          type="submit"
                          disabled={addingNote || !newNote.trim()}
                          className="bg-[#174B39] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {addingNote ? 'Saving...' : 'Add Note'}
                        </button>
                      </form>

                      {selectedApp.recruiterNotes?.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {selectedApp.recruiterNotes.map((n, i) => (
                            <div
                              key={i}
                              className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3] text-xs"
                            >
                              <p className="text-[#252720] leading-relaxed">{n.note}</p>
                              <span className="text-[10px] text-[#8A897C] block mt-1">
                                By {n.authorName} · {new Date(n.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* ================= REGISTERED CANDIDATE CAREER PROFILE VIEW ================= */
                  <div className="space-y-5">
                    {selectedApp.candidate ? (
                      <>
                        {/* Profile Hero Card */}
                        <div className="bg-[#F8F5EE] rounded-3xl p-5 sm:p-6 border border-[#E7E0D3] text-xs space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {selectedApp.candidate.avatar ? (
                              <img
                                src={selectedApp.candidate.avatar}
                                alt={selectedApp.candidate.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#174B39] text-white font-serif font-bold text-2xl flex items-center justify-center shrink-0 shadow-md">
                                {(selectedApp.candidate.name || 'C').charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-serif font-bold text-[#252720]">
                                  {selectedApp.candidate.name || selectedApp.candidateName}
                                </h3>
                                <span className="bg-[#EAF0E8] text-[#174B39] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#174B39]/20">
                                  Verified Candidate
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-[#174B39]">
                                {selectedApp.candidate.headline ||
                                  selectedApp.candidate.designation ||
                                  'Candidate Profile'}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#66665D] pt-1">
                                <span>📧 {selectedApp.candidate.email || selectedApp.candidateEmail}</span>
                                <span>📞 {selectedApp.candidate.phone || selectedApp.candidatePhone}</span>
                                {selectedApp.candidate.location && (
                                  <span>📍 {selectedApp.candidate.location}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Candidate Bio */}
                          {selectedApp.candidate.bio ? (
                            <div className="pt-3 border-t border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-1">
                                Professional Bio
                              </span>
                              <p className="text-[#252720] leading-relaxed bg-white p-3 rounded-xl border border-[#E7E0D3]">
                                {selectedApp.candidate.bio}
                              </p>
                            </div>
                          ) : (
                            <div className="pt-3 border-t border-[#E7E0D3] text-[#8A897C] italic text-[11px]">
                              No professional bio has been added to their portal profile yet.
                            </div>
                          )}
                        </div>

                        {/* Career Metrics & Work Details */}
                        <div className="bg-white rounded-3xl p-5 border border-[#E7E0D3] shadow-xs text-xs space-y-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#174B39] block">
                            Career Profile Metadata
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                Current Role
                              </span>
                              <span className="font-semibold text-[#252720] block mt-0.5">
                                {selectedApp.candidate.designation ||
                                  selectedApp.currentDesignation ||
                                  'Not specified'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                Current Company
                              </span>
                              <span className="font-semibold text-[#252720] block mt-0.5">
                                {selectedApp.candidate.company ||
                                  selectedApp.currentCompany ||
                                  'Not specified'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                Total Experience
                              </span>
                              <span className="font-semibold text-[#252720] block mt-0.5">
                                {selectedApp.candidate.totalExperience ||
                                  selectedApp.totalExperience ||
                                  '0 Years'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                Notice Period
                              </span>
                              <span className="font-semibold text-[#252720] block mt-0.5">
                                {selectedApp.candidate.noticePeriod ||
                                  selectedApp.noticePeriod ||
                                  'Not specified'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                Preferred Location
                              </span>
                              <span className="font-semibold text-[#252720] block mt-0.5">
                                {selectedApp.candidate.location || 'Pan India / Remote'}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                Compensation Range
                              </span>
                              <span className="font-semibold text-[#174B39] block mt-0.5">
                                {selectedApp.candidate.currentSalary ||
                                  selectedApp.currentSalary ||
                                  'N/A'}{' '}
                                ➔{' '}
                                {selectedApp.candidate.expectedSalary ||
                                  selectedApp.expectedSalary ||
                                  'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Skills from Profile */}
                          {selectedApp.candidate.skills?.length > 0 && (
                            <div className="pt-3 border-t border-[#E7E0D3]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A897C] block mb-2">
                                Skills Configured in Career Profile ({selectedApp.candidate.skills.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedApp.candidate.skills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-[#EAF0E8] text-[#174B39] font-bold px-2.5 py-1 rounded-lg border border-[#174B39]/20 text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Master Resume in Profile */}
                          {selectedApp.candidate.resumeUrl && (
                            <div className="pt-3 border-t border-[#E7E0D3] flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-[#8A897C] block">
                                  Default Profile Master Resume
                                </span>
                                <span className="text-xs font-semibold text-[#252720]">
                                  {selectedApp.candidate.resumeFileName || 'Profile_Resume.pdf'}
                                </span>
                              </div>
                              <a
                                href={getResumeFullUrl(selectedApp.candidate.resumeUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 bg-[#F8F5EE] border border-[#E7E0D3] text-[#174B39] hover:bg-[#EAF0E8] px-3 py-1.5 rounded-xl font-bold transition text-xs"
                              >
                                <FiExternalLink className="text-xs" />
                                <span>Open Profile Resume</span>
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveDossierTab('application')}
                            className="text-xs font-bold text-[#174B39] hover:underline cursor-pointer"
                          >
                            ➔ Back to Job Application Evaluation
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-[#F8F5EE] rounded-3xl p-8 border border-[#E7E0D3] text-center space-y-3">
                        <FiUser className="text-4xl text-[#8A897C] mx-auto" />
                        <h3 className="text-sm font-bold text-[#252720]">
                          No Separate Profile Registered
                        </h3>
                        <p className="text-xs text-[#66665D] max-w-md mx-auto">
                          This candidate submitted an application using the online job form with
                          email <strong>{selectedApp.candidateEmail}</strong>. All candidate details
                          are recorded directly in the Application tab.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveDossierTab('application')}
                          className="bg-[#174B39] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#103728] transition"
                        >
                          View Application Details
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================= FOOTER (Reject button & Close button) ================= */}
              <div className="p-4 border-t border-[#E7E0D3] bg-[#FDFBF7] flex items-center justify-between gap-3 shrink-0">
                {/* Left Action: Reject Candidate */}
                <button
                  type="button"
                  disabled={statusUpdating || selectedApp.status === 'Rejected'}
                  onClick={() => handleRejectCandidate(selectedApp)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-[#FADBD8] bg-[#FDEDEC] text-[#C0392B] hover:bg-[#FADBD8] disabled:opacity-50"
                  title="Reject candidate application and notify candidate portal"
                >
                  <FiXCircle className="text-sm" />
                  <span>
                    {selectedApp.status === 'Rejected' ? 'Application Rejected' : 'Reject Candidate'}
                  </span>
                </button>

                {/* Right Action: Close (renamed from Close Dossier) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(null);
                    setViewingCv(false);
                  }}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-[#252720] bg-white border border-[#E7E0D3] hover:bg-[#F8F5EE] transition cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidates;
