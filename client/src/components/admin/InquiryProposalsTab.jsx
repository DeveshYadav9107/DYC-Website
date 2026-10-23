import { useState, useEffect, useCallback } from 'react';
import {
  FiFileText,
  FiPlus,
  FiDownload,
  FiEdit3,
  FiCopy,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSend,
  FiTrash2,
  FiAlertCircle,
  FiEye,
} from 'react-icons/fi';
import {
  getInquiryProposals,
  updateProposalStatus,
  reviseProposal,
  downloadProposalPdf,
  deleteProposal,
} from '../../services/api';

const InquiryProposalsTab = ({
  inquiry,
  onOpenCreate,
  onOpenEdit,
  onInquiryUpdated,
  showFeedback,
}) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchProposals = useCallback(async () => {
    if (!inquiry?._id) return;
    setLoading(true);
    try {
      const data = await getInquiryProposals(inquiry._id);
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load inquiry proposals', err);
      showFeedback('error', 'Failed to load proposals for this enquiry.');
    } finally {
      setLoading(false);
    }
  }, [inquiry?._id, showFeedback]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleDownload = async (proposal) => {
    setDownloadingId(proposal._id);
    try {
      showFeedback('info', `Preparing branded PDF for ${proposal.proposalNumber}...`);
      await downloadProposalPdf(proposal._id, proposal.proposalNumber);
      showFeedback('success', `Downloaded ${proposal.proposalNumber}.pdf successfully.`);
    } catch (err) {
      console.error('Failed to download PDF', err);
      showFeedback('error', 'Failed to generate proposal PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleStatusTransition = async (proposalId, nextStatus, note = '') => {
    setActionLoadingId(proposalId);
    try {
      const updated = await updateProposalStatus(proposalId, { status: nextStatus, note });
      setProposals((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, ...updated } : p))
      );
      showFeedback('success', `Proposal status changed to "${nextStatus}".`);
      if (onInquiryUpdated) {
        onInquiryUpdated();
      }
    } catch (err) {
      console.error('Failed to update proposal status', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update proposal status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevise = async (proposal) => {
    setActionLoadingId(proposal._id);
    try {
      showFeedback('info', `Creating revision from ${proposal.proposalNumber}...`);
      const newVersion = await reviseProposal(proposal._id);
      showFeedback('success', `Revised proposal ${newVersion.proposalNumber} created as draft.`);
      await fetchProposals();
      if (onOpenEdit) {
        onOpenEdit(newVersion);
      }
    } catch (err) {
      console.error('Failed to revise proposal', err);
      showFeedback('error', err.response?.data?.message || 'Failed to revise proposal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (proposal) => {
    if (!window.confirm(`Are you sure you want to delete draft proposal ${proposal.proposalNumber}?`)) {
      return;
    }

    setActionLoadingId(proposal._id);
    try {
      await deleteProposal(proposal._id);
      setProposals((prev) => prev.filter((p) => p._id !== proposal._id));
      showFeedback('success', `Proposal ${proposal.proposalNumber} deleted.`);
    } catch (err) {
      console.error('Failed to delete proposal', err);
      showFeedback('error', err.response?.data?.message || 'Failed to delete proposal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Draft
          </span>
        );
      case 'ready_for_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Ready for Review
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Sent to Client
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Accepted (Won)
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Declined
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-300">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FiFileText className="w-4 h-4 text-emerald-600" />
            <span>Commercial Proposals & Formal Quotations</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Formulate customized proposals with line items, milestone schedules, and branded PDF generation.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="px-4 py-2 rounded-xl bg-[#0B1528] hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create New Proposal</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading proposals from database...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && proposals.length === 0 && (
        <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-3">
            📄
          </div>
          <h5 className="font-bold text-sm text-slate-900 mb-1">No Proposals Created Yet</h5>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            This enquiry has not had a formal proposal drafted. Click below to initialize a draft with client details and requirements pre-filled.
          </p>
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Generate First Proposal</span>
          </button>
        </div>
      )}

      {/* Proposal Cards List */}
      {!loading && proposals.length > 0 && (
        <div className="space-y-4">
          {proposals.map((prop) => {
            const isBusy = actionLoadingId === prop._id;
            const isDownloading = downloadingId === prop._id;

            return (
              <div
                key={prop._id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                      {prop.proposalNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      v{prop.version || 1}
                    </span>
                    {renderStatusBadge(prop.status)}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Proposal Value
                    </span>
                    <span className="font-extrabold text-base text-slate-900 font-mono">
                      {prop.currencySymbol || '₹'}
                      {(prop.grandTotal || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Proposal Title & Summary */}
                <div>
                  <h5 className="font-bold text-sm text-slate-900 mb-1">{prop.title}</h5>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {prop.solutionSummary || prop.clientRequirementSummary || 'No summary available.'}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Line Items
                    </span>
                    <span className="font-semibold text-slate-800">
                      {prop.lineItems?.length || 0} Items
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Valid Until
                    </span>
                    <span className="font-semibold text-slate-800">
                      {prop.validUntil ? new Date(prop.validUntil).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Created By
                    </span>
                    <span className="font-semibold text-slate-800">
                      {prop.createdByName || 'Admin'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Created At
                    </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Private Internal Notes Banner if present */}
                {prop.internalNotes && (
                  <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <span className="font-bold shrink-0">🔒 Internal Note:</span>
                    <span className="italic">{prop.internalNotes}</span>
                  </div>
                )}

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {/* Status Lifecycle Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Status:</span>

                    {prop.status === 'draft' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusTransition(prop._id, 'ready_for_review')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                      >
                        Mark Ready for Review
                      </button>
                    )}

                    {['draft', 'ready_for_review'].includes(prop.status) && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusTransition(prop._id, 'sent')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition flex items-center gap-1"
                      >
                        <FiSend className="w-3 h-3" />
                        Mark as Sent
                      </button>
                    )}

                    {prop.status === 'sent' && (
                      <>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusTransition(prop._id, 'accepted')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition flex items-center gap-1"
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Client Accepted
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusTransition(prop._id, 'declined')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold transition flex items-center gap-1"
                        >
                          <FiXCircle className="w-3 h-3" />
                          Client Declined
                        </button>
                      </>
                    )}
                  </div>

                  {/* Document & Edit Operations */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {/* PDF Download Button */}
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownload(prop)}
                      className="px-3 py-1.5 rounded-lg bg-[#0B1528] hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-3.5 h-3.5" />
                          Download PDF
                        </>
                      )}
                    </button>

                    {/* Edit Draft */}
                    {['draft', 'ready_for_review'].includes(prop.status) && (
                      <button
                        type="button"
                        onClick={() => onOpenEdit(prop)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1 transition"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}

                    {/* Revise (Create v2 / v3) */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRevise(prop)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-1 transition"
                      title="Create a revised version (e.g. v2) preserving this record"
                    >
                      <FiCopy className="w-3.5 h-3.5" />
                      Revise
                    </button>

                    {/* Delete Draft */}
                    {prop.status === 'draft' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(prop)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete draft proposal"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InquiryProposalsTab;
