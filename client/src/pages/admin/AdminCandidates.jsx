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
} from 'react-icons/fi';
import {
  getAdminApplications,
  getRecruitmentStats,
  getAdminJobs,
  updateApplicationStatus,
  scheduleInterviewRound,
  addApplicationNote,
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

  // Candidate Dossier Drawer
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

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
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="py-4 px-5">
                      <span className="font-bold text-[#252720] text-sm block">
                        {app.candidateName}
                      </span>
                      <span className="text-[11px] text-[#66665D] block">
                        {app.candidateEmail} · {app.candidatePhone}
                      </span>
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
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#174B39] font-bold hover:underline"
                        >
                          <FiDownload className="text-xs" />
                          <span>CV</span>
                        </a>
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

      {/* ================= CANDIDATE DOSSIER DRAWER / MODAL ================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#252720]/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-[#E7E0D3] flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#E7E0D3] flex items-center justify-between bg-[#FDFBF7]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A3B]">
                  Candidate Dossier
                </span>
                <h2 className="text-xl font-serif font-bold text-[#252720]">
                  {selectedApp.candidateName}
                </h2>
                <p className="text-xs text-[#66665D]">
                  Applied for: <strong>{selectedApp.job?.title || 'Open Position'}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full text-[#8A897C] hover:text-[#252720] hover:bg-white"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Content Scroll View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Details Card */}
              <div className="bg-[#F8F5EE] rounded-2xl p-5 border border-[#E7E0D3] text-xs space-y-3">
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
                      Skills
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

                {/* Resume Download button */}
                {selectedApp.resumeUrl && (
                  <div className="pt-2 border-t border-[#E7E0D3] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#252720]">
                      Attached Resume: {selectedApp.resumeFileName || 'Resume.pdf'}
                    </span>
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#174B39] text-white px-3 py-1.5 rounded-xl font-bold shadow-xs hover:bg-[#103728]"
                    >
                      <FiDownload />
                      <span>Download CV</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Status Transition Action Box */}
              <div className="bg-white rounded-2xl p-5 border border-[#E7E0D3] shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#174B39] block">
                  Workflow Stage: {selectedApp.status}
                </span>

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
              <div className="bg-white rounded-2xl p-5 border border-[#E7E0D3] shadow-xs space-y-4">
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
                        <option value="Online (Google Meet / Zoom)">Online (Google Meet / Zoom)</option>
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
                          setInterviewForm({ ...interviewForm, interviewerName: e.target.value })
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
                          {new Date(round.scheduledDate).toLocaleDateString()} at {round.time} ({round.meetingType})
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
              <div className="bg-white rounded-2xl p-5 border border-[#E7E0D3] shadow-xs space-y-3">
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
                      <div key={i} className="bg-[#F8F5EE] rounded-xl p-3 border border-[#E7E0D3] text-xs">
                        <p className="text-[#252720] leading-relaxed">{n.note}</p>
                        <span className="text-[10px] text-[#8A897C] block mt-1">
                          By {n.authorName} · {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E7E0D3] bg-[#FDFBF7] flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-[#252720] bg-white border border-[#E7E0D3] hover:bg-[#F8F5EE] cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidates;
