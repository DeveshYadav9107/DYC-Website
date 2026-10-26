import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMySupportTickets,
  getSupportTicketStats,
  createSupportTicket,
  uploadTicketAttachment,
} from '../../services/api';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiLifeBuoy,
  FiPlus,
  FiSearch,
  FiFilter,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiPaperclip,
  FiArrowUpRight,
  FiRefreshCw,
  FiFileText,
  FiCpu,
  FiShield,
  FiX,
  FiUploadCloud,
  FiMessageSquare,
  FiCheck,
} from 'react-icons/fi';

const priorityColors = {
  'P1 - Critical': {
    badge: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20',
    dot: 'bg-red-500',
    sla: '4h Resolution',
  },
  'P2 - High': {
    badge: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
    dot: 'bg-amber-500',
    sla: '8h Resolution',
  },
  'P3 - Medium': {
    badge: 'bg-[#FDFBF7] text-[#B88A3B] border-[#B88A3B]/30',
    dot: 'bg-[#B88A3B]',
    sla: '24h Resolution',
  },
  'P4 - Low': {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    sla: '48h Resolution',
  },
};

const statusColors = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/30 font-semibold',
  'Pending Client Info': 'bg-amber-50 text-amber-800 border-amber-200',
  'In Testing / UAT': 'bg-purple-50 text-purple-700 border-purple-200',
  Resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const SapSupportPortal = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    module: 'FICO',
    environment: 'Production (PRD)',
    tCode: '',
    sapVersion: user?.sapSystem || 'SAP S/4HANA Enterprise',
    category: 'Functional Issue',
    priority: 'P3 - Medium',
    description: '',
  });

  const fetchData = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        getMySupportTickets({
          status: statusFilter !== 'All' ? statusFilter : undefined,
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          module: moduleFilter !== 'All' ? moduleFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        getSupportTicketStats(),
      ]);

      setTickets(ticketsRes?.tickets || (Array.isArray(ticketsRes) ? ticketsRes : []));
      setStats(statsRes);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load support tickets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await uploadTicketAttachment(file);
      setUploadedAttachments((prev) => [
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
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index) => {
    setUploadedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      alert('Please fill in both the Subject and Description fields.');
      return;
    }

    setSubmitting(true);
    try {
      await createSupportTicket({
        ...ticketForm,
        attachments: uploadedAttachments,
      });

      // Reset form & close modal
      setTicketForm({
        subject: '',
        module: 'FICO',
        environment: 'Production (PRD)',
        tCode: '',
        sapVersion: user?.sapSystem || 'SAP S/4HANA Enterprise',
        category: 'Functional Issue',
        priority: 'P3 - Medium',
        description: '',
      });
      setUploadedAttachments([]);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error raising support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8F5EE] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header & SLA Tier Strip */}
          <div className="bg-white rounded-2xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 text-xs font-bold mb-3">
                  <FiLifeBuoy className="text-sm" />
                  <span>SAP Enterprise AMS Support Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight">
                  SAP Client Support & Incident Desk
                </h1>
                <p className="text-sm text-[#66665D] mt-1.5 max-w-2xl">
                  Log SAP issues, track resolution SLAs in real time, collaborate directly with certified SAP functional and technical consultants, and review complete incident history.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[#252720]">
                  <span className="flex items-center gap-1.5 font-medium bg-[#FDFBF7] px-3 py-1 rounded-lg border border-[#E7E0D3]">
                    <FiShield className="text-[#174B39]" />
                    Client: <strong>{user?.company || user?.name}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium bg-[#FDFBF7] px-3 py-1 rounded-lg border border-[#E7E0D3]">
                    <FiCpu className="text-[#B88A3B]" />
                    SLA Tier: <strong>{user?.supportAgreement || '24x7 Enterprise Platinum SLA'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRefreshing(true);
                    fetchData();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] hover:bg-white text-xs font-semibold text-[#252720] transition shadow-xs"
                >
                  <FiRefreshCw className={`text-xs ${refreshing ? 'animate-spin text-[#174B39]' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition border border-[#103728]"
                >
                  <FiPlus className="text-base" />
                  <span>Raise Support Ticket</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E7E0D3]">
              <div className="bg-[#F8F5EE]/60 rounded-xl p-4 border border-[#E7E0D3]/80">
                <span className="text-xs font-semibold text-[#66665D] uppercase tracking-wider">Active Tickets</span>
                <p className="text-2xl font-serif font-bold text-[#174B39] mt-1">{stats?.activeTicketsCount ?? 0}</p>
                <span className="text-[11px] text-[#66665D]">Currently under investigation</span>
              </div>
              <div className="bg-[#F8F5EE]/60 rounded-xl p-4 border border-[#E7E0D3]/80">
                <span className="text-xs font-semibold text-[#66665D] uppercase tracking-wider">Awaiting My Input</span>
                <p className="text-2xl font-serif font-bold text-amber-700 mt-1">{stats?.pendingClient ?? 0}</p>
                <span className="text-[11px] text-[#66665D]">Pending logs / testing feedback</span>
              </div>
              <div className="bg-[#F8F5EE]/60 rounded-xl p-4 border border-[#E7E0D3]/80">
                <span className="text-xs font-semibold text-[#66665D] uppercase tracking-wider">Resolved / Closed</span>
                <p className="text-2xl font-serif font-bold text-[#252720] mt-1">{(stats?.resolved || 0) + (stats?.closed || 0)}</p>
                <span className="text-[11px] text-[#66665D]">Complete ticket history</span>
              </div>
              <div className="bg-[#F8F5EE]/60 rounded-xl p-4 border border-[#E7E0D3]/80">
                <span className="text-xs font-semibold text-[#66665D] uppercase tracking-wider">SLA Adherence</span>
                <p className="text-2xl font-serif font-bold text-[#174B39] mt-1">{stats?.slaComplianceRate ?? 100}%</p>
                <span className="text-[11px] text-emerald-700 font-medium">Enterprise benchmark</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-[#E7E0D3] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66665D]" />
              <input
                type="text"
                placeholder="Search by ticket number (e.g. DYC-SAP-2026), subject, or T-Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39] transition"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Module Filter */}
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:outline-none focus:border-[#174B39] text-[#252720]"
              >
                <option value="All">All SAP Modules</option>
                <option value="FICO">FICO (Financials & Controlling)</option>
                <option value="MM">MM (Materials Management)</option>
                <option value="SD">SD (Sales & Distribution)</option>
                <option value="PP">PP (Production Planning)</option>
                <option value="ABAP">ABAP Development</option>
                <option value="Basis & Security">Basis & Security</option>
                <option value="S/4HANA">S/4HANA Enterprise</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:outline-none focus:border-[#174B39] text-[#252720]"
              >
                <option value="All">All Priorities</option>
                <option value="P1 - Critical">P1 - Critical (4h SLA)</option>
                <option value="P2 - High">P2 - High (8h SLA)</option>
                <option value="P3 - Medium">P3 - Medium (24h SLA)</option>
                <option value="P4 - Low">P4 - Low (48h SLA)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:outline-none focus:border-[#174B39] text-[#252720]"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Client Info">Pending Client Info</option>
                <option value="In Testing / UAT">In Testing / UAT</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#E7E0D3] p-16 text-center shadow-xs">
              <FiRefreshCw className="w-8 h-8 mx-auto text-[#174B39] animate-spin mb-3" />
              <p className="text-sm font-semibold text-[#252720]">Loading SAP support tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E7E0D3] p-16 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto text-2xl">
                <FiLifeBuoy />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-serif font-bold text-[#252720]">No Support Tickets Found</h3>
                <p className="text-xs sm:text-sm text-[#66665D] mt-1">
                  You currently have no active or historical tickets matching this filter. If you encounter any issue or dump in your SAP environment, raise a ticket now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs"
              >
                <FiPlus className="text-base" />
                <span>Raise New Support Ticket</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const priorityInfo = priorityColors[ticket.priority] || priorityColors['P3 - Medium'];
                const statusColor = statusColors[ticket.status] || 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div
                    key={ticket._id}
                    className="bg-white rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-xs hover:border-[#174B39]/50 transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Ticket ID, Module, Subject */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#174B39]/10 text-[#174B39]">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FDFBF7] text-[#252720] border border-[#E7E0D3]">
                            Module: {ticket.module}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {ticket.environment}
                          </span>
                          {ticket.tCode && (
                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                              T-Code: {ticket.tCode}
                            </span>
                          )}
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${priorityInfo.badge}`}>
                            {ticket.priority}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#252720] group-hover:text-[#174B39] transition">
                          <Link to={`/support/tickets/${ticket.ticketNumber || ticket._id}`} className="hover:underline">
                            {ticket.subject}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-[#66665D] line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Right: Status, SLA Timer, Action */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E7E0D3]/60">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full border ${statusColor}`}>
                            {ticket.status}
                          </span>

                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 border ${
                              ticket.slaStatus === 'SLA Breached'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : ticket.slaStatus === 'At Risk'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <FiClock className="text-xs" />
                            <span>{ticket.slaStatus}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#66665D]">
                            {ticket.assignedToName ? (
                              <span>Assigned: <strong className="text-[#174B39]">{ticket.assignedToName}</strong></span>
                            ) : (
                              <span className="italic text-slate-400">Consultant Dispatching...</span>
                            )}
                          </span>

                          <Link
                            to={`/support/tickets/${ticket.ticketNumber || ticket._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF0E8] hover:bg-[#174B39] text-[#174B39] hover:text-white text-xs font-semibold transition"
                          >
                            <FiMessageSquare className="text-xs" />
                            <span>View Thread ({ticket.messages?.length || 1})</span>
                            <FiArrowUpRight className="text-xs" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info: Resolution TR or Latest update */}
                    {ticket.status === 'Resolved' && ticket.transportRequest && (
                      <div className="mt-4 pt-3 border-t border-[#E7E0D3]/80 flex flex-wrap items-center justify-between text-xs bg-[#EAF0E8]/40 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FiCheck className="text-emerald-700 font-bold" />
                          <span className="text-[#252720]">
                            Resolved with Transport Request (TR): <strong className="font-mono text-[#174B39]">{ticket.transportRequest}</strong>
                          </span>
                        </div>
                        {ticket.rating ? (
                          <span className="text-amber-600 font-bold">
                            Rated: {'★'.repeat(ticket.rating)}{'☆'.repeat(5 - ticket.rating)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#174B39] font-semibold underline">
                            Please verify and submit feedback
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* ================= CREATE TICKET MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E0D3] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col my-8 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E7E0D3] bg-[#FDFBF7]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174B39]">
                  <FiCpu className="text-sm" />
                  <span>SAP Application Management Services (AMS)</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-[#252720] mt-0.5">
                  Raise SAP Support Ticket
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E7E0D3] flex items-center justify-center text-[#66665D] hover:text-[#252720] hover:bg-slate-100 transition"
              >
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTicket} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                  Issue Summary / Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Runtime Dump SAPSQL_ARRAY_INSERT_DUPREC during F110 Payment Run"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                />
              </div>

              {/* Module & Environment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                    SAP Module <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ticketForm.module}
                    onChange={(e) => setTicketForm({ ...ticketForm, module: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                  >
                    <option value="FICO">FICO - Financials & Controlling</option>
                    <option value="MM">MM - Materials Management</option>
                    <option value="SD">SD - Sales & Distribution</option>
                    <option value="PP">PP - Production Planning</option>
                    <option value="QM">QM - Quality Management</option>
                    <option value="PM">PM - Plant Maintenance</option>
                    <option value="ABAP">ABAP - Custom Code & Enhancements</option>
                    <option value="Basis & Security">Basis & User Security</option>
                    <option value="S/4HANA">S/4HANA Migration & Core</option>
                    <option value="Integration & IDoc">Integration, RFC & IDocs</option>
                    <option value="Other">Other Landscape Component</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                    Environment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ticketForm.environment}
                    onChange={(e) => setTicketForm({ ...ticketForm, environment: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                  >
                    <option value="Production (PRD)">Production (PRD)</option>
                    <option value="Quality / UAT (QAS)">Quality / UAT (QAS)</option>
                    <option value="Development (DEV)">Development (DEV)</option>
                    <option value="Sandbox / Test">Sandbox / Test</option>
                  </select>
                </div>
              </div>

              {/* TCode & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                    Transaction Code (T-Code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. F110, VA01, ME21N, ST22"
                    value={ticketForm.tCode}
                    onChange={(e) => setTicketForm({ ...ticketForm, tCode: e.target.value })}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                  >
                    <option value="Functional Issue">Functional Issue</option>
                    <option value="Configuration Bug">Configuration Bug</option>
                    <option value="Performance / Dump (ST22)">Performance / Dump (ST22)</option>
                    <option value="Enhancement Request">Enhancement Request</option>
                    <option value="User Access & Authorization">User Access & Authorization</option>
                    <option value="Month-End Critical">Month-End Critical</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>
              </div>

              {/* Priority & SLA */}
              <div>
                <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                  Priority & SLA Target <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'P1 - Critical', label: 'P1 Critical', sub: '4h SLA · Core Down', color: 'border-red-400 bg-red-50/50 text-red-900' },
                    { key: 'P2 - High', label: 'P2 High', sub: '8h SLA · Degraded', color: 'border-amber-400 bg-amber-50/50 text-amber-900' },
                    { key: 'P3 - Medium', label: 'P3 Medium', sub: '24h SLA · Standard', color: 'border-[#174B39] bg-[#EAF0E8]/50 text-[#174B39]' },
                    { key: 'P4 - Low', label: 'P4 Low', sub: '48h SLA · Minor/Inquiry', color: 'border-slate-300 bg-slate-50 text-slate-700' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, priority: p.key })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        ticketForm.priority === p.key
                          ? `ring-2 ring-[#174B39] font-bold ${p.color}`
                          : 'border-[#E7E0D3] bg-[#FDFBF7] hover:bg-white text-[#252720]'
                      }`}
                    >
                      <span className="block text-xs">{p.label}</span>
                      <span className="block text-[10px] text-[#66665D] mt-0.5">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                  Detailed Description & Steps to Reproduce <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the exact steps leading to the error, expected behavior, error message text or number (e.g. F5 102), and business impact..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                />
              </div>

              {/* File / Log Upload */}
              <div>
                <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                  Attach Screenshots, Logs or Dump (ST22 PDF / Text)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] hover:bg-white text-xs font-semibold text-[#174B39] transition">
                    <FiUploadCloud className="text-sm" />
                    <span>{uploadingFile ? 'Uploading file...' : 'Choose File'}</span>
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingFile}
                      onChange={handleFileUpload}
                      accept=".png,.jpg,.jpeg,.pdf,.txt,.log,.docx,.xlsx"
                    />
                  </label>
                  <span className="text-[11px] text-[#66665D]">
                    Supports PDF, Screenshots, TXT/LOG up to 15MB
                  </span>
                </div>

                {uploadedAttachments.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {uploadedAttachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[#EAF0E8]/50 border border-[#174B39]/20"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FiPaperclip className="text-[#174B39]" />
                          <span className="font-medium text-[#252720] truncate">{att.fileName}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E0D3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E7E0D3] text-xs font-semibold text-[#66665D] hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="animate-spin text-sm" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="text-sm" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default SapSupportPortal;
