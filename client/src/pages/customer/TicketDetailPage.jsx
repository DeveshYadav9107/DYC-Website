import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getSupportTicketDetails,
  postTicketMessage,
  rateTicketCSAT,
  uploadTicketAttachment,
} from '../../services/api';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiArrowLeft,
  FiClock,
  FiPaperclip,
  FiSend,
  FiCheckCircle,
  FiStar,
  FiFileText,
  FiCpu,
  FiShield,
  FiDownload,
  FiUploadCloud,
  FiAlertCircle,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiUser,
} from 'react-icons/fi';

const priorityBadges = {
  'P1 - Critical': 'bg-red-50 text-red-700 border-red-200',
  'P2 - High': 'bg-amber-50 text-amber-800 border-amber-200',
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

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reply message
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]);

  // CSAT Rating
  const [ratingValue, setRatingValue] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const fetchTicket = async () => {
    try {
      const data = await getSupportTicketDetails(id);
      setTicket(data);
      if (data?.rating) {
        setRatingValue(data.rating);
        setFeedbackText(data.feedback || '');
        setRatingSuccess(true);
      }
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load support ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

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

  const removeAttachment = (idx) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await postTicketMessage(ticket._id, {
        message: replyText.trim(),
        attachments: replyAttachments,
      });
      setReplyText('');
      setReplyAttachments([]);
      fetchTicket();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      await rateTicketCSAT(ticket._id, {
        rating: ratingValue,
        feedback: feedbackText.trim(),
      });
      setRatingSuccess(true);
      fetchTicket();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#F8F5EE] py-20 flex items-center justify-center">
          <div className="text-center">
            <FiRefreshCw className="w-8 h-8 text-[#174B39] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#252720]">Loading ticket conversation...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !ticket) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#F8F5EE] py-20 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-[#E7E0D3] p-8 max-w-md w-full text-center shadow-xs">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-[#252720]">Support Ticket Not Found</h3>
            <p className="text-xs sm:text-sm text-[#66665D] mt-1 mb-6">
              {error || 'This ticket could not be retrieved. Please check ticket number or your access permissions.'}
            </p>
            <Link
              to="/support/tickets"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B39] text-white text-xs font-semibold"
            >
              <FiArrowLeft />
              <span>Back to Support Portal</span>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const priorityBadge = priorityBadges[ticket.priority] || priorityBadges['P3 - Medium'];
  const statusBadge = statusBadges[ticket.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8F5EE] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Back Navigation & Ticket Title */}
          <div>
            <Link
              to="/support/tickets"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174B39] hover:underline mb-3"
            >
              <FiArrowLeft />
              <span>Back to All Tickets</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7E0D3] shadow-xs">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold px-3 py-1 rounded-lg bg-[#174B39]/10 text-[#174B39]">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${priorityBadge}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge}`}>
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
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
                  {ticket.subject}
                </h1>
                <p className="text-xs text-[#66665D]">
                  Logged on {new Date(ticket.createdAt).toLocaleString('en-IN')} by <strong>{ticket.clientName}</strong> ({ticket.companyName})
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={fetchTicket}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7E0D3] text-xs font-semibold text-[#252720] hover:bg-slate-50 transition"
                >
                  <FiRefreshCw className="text-xs" />
                  <span>Refresh Thread</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resolution Banner if Resolved or Closed */}
          {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
            <div className="bg-[#EAF0E8] border border-[#174B39]/30 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#174B39] text-white flex items-center justify-center shrink-0 text-lg mt-0.5">
                  <FiCheck />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-serif font-bold text-[#174B39]">
                    Support Incident Resolved
                  </h3>
                  <p className="text-xs sm:text-sm text-[#252720]">
                    {ticket.resolutionSummary || 'The reported issue has been diagnosed and resolved by the SAP consulting team.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {ticket.transportRequest && (
                      <div className="bg-white/80 p-3 rounded-xl border border-[#174B39]/20">
                        <span className="text-[#66665D] block text-[11px] uppercase font-bold tracking-wider">Transport Request (TR)</span>
                        <span className="font-mono font-bold text-[#174B39] text-sm">{ticket.transportRequest}</span>
                      </div>
                    )}
                    {ticket.rootCause && (
                      <div className="bg-white/80 p-3 rounded-xl border border-[#174B39]/20">
                        <span className="text-[#66665D] block text-[11px] uppercase font-bold tracking-wider">Root Cause Analysis</span>
                        <span className="text-[#252720] font-medium">{ticket.rootCause}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Split 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Metadata, SLA, Attachments, CSAT */}
            <div className="space-y-6">
              
              {/* SAP Environment & Parameters */}
              <div className="bg-white rounded-2xl border border-[#E7E0D3] p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5 border-b border-[#E7E0D3] pb-2">
                  <FiCpu className="text-sm" />
                  <span>SAP System Parameters</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E7E0D3]/50">
                    <span className="text-[#66665D]">SAP Module:</span>
                    <span className="font-semibold text-[#252720]">{ticket.module}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E7E0D3]/50">
                    <span className="text-[#66665D]">Environment:</span>
                    <span className="font-semibold text-[#252720]">{ticket.environment}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E7E0D3]/50">
                    <span className="text-[#66665D]">T-Code:</span>
                    <span className="font-mono font-semibold text-[#174B39]">{ticket.tCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E7E0D3]/50">
                    <span className="text-[#66665D]">Classification:</span>
                    <span className="font-semibold text-[#252720]">{ticket.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E7E0D3]/50">
                    <span className="text-[#66665D]">Assigned Lead:</span>
                    <span className="font-semibold text-[#174B39]">{ticket.assignedToName || 'Under Triage'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#66665D]">Support Team:</span>
                    <span className="font-semibold text-[#252720]">{ticket.assignedTeam || 'DY&C SAP Enterprise AMS'}</span>
                  </div>
                </div>
              </div>

              {/* SLA Metrics Card */}
              <div className="bg-white rounded-2xl border border-[#E7E0D3] p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5 border-b border-[#E7E0D3] pb-2">
                  <FiClock className="text-sm" />
                  <span>SLA & Resolution Deadlines</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#F8F5EE] p-3 rounded-xl border border-[#E7E0D3]/60">
                    <span className="text-[11px] text-[#66665D] block">Target Resolution Window:</span>
                    <span className="text-sm font-serif font-bold text-[#174B39]">{ticket.slaTargetHours} Hours SLA</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#66665D] block">Committed SLA Deadline:</span>
                    <p className="font-medium text-[#252720]">
                      {ticket.slaResolutionDeadline ? new Date(ticket.slaResolutionDeadline).toLocaleString('en-IN') : 'N/A'}
                    </p>
                  </div>

                  {ticket.resolvedAt && (
                    <div className="space-y-1.5 pt-2 border-t border-[#E7E0D3]/50">
                      <span className="text-[11px] text-[#66665D] block">Actual Resolution Time:</span>
                      <p className="font-medium text-emerald-800">
                        {new Date(ticket.resolvedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Initial Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E7E0D3] p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5 border-b border-[#E7E0D3] pb-2">
                    <FiPaperclip className="text-sm" />
                    <span>Ticket Attachments & Logs ({ticket.attachments.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {ticket.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] hover:bg-[#EAF0E8]/50 hover:border-[#174B39]/40 text-xs transition group"
                      >
                        <span className="flex items-center gap-2 truncate font-medium text-[#252720] group-hover:text-[#174B39]">
                          <FiFileText className="text-sm text-[#174B39]" />
                          <span className="truncate">{file.fileName}</span>
                        </span>
                        <FiDownload className="text-[#66665D] group-hover:text-[#174B39] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* CSAT Rating Card (when ticket is Resolved or Closed) */}
              {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                <div className="bg-white rounded-2xl border border-[#E7E0D3] p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#174B39] flex items-center gap-1.5 border-b border-[#E7E0D3] pb-2">
                    <FiStar className="text-sm text-amber-500" />
                    <span>Client Satisfaction (CSAT)</span>
                  </h3>

                  {ratingSuccess ? (
                    <div className="bg-[#EAF0E8]/60 p-4 rounded-xl border border-[#174B39]/20 text-center space-y-1">
                      <div className="text-amber-500 text-lg">
                        {'★'.repeat(ratingValue)}{'☆'.repeat(5 - ratingValue)}
                      </div>
                      <p className="text-xs font-bold text-[#174B39]">Thank you for your rating!</p>
                      {feedbackText && (
                        <p className="text-[11px] text-[#66665D] italic mt-1">"{feedbackText}"</p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleRatingSubmit} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#66665D] block mb-1">
                          How satisfied are you with this resolution?
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingValue(star)}
                              className="text-2xl text-amber-400 hover:scale-110 transition"
                            >
                              {star <= ratingValue ? '★' : '☆'}
                            </button>
                          ))}
                          <span className="text-xs font-semibold text-[#252720] ml-2">
                            {ratingValue} / 5 Stars
                          </span>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Optional feedback comment..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingRating}
                        className="w-full py-2 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold shadow-xs transition"
                      >
                        {submittingRating ? 'Saving Rating...' : 'Submit CSAT Rating'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Activity Timeline */}
              <div className="bg-white rounded-2xl border border-[#E7E0D3] p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#66665D] border-b border-[#E7E0D3] pb-2">
                  Activity & Audit Trail
                </h3>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {(ticket.activityLogs || []).map((log, idx) => (
                    <div key={idx} className="text-[11px] text-[#66665D] border-l-2 border-[#174B39]/40 pl-2.5 py-0.5">
                      <p className="text-[#252720] font-medium">{log.action}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {log.performedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Communication Thread & Reply Box */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Messages Container */}
              <div className="bg-white rounded-2xl border border-[#E7E0D3] p-6 shadow-xs space-y-6 min-h-[450px] flex flex-col justify-between">
                
                {/* Message List */}
                <div className="space-y-6">
                  <div className="border-b border-[#E7E0D3] pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#252720] flex items-center gap-2">
                      <FiUser className="text-[#174B39]" />
                      <span>Communication Thread ({ticket.messages?.length || 0})</span>
                    </h3>
                    <span className="text-xs text-[#66665D]">
                      Direct updates from certified SAP consultants
                    </span>
                  </div>

                  {ticket.messages?.map((msg, index) => {
                    const isClient = msg.senderRole === 'client' || msg.senderRole === 'customer';

                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-xs">
                          <span className="font-bold text-[#252720]">
                            {msg.senderName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isClient
                                ? 'bg-[#FDFBF7] text-[#B88A3B] border border-[#B88A3B]/30'
                                : 'bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/30'
                            }`}
                          >
                            {isClient ? 'Client' : 'SAP Support Consultant'}
                          </span>
                          <span className="text-[10px] text-[#66665D]">
                            {new Date(msg.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-xs ${
                            isClient
                              ? 'bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720] rounded-tr-none'
                              : 'bg-[#174B39] text-white rounded-tl-none'
                          }`}
                        >
                          {msg.message}

                          {/* Message Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-white/20 space-y-1.5">
                              {msg.attachments.map((att, aIdx) => (
                                <a
                                  key={aIdx}
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                                    isClient
                                      ? 'bg-white hover:bg-slate-50 border border-[#E7E0D3] text-[#174B39]'
                                      : 'bg-black/20 hover:bg-black/30 text-white'
                                  }`}
                                >
                                  <FiPaperclip className="shrink-0" />
                                  <span className="truncate">{att.fileName}</span>
                                  <FiDownload className="ml-auto shrink-0" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <div className="pt-6 border-t border-[#E7E0D3]">
                  {ticket.status === 'Closed' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-[#66665D]">
                      This support ticket has been closed. If you require further assistance or a new issue has occurred, please raise a new ticket.
                    </div>
                  ) : (
                    <form onSubmit={handlePostReply} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#252720] uppercase tracking-wider mb-1.5">
                          Post Reply or Add Information
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Type your response, clarify error messages, or confirm testing results in QAS/PRD..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#174B39]"
                        />
                      </div>

                      {/* Attachment preview */}
                      {replyAttachments.length > 0 && (
                        <div className="space-y-1.5">
                          {replyAttachments.map((att, idx) => (
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

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E7E0D3] bg-[#FDFBF7] hover:bg-white text-xs font-semibold text-[#174B39] transition">
                          <FiUploadCloud className="text-sm" />
                          <span>{uploadingAttachment ? 'Uploading...' : 'Attach Log / Image'}</span>
                          <input
                            type="file"
                            className="hidden"
                            disabled={uploadingAttachment}
                            onChange={handleFileUpload}
                            accept=".png,.jpg,.jpeg,.pdf,.txt,.log,.docx,.xlsx"
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={submittingReply || !replyText.trim() || uploadingAttachment}
                          className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition disabled:opacity-50"
                        >
                          {submittingReply ? (
                            <>
                              <FiRefreshCw className="animate-spin text-sm" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <FiSend className="text-sm" />
                              <span>Send Update</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default TicketDetailPage;
