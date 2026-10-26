import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminSupportTickets,
  getSupportTicketStats,
  updateTicketStatus,
  assignTicket,
  postTicketMessage,
  uploadTicketAttachment,
} from '../../services/api';
import {
  FiCpu,
  FiSearch,
  FiFilter,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiUserCheck,
  FiMessageSquare,
  FiPaperclip,
  FiSend,
  FiX,
  FiDownload,
  FiUploadCloud,
  FiEye,
  FiShield,
  FiLayers,
  FiFileText,
} from 'react-icons/fi';

const priorityBadges = {
  'P1 - Critical': 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20',
  'P2 - High': 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
  'P3 - Medium': 'bg-[#FDFBF7] text-[#B88A3B] border-[#B88A3B]/30',
  'P4 - Low': 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusBadges = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/30 font-semibold',
  'Pending Client Info': 'bg-amber-50 text-amber-800 border-amber-200',
  'In Testing / UAT': 'bg-purple-50 text-purple-700 border-purple-200',
  Resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const AdminSapSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [slaFilter, setSlaFilter] = useState('All');

  // Selected Ticket Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Status Change State
  const [targetStatus, setTargetStatus] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [transportRequest, setTransportRequest] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assignment State
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeTeam, setAssigneeTeam] = useState('SAP FICO & ABAP Core Team');
  const [updatingAssignment, setUpdatingAssignment] = useState(false);

  // Reply / Consultant Note State
  const [messageText, setMessageText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const fetchTickets = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        getAdminSupportTickets({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          module: moduleFilter !== 'All' ? moduleFilter : undefined,
          slaStatus: slaFilter !== 'All' ? slaFilter : undefined,
          search: search.trim() || undefined,
        }),
        getSupportTicketStats(),
      ]);

      const ticketList = ticketsRes?.tickets || (Array.isArray(ticketsRes) ? ticketsRes : []);
      setTickets(ticketList);
      setStats(statsRes);

      // If a ticket is currently open in drawer, update its data
      if (selectedTicket) {
        const updated = ticketList.find((t) => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, moduleFilter, slaFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const openTicketDrawer = (t) => {
    setSelectedTicket(t);
    setTargetStatus(t.status);
    setResolutionSummary(t.resolutionSummary || '');
    setTransportRequest(t.transportRequest || '');
    setRootCause(t.rootCause || '');
    setAssigneeName(t.assignedToName || user?.name || '');
    setAssigneeTeam(t.assignedTeam || 'SAP FICO & ABAP Core Team');
    setMessageText('');
    setIsInternalNote(false);
    setReplyAttachments([]);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !targetStatus) return;

    if (targetStatus === 'Resolved' && !resolutionSummary.trim()) {
      alert('Please provide a resolution summary for resolved tickets.');
      return;
    }

    setUpdatingStatus(true);
    try {
      await updateTicketStatus(selectedTicket._id, {
        status: targetStatus,
        resolutionSummary: targetStatus === 'Resolved' ? resolutionSummary : undefined,
        transportRequest: targetStatus === 'Resolved' ? transportRequest : undefined,
        rootCause: targetStatus === 'Resolved' ? rootCause : undefined,
      });
      await fetchTickets();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !assigneeName.trim()) return;

    setUpdatingAssignment(true);
    try {
      await assignTicket(selectedTicket._id, {
        assignedToName: assigneeName.trim(),
        assignedTeam: assigneeTeam,
      });
      await fetchTickets();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    try {
      const res = await uploadTicketAttachment(file);
      setReplyAttachments((prev) => [
        ...prev,
        {
          fileName: res.fileName || file.name,
          fileUrl: res.fileUrl,
          fileSize: res.fileSize || file.size,
          fileType: res.fileType || file.type,
        },
      ]);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !messageText.trim()) return;

    setSubmittingMessage(true);
    try {
      await postTicketMessage(selectedTicket._id, {
        message: messageText.trim(),
        isInternalNote,
        attachments: replyAttachments,
      });
      setMessageText('');
      setReplyAttachments([]);
      setIsInternalNote(false);
      await fetchTickets();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to post message.');
    } finally {
      setSubmittingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0E8] text-[#174B39] text-xs font-bold mb-1 border border-[#174B39]/20">
            <FiCpu className="text-xs" />
            <span>Enterprise Helpdesk</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#252720]">
            SAP Support & Incident Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#66665D]">
            Manage client incidents, assign module leads, enforce SLA adherence, and record Transport Requests (TRs).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            fetchTickets();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E0D3] bg-white hover:bg-[#FDFBF7] text-xs font-semibold text-[#252720] shadow-xs self-start sm:self-auto transition"
        >
          <FiRefreshCw className={`text-xs ${refreshing ? 'animate-spin text-[#174B39]' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl border border-[#E7E0D3] p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#66665D] uppercase tracking-wider block">Active Queue</span>
          <p className="text-2xl font-serif font-bold text-[#174B39] mt-1">{stats?.activeTicketsCount ?? 0}</p>
          <span className="text-[10px] text-[#66665D]">Open + In Progress</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E0D3] p-4 shadow-xs">
          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Critical P1</span>
          <p className="text-2xl font-serif font-bold text-red-600 mt-1">{stats?.criticalP1 ?? 0}</p>
          <span className="text-[10px] text-red-500 font-medium">4h Resolution SLA</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E0D3] p-4 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Awaiting Client</span>
          <p className="text-2xl font-serif font-bold text-amber-600 mt-1">{stats?.pendingClient ?? 0}</p>
          <span className="text-[10px] text-[#66665D]">Pending info / UAT</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E0D3] p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved</span>
          <p className="text-2xl font-serif font-bold text-emerald-800 mt-1">{stats?.resolved ?? 0}</p>
          <span className="text-[10px] text-emerald-700">Closed / Completed</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E0D3] p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#174B39] uppercase tracking-wider block">SLA Compliance</span>
          <p className="text-2xl font-serif font-bold text-[#174B39] mt-1">{stats?.slaComplianceRate ?? 100}%</p>
          <span className="text-[10px] text-emerald-700">Contractual Target: &gt;95%</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E0D3] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66665D]" />
          <input
            type="text"
            placeholder="Search by ticket #, company, subject, T-Code, or consultant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] text-[#252720]"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Client Info">Pending Client Info</option>
            <option value="In Testing / UAT">In Testing / UAT</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] text-[#252720]"
          >
            <option value="All">All Priorities</option>
            <option value="P1 - Critical">P1 - Critical</option>
            <option value="P2 - High">P2 - High</option>
            <option value="P3 - Medium">P3 - Medium</option>
            <option value="P4 - Low">P4 - Low</option>
          </select>

          {/* Module */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] text-[#252720]"
          >
            <option value="All">All Modules</option>
            <option value="FICO">FICO</option>
            <option value="MM">MM</option>
            <option value="SD">SD</option>
            <option value="PP">PP</option>
            <option value="ABAP">ABAP</option>
            <option value="Basis & Security">Basis</option>
            <option value="S/4HANA">S/4HANA</option>
          </select>

          {/* SLA Status */}
          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] text-[#252720]"
          >
            <option value="All">All SLA Statuses</option>
            <option value="Within SLA">Within SLA</option>
            <option value="At Risk">At Risk</option>
            <option value="SLA Breached">SLA Breached</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-[#E7E0D3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <FiRefreshCw className="w-8 h-8 text-[#174B39] animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#252720]">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <FiCpu className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#252720]">No Tickets in this View</h3>
            <p className="text-xs text-[#66665D]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#E7E0D3] text-[#66665D] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticket & Company</th>
                  <th className="py-3 px-3">Subject & T-Code</th>
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">SLA Status</th>
                  <th className="py-3 px-3">Assigned Lead</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D3]/60">
                {tickets.map((t) => {
                  const priorityClass = priorityBadges[t.priority] || priorityBadges['P3 - Medium'];
                  const statusClass = statusBadges[t.status] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-[#FDFBF7] transition cursor-pointer"
                      onClick={() => openTicketDrawer(t)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#174B39] block">{t.ticketNumber}</span>
                        <span className="font-semibold text-[#252720] block">{t.companyName}</span>
                        <span className="text-[10px] text-[#66665D]">{t.clientName}</span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <span className="font-semibold text-[#252720] block truncate hover:text-[#174B39]">
                          {t.subject}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#66665D]">
                          <span>{t.environment}</span>
                          {t.tCode && (
                            <span className="font-mono px-1.5 py-0.2 bg-amber-50 text-amber-900 border border-amber-200 rounded">
                              {t.tCode}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-[#252720]">
                        {t.module}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${priorityClass}`}>
                          {t.priority.split(' - ')[0]}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] border ${statusClass}`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.slaStatus === 'SLA Breached'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : t.slaStatus === 'At Risk'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <FiClock className="text-[9px]" />
                          {t.slaStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#252720]">
                        {t.assignedToName ? (
                          <span className="font-medium text-[#174B39]">{t.assignedToName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicketDrawer(t);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#EAF0E8] text-[#174B39] hover:bg-[#174B39] hover:text-white font-semibold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= TICKET MANAGEMENT DRAWER / MODAL ================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4">
          <div className="bg-white h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl border border-[#E7E0D3] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E7E0D3] bg-[#FDFBF7] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded bg-[#174B39]/10 text-[#174B39]">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${priorityBadges[selectedTicket.priority] || ''}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadges[selectedTicket.status] || ''}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#252720] mt-1 truncate max-w-2xl">
                  {selectedTicket.subject}
                </h2>
                <p className="text-[11px] text-[#66665D]">
                  Client: <strong>{selectedTicket.companyName}</strong> ({selectedTicket.clientName} · {selectedTicket.clientEmail})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full border border-[#E7E0D3] flex items-center justify-center text-[#66665D] hover:text-[#252720] hover:bg-slate-100 transition"
              >
                <FiX />
              </button>
            </div>

            {/* Drawer Body - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Management Controls (Status, Assignment, Resolution) */}
              <div className="space-y-6">
                
                {/* Status Workflow Action */}
                <form onSubmit={handleStatusUpdate} className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#E7E0D3] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5">
                    <FiLayers />
                    <span>Workflow & Status</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-[#66665D] block mb-1">Lifecycle State</label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E0D3] bg-white font-semibold text-[#252720]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Client Info">Pending Client Info</option>
                      <option value="In Testing / UAT">In Testing / UAT</option>
                      <option value="Resolved">Resolved (Requires TR/Summary)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {targetStatus === 'Resolved' && (
                    <div className="space-y-2.5 pt-2 border-t border-[#E7E0D3]/80">
                      <div>
                        <label className="text-[10px] font-bold text-[#252720] block">
                          Transport Request (TR) Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DEVK904521"
                          value={transportRequest}
                          onChange={(e) => setTransportRequest(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E7E0D3] bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#252720] block">
                          Root Cause Analysis
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. OSS Note 2984112 / Duplicate lock in REGUP"
                          value={rootCause}
                          onChange={(e) => setRootCause(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E7E0D3] bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#252720] block">
                          Resolution Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Describe the fix applied..."
                          value={resolutionSummary}
                          onChange={(e) => setResolutionSummary(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E7E0D3] bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="w-full py-2 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold shadow-xs transition"
                  >
                    {updatingStatus ? 'Updating...' : 'Save Status Transition'}
                  </button>
                </form>

                {/* Assignment Control */}
                <form onSubmit={handleAssignTicket} className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#E7E0D3] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5">
                    <FiUserCheck />
                    <span>Specialist Lead Assignment</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-[#66665D] block mb-1">Consultant Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dinesh Yadav"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E0D3] bg-white text-[#252720]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#66665D] block mb-1">Allocated Support Team</label>
                    <select
                      value={assigneeTeam}
                      onChange={(e) => setAssigneeTeam(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E0D3] bg-white text-[#252720]"
                    >
                      <option value="SAP FICO & ABAP Core Team">SAP FICO & ABAP Core Team</option>
                      <option value="SAP MM & SCM Logistics Team">SAP MM & SCM Logistics Team</option>
                      <option value="SAP SD & Order-to-Cash Team">SAP SD & Order-to-Cash Team</option>
                      <option value="Basis & Infrastructure Desk">Basis & Infrastructure Desk</option>
                      <option value="Integration & Cloud Interface">Integration & Cloud Interface</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingAssignment}
                    className="w-full py-2 rounded-xl bg-[#252720] hover:bg-black text-white text-xs font-semibold shadow-xs transition"
                  >
                    {updatingAssignment ? 'Assigning...' : 'Assign Consultant'}
                  </button>
                </form>

                {/* System Parameters & Logs */}
                <div className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#E7E0D3] space-y-2 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] pb-1 border-b border-[#E7E0D3]">
                    SAP Landscape
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-[#66665D]">Module:</span>
                    <span className="font-semibold text-[#252720]">{selectedTicket.module}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66665D]">Environment:</span>
                    <span className="font-semibold text-[#252720]">{selectedTicket.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66665D]">T-Code:</span>
                    <span className="font-mono font-semibold text-[#174B39]">{selectedTicket.tCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66665D]">SLA Deadline:</span>
                    <span className="font-semibold text-[#252720]">
                      {new Date(selectedTicket.slaResolutionDeadline).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Initial attachments */}
                {selectedTicket.attachments?.length > 0 && (
                  <div className="bg-[#F8F5EE] p-4 rounded-2xl border border-[#E7E0D3] space-y-2 text-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] pb-1 border-b border-[#E7E0D3]">
                      Attachments ({selectedTicket.attachments.length})
                    </h3>
                    {selectedTicket.attachments.map((f, i) => (
                      <a
                        key={i}
                        href={f.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E7E0D3] text-[#174B39] hover:bg-slate-50 transition truncate"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FiFileText className="shrink-0" />
                          <span className="truncate">{f.fileName}</span>
                        </span>
                        <FiDownload className="shrink-0 ml-1" />
                      </a>
                    ))}
                  </div>
                )}

              </div>

              {/* Right Column: Messages Thread + Internal Consultant Notes + Reply Box */}
              <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                
                {/* Messages stream */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  <div className="bg-[#F8F5EE]/60 p-3.5 rounded-xl border border-[#E7E0D3]/80 text-xs">
                    <span className="font-bold text-[#174B39] block mb-1">Original Ticket Description:</span>
                    <p className="text-[#252720] whitespace-pre-line">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.messages?.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                        msg.isInternalNote
                          ? 'bg-amber-50/80 border border-amber-300 text-amber-950'
                          : msg.senderRole === 'client' || msg.senderRole === 'customer'
                          ? 'bg-slate-50 border border-slate-200 text-[#252720]'
                          : 'bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{msg.senderName}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/70 border border-black/10">
                            {msg.isInternalNote ? '🔒 Consultant Internal Note' : msg.senderRole}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-70">
                          {new Date(msg.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>

                      {msg.attachments?.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((a, ai) => (
                            <a
                              key={ai}
                              href={a.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/80 border text-[11px] font-medium hover:underline"
                            >
                              <FiPaperclip />
                              <span>{a.fileName}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply / Internal Note Form */}
                <form onSubmit={handleSendMessage} className="space-y-3 pt-3 border-t border-[#E7E0D3]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#252720] uppercase tracking-wider">
                      Send Reply or Add Consultant Note
                    </label>

                    {/* Toggle: Client Reply vs Internal Note */}
                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="rounded border-[#E7E0D3] text-amber-600 focus:ring-amber-500"
                        />
                        <span className={`font-semibold ${isInternalNote ? 'text-amber-800' : 'text-[#66665D]'}`}>
                          🔒 Internal Note (Hidden from Client)
                        </span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder={
                      isInternalNote
                        ? 'Write internal consultant notes, OSS Note numbers, or code patch comments...'
                        : 'Write official response to client...'
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition ${
                      isInternalNote
                        ? 'border-amber-300 bg-amber-50/40 focus:border-amber-500'
                        : 'border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:border-[#174B39]'
                    }`}
                  />

                  {/* Reply Attachments Preview */}
                  {replyAttachments.length > 0 && (
                    <div className="space-y-1">
                      {replyAttachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs px-2.5 py-1 rounded bg-slate-100"
                        >
                          <span className="truncate">{att.fileName}</span>
                          <button
                            type="button"
                            onClick={() => setReplyAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E0D3] text-xs font-semibold text-[#174B39] hover:bg-slate-50 transition">
                      <FiUploadCloud />
                      <span>{uploadingAttachment ? 'Uploading...' : 'Attach File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        disabled={uploadingAttachment}
                        onChange={handleFileUpload}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={submittingMessage || !messageText.trim() || uploadingAttachment}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-xs transition disabled:opacity-50 ${
                        isInternalNote
                          ? 'bg-amber-700 hover:bg-amber-800'
                          : 'bg-[#174B39] hover:bg-[#103728]'
                      }`}
                    >
                      {submittingMessage ? (
                        <>
                          <FiRefreshCw className="animate-spin text-sm" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="text-sm" />
                          <span>{isInternalNote ? 'Post Internal Note' : 'Send to Client'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSapSupport;
