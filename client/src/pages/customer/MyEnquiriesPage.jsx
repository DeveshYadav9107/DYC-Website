import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyInquiries, getMyInquiryDetails, addInquiryMessage, uploadInquiryAttachment } from '../../services/api';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiPlus,
  FiCalendar,
  FiArrowUpRight,
  FiInbox,
  FiUser,
  FiRefreshCw,
  FiMessageSquare,
  FiClock,
  FiPaperclip,
  FiSend,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiDownload,
  FiFileText,
  FiTag,
  FiExternalLink,
  FiUploadCloud,
} from 'react-icons/fi';

const statusConfig = {
  new: { label: 'Received', bg: 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/20' },
  contacted: { label: 'In Review', bg: 'bg-[#FDFBF7] text-[#B88A3B] border-[#B88A3B]/30' },
  qualified: { label: 'Qualified', bg: 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/30' },
  proposal: { label: 'Proposal Sent', bg: 'bg-[#FDFBF7] text-[#B88A3B] border-[#B88A3B]/40' },
  converted: { label: 'Active Service', bg: 'bg-[#174B39] text-white border-[#103728]' },
  closed: { label: 'Closed', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const priorityConfig = {
  urgent: { label: 'Urgent', bg: 'bg-red-50 text-red-700 border-red-200' },
  high: { label: 'High', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  normal: { label: 'Normal', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  low: { label: 'Low', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const MyEnquiriesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering tabs: 'all' | 'open' | 'in-progress' | 'closed'
  const [activeTab, setActiveTab] = useState('all');

  // Selected Ticket for Details & Conversation
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);

  // Two-way conversation composer
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [composerError, setComposerError] = useState('');

  // Fetch customer's enquiries
  const fetchEnquiries = async (autoSelectId = null) => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyInquiries();
      const list = Array.isArray(data) ? data : [];
      setInquiries(list);

      const targetId = autoSelectId || searchParams.get('id');
      if (targetId) {
        const match = list.find((item) => item._id === targetId || item.enquiryNumber === targetId);
        if (match) {
          handleOpenTicket(match);
        }
      }
    } catch (err) {
      console.error('Error fetching customer enquiries:', err);
      setError('Failed to load your enquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const directId = searchParams.get('id');
    fetchEnquiries(directId);
  }, []);

  // Open ticket conversation & details
  const handleOpenTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setComposerError('');
    setReplyMessage('');
    setReplyAttachments([]);
    setTicketDetailsLoading(true);

    try {
      const fullDoc = await getMyInquiryDetails(ticket._id);
      if (fullDoc) {
        setSelectedTicket(fullDoc);
      }
    } catch (err) {
      console.warn('Could not fetch single ticket details, falling back to local item:', err);
    } finally {
      setTicketDetailsLoading(false);
    }
  };

  // Close ticket detail modal/drawer
  const handleCloseTicket = () => {
    setSelectedTicket(null);
    if (searchParams.get('id')) {
      searchParams.delete('id');
      setSearchParams(searchParams, { replace: true });
    }
  };

  // Upload attachment for message reply
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    setComposerError('');
    try {
      const res = await uploadInquiryAttachment(file);
      if (res && res.fileUrl) {
        setReplyAttachments((prev) => [...prev, res]);
      }
    } catch (err) {
      console.error('Attachment upload failed:', err);
      setComposerError(err.response?.data?.message || 'Failed to upload file attachment.');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Post reply into ticket conversation
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    if (selectedTicket.status === 'closed') {
      setComposerError('This ticket is closed. New replies are no longer available.');
      return;
    }

    setSendingReply(true);
    setComposerError('');

    try {
      const payload = {
        message: replyMessage.trim(),
        attachments: replyAttachments,
      };

      const newMsg = await addInquiryMessage(selectedTicket._id, payload);

      // Append message to currently open ticket
      setSelectedTicket((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), newMsg],
      }));

      // Update parent list message count
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === selectedTicket._id
            ? { ...item, messages: [...(item.messages || []), newMsg] }
            : item
        )
      );

      setReplyMessage('');
      setReplyAttachments([]);
    } catch (err) {
      console.error('Failed to send reply:', err);
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setComposerError(msg);
    } finally {
      setSendingReply(false);
    }
  };

  // Filtered tickets based on active tab
  const filteredInquiries = useMemo(() => {
    if (activeTab === 'open') {
      return inquiries.filter((inq) => ['new', 'contacted', 'qualified', 'proposal', 'converted'].includes(inq.status));
    }
    if (activeTab === 'in-progress') {
      return inquiries.filter((inq) => ['contacted', 'qualified', 'proposal'].includes(inq.status));
    }
    if (activeTab === 'closed') {
      return inquiries.filter((inq) => inq.status === 'closed');
    }
    return inquiries;
  }, [inquiries, activeTab]);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8F5EE] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-[#E7E0D3]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 text-xs font-bold mb-2">
                <FiUser className="text-xs" />
                <span>Client Enquiries & Support Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight">
                My Enquiries & Tickets
              </h1>
              <p className="text-xs sm:text-sm text-[#66665D] mt-1">
                Direct two-way communication for consulting, SAP maintenance tickets, and staffing requirements for{' '}
                <span className="font-semibold text-[#174B39]">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchEnquiries()}
                disabled={loading}
                className="p-2.5 rounded-full border border-[#E7E0D3] bg-white text-[#66665D] hover:text-[#174B39] hover:bg-[#FDFBF7] transition cursor-pointer"
                title="Refresh inquiries"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_2px_10px_rgba(23,75,57,0.2)] transition"
              >
                <FiPlus className="w-4 h-4 text-[#D7B875]" />
                <span>New Ticket / Enquiry</span>
              </Link>
            </div>
          </div>

          {/* Filtering Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Requests', count: inquiries.length },
              {
                id: 'open',
                label: 'Open',
                count: inquiries.filter((i) => i.status !== 'closed').length,
              },
              {
                id: 'in-progress',
                label: 'In Progress',
                count: inquiries.filter((i) => ['contacted', 'qualified', 'proposal'].includes(i.status)).length,
              },
              {
                id: 'closed',
                label: 'Closed',
                count: inquiries.filter((i) => i.status === 'closed').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#174B39] text-white shadow-sm'
                    : 'bg-white border border-[#E7E0D3] text-[#66665D] hover:text-[#252720] hover:bg-[#FDFBF7]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-[#66665D]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="mt-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#174B39] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-[#66665D] font-medium">Loading your enquiries...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-center max-w-md mx-auto">
                <p className="text-sm font-semibold text-[#DC2626] mb-3">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchEnquiries()}
                  className="px-4 py-2 rounded-full bg-[#DC2626] text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-10 sm:p-16 text-center max-w-xl mx-auto shadow-[0_4px_24px_rgba(37,39,32,0.04)]">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#252720]">
                  {activeTab === 'all' ? 'No enquiries submitted yet' : `No ${activeTab} enquiries`}
                </h3>
                <p className="text-xs sm:text-sm text-[#66665D] mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                  Have an enterprise SAP requirement, technical support issue, or staffing order? Submit your request to begin tracked discussion with DY&C experts.
                </p>
                <div className="mt-6">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(23,75,57,0.25)] transition"
                  >
                    <span>Create Ticket or Requirement</span>
                    <FiArrowUpRight className="w-4 h-4 text-[#D7B875]" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => {
                  const statusInfo = statusConfig[inquiry.status] || statusConfig.new;
                  const priorityInfo = priorityConfig[inquiry.priority] || priorityConfig.normal;
                  const dateStr = new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  const messagesCount = inquiry.messages?.length || 0;
                  const hasAttachments = (inquiry.attachments?.length || 0) > 0;

                  return (
                    <div
                      key={inquiry._id}
                      className="bg-white rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-[0_2px_12px_rgba(37,39,32,0.03)] hover:border-[#174B39]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Top Meta Line: Reference, Type, Status, Priority */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#174B39] bg-[#EAF0E8] px-2.5 py-0.5 rounded-md border border-[#174B39]/20">
                            {inquiry.enquiryNumber || `DYC-${inquiry._id.slice(-6).toUpperCase()}`}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}
                          >
                            {statusInfo.label}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${priorityInfo.bg}`}
                          >
                            {priorityInfo.label} Priority
                          </span>

                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720] uppercase tracking-wide">
                            {inquiry.type?.replace(/-/g, ' ')}
                          </span>

                          {inquiry.sapModule && (
                            <span className="text-xs font-semibold text-[#174B39]">
                              • Module: {inquiry.sapModule}
                            </span>
                          )}
                        </div>

                        {/* Title / Service / Subject */}
                        <h3 className="text-base font-bold text-[#252720] leading-snug">
                          {inquiry.service || inquiry.subject || `${inquiry.type?.replace(/-/g, ' ').toUpperCase()} Requirement`}
                        </h3>

                        {/* Snippet */}
                        {inquiry.message && (
                          <p className="text-xs text-[#66665D] line-clamp-2 leading-relaxed">
                            {inquiry.message}
                          </p>
                        )}

                        {/* Bottom Info: Dates, Attachments, Conversation info */}
                        <div className="flex items-center gap-4 text-xs text-[#8A897C] pt-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="w-3.5 h-3.5" />
                            <span>Submitted: {dateStr}</span>
                          </div>

                          {messagesCount > 0 && (
                            <div className="flex items-center gap-1 text-[#174B39] font-medium">
                              <FiMessageSquare className="w-3.5 h-3.5" />
                              <span>{messagesCount} message{messagesCount === 1 ? '' : 's'}</span>
                            </div>
                          )}

                          {hasAttachments && (
                            <div className="flex items-center gap-1 text-[#66665D]">
                              <FiPaperclip className="w-3.5 h-3.5" />
                              <span>{inquiry.attachments.length} attachment{inquiry.attachments.length === 1 ? '' : 's'}</span>
                            </div>
                          )}

                          {inquiry.closedAt && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <FiLock className="w-3 h-3" />
                              <span>Closed on {new Date(inquiry.closedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenTicket(inquiry)}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#174B39] text-white hover:bg-[#103728] shadow-xs transition cursor-pointer"
                        >
                          <FiMessageSquare className="w-3.5 h-3.5 text-[#D7B875]" />
                          <span>View Details & Conversation</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details & Two-Way Conversation Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-[#252720]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#E7E0D3] shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E7E0D3] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#174B39] bg-[#EAF0E8] px-2.5 py-0.5 rounded-md border border-[#174B39]/20">
                    {selectedTicket.enquiryNumber || `DYC-${selectedTicket._id.slice(-6).toUpperCase()}`}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      statusConfig[selectedTicket.status]?.bg || statusConfig.new.bg
                    }`}
                  >
                    {statusConfig[selectedTicket.status]?.label || selectedTicket.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                      priorityConfig[selectedTicket.priority]?.bg || priorityConfig.normal.bg
                    }`}
                  >
                    {priorityConfig[selectedTicket.priority]?.label || selectedTicket.priority} Priority
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#252720] truncate">
                  {selectedTicket.service || selectedTicket.subject || 'Enquiry Requirement'}
                </h2>
                <p className="text-xs text-[#66665D] mt-0.5">
                  Logged on {new Date(selectedTicket.createdAt).toLocaleString()} · Type:{' '}
                  <span className="font-semibold text-[#252720] uppercase">{selectedTicket.type?.replace(/-/g, ' ')}</span>
                  {selectedTicket.sapModule && ` · Module: ${selectedTicket.sapModule}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseTicket}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#252720] hover:bg-[#E7E0D3] transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {ticketDetailsLoading && (
                <div className="p-3 text-center text-xs text-[#66665D] bg-[#EAF0E8]/50 rounded-xl flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#174B39] border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing conversation...</span>
                </div>
              )}

              {/* Closure Notice Banner */}
              {selectedTicket.status === 'closed' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3">
                  <FiLock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">This ticket has been closed.</p>
                    <p className="text-slate-600">
                      You can view the full conversation history and download past attachments, but new replies are no longer available.
                      {selectedTicket.closureReason && ` Resolution reason: "${selectedTicket.closureReason}".`}
                    </p>
                    {selectedTicket.closedAt && (
                      <p className="text-[11px] text-slate-400">
                        Closed on {new Date(selectedTicket.closedAt).toLocaleString()}
                        {selectedTicket.closedByName ? ` by ${selectedTicket.closedByName}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section 1: Original Submitted Request */}
              <div className="bg-[#FDFBF7] border border-[#E7E0D3] rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5">
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>Original Scope & Submission Details</span>
                </h3>

                <p className="text-xs sm:text-sm text-[#252720] whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message || selectedTicket.requirement || 'No additional scope notes provided.'}
                </p>

                {/* Structured Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E7E0D3] text-xs">
                  {selectedTicket.company && (
                    <div>
                      <span className="text-[#8A897C] block text-[10px] uppercase font-bold">Company</span>
                      <span className="font-semibold text-[#252720]">{selectedTicket.company}</span>
                    </div>
                  )}
                  {selectedTicket.sapModule && (
                    <div>
                      <span className="text-[#8A897C] block text-[10px] uppercase font-bold">SAP Module</span>
                      <span className="font-semibold text-[#252720]">{selectedTicket.sapModule}</span>
                    </div>
                  )}
                  {selectedTicket.supportType && (
                    <div>
                      <span className="text-[#8A897C] block text-[10px] uppercase font-bold">Support Scope</span>
                      <span className="font-semibold text-[#252720]">{selectedTicket.supportType}</span>
                    </div>
                  )}
                  {selectedTicket.sapEnvironment && (
                    <div>
                      <span className="text-[#8A897C] block text-[10px] uppercase font-bold">Environment</span>
                      <span className="font-semibold text-[#252720]">{selectedTicket.sapEnvironment}</span>
                    </div>
                  )}
                </div>

                {/* Initial Request Attachments */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="pt-3 border-t border-[#E7E0D3]">
                    <span className="text-[#8A897C] block text-[10px] uppercase font-bold mb-2">
                      Original Attachments ({selectedTicket.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E7E0D3] text-xs font-semibold text-[#174B39] hover:bg-[#EAF0E8] transition"
                        >
                          <FiPaperclip className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">{att.fileName}</span>
                          <FiDownload className="w-3 h-3 text-[#66665D]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Chronological Conversation Thread */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#252720] flex items-center gap-1.5">
                    <FiMessageSquare className="w-3.5 h-3.5 text-[#174B39]" />
                    <span>Conversation History ({selectedTicket.messages?.length || 0})</span>
                  </h3>
                  <span className="text-[11px] text-[#66665D]">Chronological DY&C Support Desk Thread</span>
                </div>

                {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                  <div className="py-8 text-center text-xs text-[#66665D] bg-[#FDFBF7] rounded-xl border border-dashed border-[#E7E0D3]">
                    <p>No messages exchanged yet. Use the reply composer below to send a message to our support team.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTicket.messages.map((msg, index) => {
                      const isCustomer = msg.senderRole === 'customer' || msg.senderRole === 'client';
                      const msgDate = new Date(msg.createdAt).toLocaleString();

                      return (
                        <div
                          key={msg._id || index}
                          className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1 text-[11px]">
                            <span className="font-bold text-[#252720]">
                              {isCustomer ? 'You (Client)' : (msg.senderName || 'DY&C Consulting Team')}
                            </span>
                            {!isCustomer && (
                              <span className="px-1.5 py-0.2 rounded-md bg-[#EAF0E8] text-[#174B39] font-bold text-[9px] uppercase border border-[#174B39]/20">
                                Official Staff
                              </span>
                            )}
                            <span className="text-[#8A897C]">{msgDate}</span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isCustomer
                                ? 'bg-[#174B39] text-white rounded-br-xs'
                                : 'bg-[#FDFBF7] text-[#252720] border border-[#E7E0D3] rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.message}</p>

                            {/* Message Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div
                                className={`mt-3 pt-2.5 border-t space-y-1.5 ${
                                  isCustomer ? 'border-white/20' : 'border-[#E7E0D3]'
                                }`}
                              >
                                {msg.attachments.map((att, aIdx) => (
                                  <a
                                    key={aIdx}
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                      isCustomer
                                        ? 'bg-white/10 hover:bg-white/20 text-white'
                                        : 'bg-white hover:bg-[#EAF0E8] text-[#174B39] border border-[#E7E0D3]'
                                    }`}
                                  >
                                    <FiPaperclip className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[220px]">{att.fileName}</span>
                                    <FiDownload className="w-3 h-3 ml-1" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Reply Composer */}
            <div className="p-4 sm:p-5 border-t border-[#E7E0D3] bg-[#FDFBF7] shrink-0">
              {selectedTicket.status === 'closed' ? (
                <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-600 font-medium">
                  This ticket has been closed. Conversation is read-only.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-3">
                  {composerError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                      <FiAlertCircle className="shrink-0" />
                      <span>{composerError}</span>
                    </div>
                  )}

                  {/* Attachment Previews */}
                  {replyAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {replyAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-[#E7E0D3] text-xs text-[#252720]"
                        >
                          <FiPaperclip className="w-3 h-3 text-[#174B39]" />
                          <span className="truncate max-w-[150px] font-medium">{att.fileName}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="text-[#64748B] hover:text-red-600"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Composer Input Area */}
                  <div className="flex items-end gap-2 bg-white border border-[#E7E0D3] rounded-2xl p-2.5 focus-within:border-[#174B39] focus-within:ring-2 focus-within:ring-[#174B39]/10 transition">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your response to the DY&C consulting desk..."
                      rows="2"
                      className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-[#252720] resize-none placeholder-[#8A897C] max-h-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSendReply(e);
                        }
                      }}
                    />

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        className={`p-2 rounded-xl text-[#66665D] hover:text-[#174B39] hover:bg-[#EAF0E8] transition cursor-pointer ${
                          uploadingAttachment ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        title="Attach supporting document / screenshot"
                      >
                        <FiPaperclip className="w-4 h-4" />
                        <input
                          type="file"
                          onChange={handleAttachmentUpload}
                          disabled={uploadingAttachment}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,.log,.xls,.xlsx,.csv"
                        />
                      </label>

                      {uploadingAttachment && (
                        <div className="w-4 h-4 border-2 border-[#174B39] border-t-transparent rounded-full animate-spin"></div>
                      )}

                      <button
                        type="submit"
                        disabled={sendingReply || !replyMessage.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#174B39] text-white hover:bg-[#103728] shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {sendingReply ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiSend className="w-3.5 h-3.5 text-[#D7B875]" />
                        )}
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default MyEnquiriesPage;
