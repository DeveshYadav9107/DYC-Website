import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getInquiries,
  getInquiry,
  getAssignableTeam,
  updateInquiryStatus,
  assignInquiry,
  manageFollowUp,
  addInquiryNote,
  deleteInquiry,
  exportInquiriesCsv,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiTrash2,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiLayers,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiUser,
  FiCheck,
  FiAlertCircle,
  FiSend,
  FiAward,
  FiTarget,
  FiTag,
  FiActivity,
  FiSliders,
  FiCheckSquare,
  FiXCircle,
  FiFileText,
} from 'react-icons/fi';
import ProposalEditorModal from '../../components/admin/ProposalEditorModal';
import InquiryProposalsTab from '../../components/admin/InquiryProposalsTab';

const AdminInquiries = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Data State
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search Controls (synchronized with URL params)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('leadStage') || searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'all');
  const [assignedFilter, setAssignedFilter] = useState(searchParams.get('assignedTo') || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [followUpFilter, setFollowUpFilter] = useState(searchParams.get('followUp') || 'all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(10);

  // Selected Detail Modal & Workspace State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'actions' | 'followup' | 'notes' | 'timeline'
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Forms in detail modal
  const [newNoteText, setNewNoteText] = useState('');
  const [followUpForm, setFollowUpForm] = useState({ date: '', note: '' });
  const [followUpOutcome, setFollowUpOutcome] = useState('');

  // Proposal Generator Modal State
  const [isProposalEditorOpen, setIsProposalEditorOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch assignable team members once
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const team = await getAssignableTeam();
        setTeamMembers(Array.isArray(team) ? team : []);
      } catch (err) {
        console.error('Failed to load team members', err);
      }
    };
    fetchTeam();
  }, []);

  // Show auto-dismissing toast feedback
  const showFeedback = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Main Fetch Inquiries function
  const fetchInquiriesList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch.trim() || undefined,
        leadStage: stageFilter !== 'all' ? stageFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        assignedTo: assignedFilter !== 'all' ? assignedFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        followUpFilter: followUpFilter !== 'all' ? followUpFilter : undefined,
        sortBy,
        sortOrder,
      };

      const res = await getInquiries(params);

      if (res && res.inquiries) {
        setInquiries(res.inquiries);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else if (Array.isArray(res)) {
        setInquiries(res);
        setPagination({ total: res.length, page: 1, limit: res.length, totalPages: 1 });
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
      setError('Failed to load enquiries from server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, stageFilter, priorityFilter, assignedFilter, typeFilter, followUpFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchInquiriesList();
  }, [fetchInquiriesList]);

  // Open inquiry if `id` parameter is present in URL
  const deepLinkedId = searchParams.get('id');
  useEffect(() => {
    if (deepLinkedId) {
      const loadDeepLinked = async () => {
        try {
          setDetailLoading(true);
          const fullDoc = await getInquiry(deepLinkedId);
          if (fullDoc) {
            setSelectedInquiry(fullDoc);
          }
        } catch (err) {
          console.error('Failed to load deep-linked enquiry', err);
        } finally {
          setDetailLoading(false);
        }
      };
      loadDeepLinked();
    }
  }, [deepLinkedId]);

  // Open full detail modal
  const handleOpenDetail = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setDetailTab('overview');
    try {
      const fullDoc = await getInquiry(inquiry._id);
      if (fullDoc) {
        setSelectedInquiry(fullDoc);
      }
    } catch {
      // Use existing record if single fetch fails
    }
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setSelectedInquiry(null);
    if (searchParams.get('id')) {
      searchParams.delete('id');
      setSearchParams(searchParams, { replace: true });
    }
  };

  // Status & Stage Change Handler
  const handleStageChange = async (newStage, newStatus = null) => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      const payload = { leadStage: newStage };
      if (newStatus) payload.status = newStatus;

      const updated = await updateInquiryStatus(selectedInquiry._id, payload);
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...updated } : item))
      );
      showFeedback('success', `Lead stage updated to "${newStage}".`);
    } catch (err) {
      console.error('Failed to update stage', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update stage.');
    } finally {
      setActionLoading(false);
    }
  };

  // Priority Change Handler
  const handlePriorityChange = async (newPriority) => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      const updated = await updateInquiryStatus(selectedInquiry._id, { priority: newPriority });
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...updated } : item))
      );
      showFeedback('success', `Priority changed to "${newPriority.toUpperCase()}".`);
    } catch (err) {
      console.error('Failed to update priority', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update priority.');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign Team Member Handler
  const handleAssignMember = async (targetUserId) => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      const updated = await assignInquiry(selectedInquiry._id, targetUserId);
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...updated } : item))
      );
      showFeedback('success', targetUserId === 'unassigned' ? 'Lead unassigned.' : 'Lead assigned to team member.');
    } catch (err) {
      console.error('Failed to assign lead', err);
      showFeedback('error', err.response?.data?.message || 'Failed to assign lead.');
    } finally {
      setActionLoading(false);
    }
  };

  // Schedule Follow-up Handler
  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpForm.date || !selectedInquiry) return;

    setActionLoading(true);
    try {
      const updated = await manageFollowUp(selectedInquiry._id, {
        action: 'schedule',
        nextFollowUpAt: followUpForm.date,
        followUpNote: followUpForm.note,
      });
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...updated } : item))
      );
      setFollowUpForm({ date: '', note: '' });
      showFeedback('success', 'Follow-up scheduled successfully.');
    } catch (err) {
      console.error('Failed to schedule follow-up', err);
      showFeedback('error', err.response?.data?.message || 'Failed to schedule follow-up.');
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Follow-up Handler
  const handleCompleteFollowUp = async () => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      const updated = await manageFollowUp(selectedInquiry._id, {
        action: 'complete',
        followUpNote: followUpOutcome,
      });
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...updated } : item))
      );
      setFollowUpOutcome('');
      showFeedback('success', 'Follow-up marked as completed.');
    } catch (err) {
      console.error('Failed to complete follow-up', err);
      showFeedback('error', err.response?.data?.message || 'Failed to complete follow-up.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Internal Admin Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedInquiry) return;

    setActionLoading(true);
    try {
      const updated = await addInquiryNote(selectedInquiry._id, newNoteText.trim());
      setSelectedInquiry(updated);
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...updated } : item))
      );
      setNewNoteText('');
      showFeedback('success', 'Internal note recorded.');
    } catch (err) {
      console.error('Failed to add note', err);
      showFeedback('error', err.response?.data?.message || 'Failed to save note.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id) => {
    setActionLoading(true);
    try {
      await deleteInquiry(id);
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(null);
      }
      setDeleteConfirmId(null);
      showFeedback('success', 'Enquiry permanently deleted.');
    } catch (err) {
      console.error('Failed to delete inquiry', err);
      showFeedback('error', err.response?.data?.message || 'Failed to delete inquiry.');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = async () => {
    try {
      showFeedback('success', 'Generating sanitized CSV export...');
      const params = {
        search: debouncedSearch.trim() || undefined,
        leadStage: stageFilter !== 'all' ? stageFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        assignedTo: assignedFilter !== 'all' ? assignedFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        followUpFilter: followUpFilter !== 'all' ? followUpFilter : undefined,
      };

      const blob = await exportInquiriesCsv(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DYC_Leads_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showFeedback('success', 'Export downloaded successfully.');
    } catch (err) {
      console.error('Failed to export CSV', err);
      showFeedback('error', 'Failed to generate CSV export.');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStageFilter('all');
    setPriorityFilter('all');
    setAssignedFilter('all');
    setTypeFilter('all');
    setFollowUpFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearch ||
    stageFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assignedFilter !== 'all' ||
    typeFilter !== 'all' ||
    followUpFilter !== 'all';

  // Badges & Labels Helpers
  const renderStageBadge = (stage) => {
    switch (stage) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mr-1.5"></span>
            New Lead
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0E8] text-[#2563EB] border border-[#DBEAFE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mr-1.5"></span>
            Contacted
          </span>
        );
      case 'qualified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0E8] text-[#7C3AED] border border-[#DDD6FE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mr-1.5"></span>
            Qualified
          </span>
        );
      case 'proposal-sent':
      case 'proposal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F8FC] text-[#0284C7] border border-[#BAE6FD]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mr-1.5"></span>
            Proposal Sent
          </span>
        );
      case 'won':
      case 'converted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#15803D] border border-[#D1FAE5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mr-1.5"></span>
            Won
          </span>
        );
      case 'lost':
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] mr-1.5"></span>
            Lost
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            {stage || 'New'}
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse"></span>
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
            High
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#3B82F6] border border-[#DBEAFE]">
            Normal
          </span>
        );
    }
  };

  const renderFollowUpIndicator = (inquiry) => {
    if (inquiry.followUpStatus !== 'scheduled' || !inquiry.nextFollowUpAt) {
      if (inquiry.followUpStatus === 'completed') {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#15803D]">
            <FiCheckCircle className="w-3 h-3 text-[#15803D]" />
            <span>Completed</span>
          </span>
        );
      }
      return <span className="text-[#94A3B8] text-[11px]">No follow-up</span>;
    }

    const followUpDate = new Date(inquiry.nextFollowUpAt);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const isOverdue = followUpDate < startOfToday;
    const isToday = followUpDate >= startOfToday && followUpDate <= endOfToday;

    const formattedDate = followUpDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
          <FiAlertTriangle className="w-3 h-3 text-[#DC2626]" />
          <span>Overdue: {formattedDate}</span>
        </span>
      );
    }

    if (isToday) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
          <FiClock className="w-3 h-3 text-[#D97706]" />
          <span>Due Today</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB]">
        <FiCalendar className="w-3 h-3 text-[#2563EB]" />
        <span>{formattedDate}</span>
      </span>
    );
  };

  const formatTypeLabel = (type = 'general') => {
    switch (type) {
      case 'sap-support':
        return 'SAP Support';
      case 'sap-resource-request':
        return 'SAP Staffing';
      case 'staffing-request':
        return 'Staffing Request';
      case 'erp-inquiry':
        return 'ERP Advisory';
      default:
        return 'General Enquiry';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 text-xs font-semibold transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-[#ECFDF5] border-[#D1FAE5] text-[#15803D]'
              : 'bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]'
          }`}
        >
          {notification.type === 'success' ? (
            <FiCheckCircle className="w-4 h-4 shrink-0 text-[#15803D]" />
          ) : (
            <FiAlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252720]">
            Lead & Enquiry Management
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Track business opportunities, organize lead lifecycle, assign staff, and schedule follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInquiriesList}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E7E0D3] text-xs font-semibold text-[#252720] hover:bg-[#FDFBF7] shadow-xs transition cursor-pointer disabled:opacity-60"
            title="Refresh List"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={pagination.total === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Advanced Search Panel */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E0D3] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'new', label: 'New / Pending' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'qualified', label: 'Qualified' },
            { id: 'proposal-sent', label: 'Proposal Sent' },
            { id: 'won', label: 'Won' },
            { id: 'lost', label: 'Lost' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStageFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                stageFilter === tab.id
                  ? 'bg-[#174B39] text-white shadow-xs'
                  : 'text-[#64748B] hover:bg-[#FDFBF7] hover:text-[#252720]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Filters Dropdowns, and Sort Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-3 border-t border-[#E7E0D3]">
          {/* 1. Search Box */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <FiSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, company, requirement, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition placeholder:text-[#94A3B8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#252720]"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 2. Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none transition cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* 3. Follow-up Filter */}
          <div>
            <select
              value={followUpFilter}
              onChange={(e) => {
                setFollowUpFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none transition cursor-pointer"
            >
              <option value="all">All Follow-ups</option>
              <option value="due">Follow-ups Due</option>
              <option value="overdue">Overdue Only</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="none">No Follow-up Set</option>
            </select>
          </div>

          {/* 4. Assigned Team Filter */}
          <div>
            <select
              value={assignedFilter}
              onChange={(e) => {
                setAssignedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none transition cursor-pointer"
            >
              <option value="all">All Team Members</option>
              <option value="unassigned">Unassigned Only</option>
              {teamMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Service Classification Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none transition cursor-pointer"
            >
              <option value="all">All Service Types</option>
              <option value="sap-support">SAP Support</option>
              <option value="sap-resource-request">SAP Staffing</option>
              <option value="staffing-request">Staffing Request</option>
              <option value="erp-inquiry">ERP Advisory</option>
              <option value="general">General Inquiries</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E7E0D3] text-xs">
            <span className="text-[#64748B]">
              Active filters applied. Showing {pagination.total} matching leads.
            </span>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#174B39] hover:underline cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table View */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E0D3] shadow-xs overflow-hidden">
        {/* Error State */}
        {error && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#252720]">{error}</p>
            <button
              onClick={fetchInquiriesList}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174B39] text-white text-xs font-medium cursor-pointer"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                <div className="w-1/4 h-5 bg-[#F1F5F9] rounded-md"></div>
                <div className="w-1/5 h-5 bg-[#F1F5F9] rounded-md"></div>
                <div className="w-1/6 h-5 bg-[#F1F5F9] rounded-md"></div>
                <div className="w-1/12 h-5 bg-[#F1F5F9] rounded-md"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && inquiries.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-3">
              <FiInbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#252720]">No enquiries match your selection</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              {hasActiveFilters
                ? 'Try resetting some of your search terms or filter criteria.'
                : 'There are currently no enquiry submissions stored in the database.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E7E0D3] text-xs font-semibold text-[#174B39] hover:bg-[#EAF0E8] transition cursor-pointer"
              >
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && inquiries.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E7E0D3] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3.5 px-4 sm:px-6">Customer & Company</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Classification</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Stage</th>
                    <th className="py-3.5 px-4">Assigned To</th>
                    <th className="py-3.5 px-4">Follow-up</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D3] text-xs">
                  {inquiries.map((inquiry) => (
                    <tr
                      key={inquiry._id}
                      className="hover:bg-[#F8FAFC]/80 transition group cursor-pointer"
                      onClick={() => handleOpenDetail(inquiry)}
                    >
                      {/* Customer & Company */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] text-[#174B39] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E0E7FF]">
                            {(inquiry.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#252720] group-hover:text-[#174B39] transition truncate">
                              {inquiry.name}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate">
                              {inquiry.company || 'Private Client'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <p className="text-[#252720] font-medium truncate max-w-[180px]">
                          {inquiry.email}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {inquiry.phone || 'No phone'}
                        </p>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720]">
                          {formatTypeLabel(inquiry.type)}
                        </span>
                        {inquiry.sapModule && (
                          <span className="block mt-0.5 text-[10px] font-semibold text-[#174B39]">
                            {inquiry.sapModule}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        {renderPriorityBadge(inquiry.priority)}
                      </td>

                      {/* Lead Stage Badge */}
                      <td className="py-3.5 px-4">
                        {renderStageBadge(inquiry.leadStage || inquiry.status)}
                      </td>

                      {/* Assigned Team Member */}
                      <td className="py-3.5 px-4">
                        {inquiry.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#EAF0E8] text-[#174B39] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {inquiry.assignedTo.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="font-medium text-[#252720] truncate max-w-[120px]">
                              {inquiry.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] text-[11px] italic">Unassigned</span>
                        )}
                      </td>

                      {/* Follow-up Status */}
                      <td className="py-3.5 px-4">
                        {renderFollowUpIndicator(inquiry)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(inquiry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#174B39] hover:bg-[#EAF0E8] transition cursor-pointer"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(inquiry._id)}
                            className="p-1 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                            title="Delete Enquiry"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="p-4 border-t border-[#E7E0D3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <strong className="text-[#252720]">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-[#252720]">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </strong>{' '}
                  of <strong className="text-[#252720]">{pagination.total}</strong> records
                </span>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs border border-[#E7E0D3] rounded-lg bg-[#FFFFFF] outline-none"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E7E0D3] bg-[#FFFFFF] hover:bg-[#FDFBF7] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer font-medium"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-2 font-semibold text-[#252720]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E7E0D3] bg-[#FFFFFF] hover:bg-[#FDFBF7] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer font-medium"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Comprehensive Lead Detail Workspace Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-[#252720]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-[#E7E0D3] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E7E0D3] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Lead #{selectedInquiry._id.slice(-6)}
                  </span>
                  {renderStageBadge(selectedInquiry.leadStage || selectedInquiry.status)}
                  {renderPriorityBadge(selectedInquiry.priority)}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#252720]">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Received on {new Date(selectedInquiry.createdAt).toLocaleString()} via{' '}
                  <span className="font-semibold text-[#252720] capitalize">{selectedInquiry.source || 'Website'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseDetail}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#252720] hover:bg-[#E7E0D3] transition cursor-pointer"
                  aria-label="Close"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside modal */}
            <div className="px-5 sm:px-6 border-b border-[#E7E0D3] flex items-center gap-2 sm:gap-4 overflow-x-auto bg-[#FFFFFF] shrink-0 text-xs font-semibold">
              {[
                { id: 'overview', label: 'Overview & Requirements', icon: FiInbox },
                { id: 'proposals', label: 'Proposals & Quotations', icon: FiFileText },
                { id: 'actions', label: 'Lead Stage & Ownership', icon: FiTarget },
                { id: 'followup', label: 'Follow-up Scheduler', icon: FiClock },
                { id: 'notes', label: `Private Notes (${selectedInquiry.notes?.length || 0})`, icon: FiMessageSquare },
                { id: 'timeline', label: `Audit Trail (${selectedInquiry.timeline?.length || 0})`, icon: FiActivity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`py-3.5 px-2 border-b-2 font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      detailTab === tab.id
                        ? 'border-[#174B39] text-[#174B39]'
                        : 'border-transparent text-[#64748B] hover:text-[#252720]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {detailTab === 'overview' && (
                <div className="space-y-5">
                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] text-xs">
                    <div>
                      <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="font-medium text-[#174B39] hover:underline break-all inline-flex items-center gap-1.5"
                      >
                        <FiMail className="w-3.5 h-3.5" />
                        <span>{selectedInquiry.email || '—'}</span>
                      </a>
                    </div>

                    <div>
                      <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="font-medium text-[#252720] hover:text-[#174B39] inline-flex items-center gap-1.5"
                      >
                        <FiPhone className="w-3.5 h-3.5" />
                        <span>{selectedInquiry.phone || 'Not provided'}</span>
                      </a>
                    </div>

                    <div>
                      <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                        Company / Organization
                      </span>
                      <div className="font-medium text-[#252720] inline-flex items-center gap-1.5">
                        <FiBriefcase className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{selectedInquiry.company || 'Not provided'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                        Service Category
                      </span>
                      <span className="font-semibold text-[#252720]">
                        {formatTypeLabel(selectedInquiry.type)}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                        Current Priority
                      </span>
                      <div>{renderPriorityBadge(selectedInquiry.priority)}</div>
                    </div>

                    <div>
                      <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                        Assigned Owner
                      </span>
                      <span className="font-medium text-[#252720]">
                        {selectedInquiry.assignedTo ? selectedInquiry.assignedTo.name : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Structured Technical & Business Requirements */}
                  {/* Category A: Manpower & Staffing Positions Table */}
                  {selectedInquiry.staffingPositions && selectedInquiry.staffingPositions.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                          <FiLayers className="w-4 h-4 text-emerald-700" />
                          <span>Industrial & Technical Staffing Positions</span>
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {selectedInquiry.staffingPositions.length} Roles Requested
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-emerald-200/80 rounded-xl bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-emerald-50/70 text-[10px] uppercase font-bold text-emerald-800 border-b border-emerald-200">
                              <th className="p-2.5">Position / Role Title</th>
                              <th className="p-2.5">Headcount</th>
                              <th className="p-2.5">Skill Level</th>
                              <th className="p-2.5">Employment Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100">
                            {selectedInquiry.staffingPositions.map((pos, pIdx) => (
                              <tr key={pIdx} className="hover:bg-emerald-50/30">
                                <td className="p-2.5 font-semibold text-slate-900">{pos.roleTitle}</td>
                                <td className="p-2.5 font-mono text-emerald-900 font-bold">{pos.count}</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                                    {pos.skillLevel}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-600">{pos.employmentType}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                        {selectedInquiry.workLocation && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Work Location</span>
                            <strong className="text-slate-800">{selectedInquiry.workLocation}</strong>
                          </div>
                        )}
                        {selectedInquiry.deploymentPreference && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Deployment</span>
                            <strong className="text-slate-800">{selectedInquiry.deploymentPreference}</strong>
                          </div>
                        )}
                        {selectedInquiry.startDate && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Start Date</span>
                            <strong className="text-slate-800">{selectedInquiry.startDate}</strong>
                          </div>
                        )}
                        {selectedInquiry.budgetRange && (
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Budget / Rate</span>
                            <strong className="text-emerald-700">{selectedInquiry.budgetRange}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category B, C, D, E & Legacy Specification Cards */}
                  {(selectedInquiry.sapModule ||
                    selectedInquiry.sapRole ||
                    selectedInquiry.sapResourceCategory ||
                    selectedInquiry.sapEnvironment ||
                    selectedInquiry.supportType ||
                    selectedInquiry.supportCoverage ||
                    selectedInquiry.businessImpact ||
                    selectedInquiry.industry ||
                    selectedInquiry.currentSoftware ||
                    (selectedInquiry.departmentsInvolved && selectedInquiry.departmentsInvolved.length > 0) ||
                    selectedInquiry.userSize ||
                    selectedInquiry.requiredRole ||
                    selectedInquiry.experienceRequired ||
                    selectedInquiry.numberOfProfessionals ||
                    selectedInquiry.location ||
                    selectedInquiry.engagementType ||
                    selectedInquiry.joiningTimeline ||
                    selectedInquiry.sapSystem ||
                    selectedInquiry.issueType ||
                    selectedInquiry.urgency ||
                    selectedInquiry.businessType ||
                    selectedInquiry.currentSystem ||
                    selectedInquiry.requiredERPArea ||
                    selectedInquiry.numberOfUsers ||
                    selectedInquiry.timeline) && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF0E8]/40 border border-[#DBEAFE] space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#252720] flex items-center gap-2">
                        <FiLayers className="w-4 h-4 text-[#174B39]" />
                        <span>Structured Technical & Enterprise Requirements</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {selectedInquiry.sapRole && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">SAP Role</span>
                            <strong className="text-[#252720]">{selectedInquiry.sapRole}</strong>
                          </div>
                        )}
                        {(selectedInquiry.sapModule || selectedInquiry.requiredRole) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">SAP Module / Area</span>
                            <strong className="text-[#252720]">{selectedInquiry.sapModule || selectedInquiry.requiredRole}</strong>
                          </div>
                        )}
                        {selectedInquiry.sapResourceCategory && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Resource Category</span>
                            <strong className="text-[#252720]">{selectedInquiry.sapResourceCategory}</strong>
                          </div>
                        )}
                        {(selectedInquiry.experienceLevel || selectedInquiry.experienceRequired) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Experience Level</span>
                            <strong className="text-[#252720]">{selectedInquiry.experienceLevel || selectedInquiry.experienceRequired}</strong>
                          </div>
                        )}
                        {(selectedInquiry.numberOfConsultants || selectedInquiry.numberOfProfessionals) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Consultants / Headcount</span>
                            <strong className="text-[#252720]">{selectedInquiry.numberOfConsultants || selectedInquiry.numberOfProfessionals}</strong>
                          </div>
                        )}
                        {(selectedInquiry.sapEnvironment || selectedInquiry.sapSystem) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">SAP Environment / Version</span>
                            <strong className="text-[#252720]">{selectedInquiry.sapEnvironment || selectedInquiry.sapSystem}</strong>
                          </div>
                        )}
                        {selectedInquiry.supportType && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Support Scope</span>
                            <strong className="text-[#252720]">{selectedInquiry.supportType}</strong>
                          </div>
                        )}
                        {selectedInquiry.supportCoverage && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">SLA / Support Window</span>
                            <strong className="text-[#252720]">{selectedInquiry.supportCoverage}</strong>
                          </div>
                        )}
                        {selectedInquiry.businessImpact && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Business Impact</span>
                            <strong className="text-[#252720]">{selectedInquiry.businessImpact}</strong>
                          </div>
                        )}
                        {(selectedInquiry.industry || selectedInquiry.businessType) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Industry Sector</span>
                            <strong className="text-[#252720]">{selectedInquiry.industry || selectedInquiry.businessType}</strong>
                          </div>
                        )}
                        {(selectedInquiry.currentSoftware || selectedInquiry.currentSystem) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Current Software / ERP</span>
                            <strong className="text-[#252720]">{selectedInquiry.currentSoftware || selectedInquiry.currentSystem}</strong>
                          </div>
                        )}
                        {(selectedInquiry.userSize || selectedInquiry.numberOfUsers) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Estimated System Users</span>
                            <strong className="text-[#252720]">{selectedInquiry.userSize || selectedInquiry.numberOfUsers}</strong>
                          </div>
                        )}
                        {selectedInquiry.deploymentPreference && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Deployment Preference</span>
                            <strong className="text-[#252720]">{selectedInquiry.deploymentPreference}</strong>
                          </div>
                        )}
                        {(selectedInquiry.duration || selectedInquiry.timeline) && (
                          <div>
                            <span className="text-[#64748B] block text-[10px] uppercase">Target Duration</span>
                            <strong className="text-[#252720]">{selectedInquiry.duration || selectedInquiry.timeline}</strong>
                          </div>
                        )}
                      </div>

                      {/* Departments in Scope Chips if present */}
                      {selectedInquiry.departmentsInvolved && selectedInquiry.departmentsInvolved.length > 0 && (
                        <div className="pt-2 border-t border-[#DBEAFE]/80">
                          <span className="text-[#64748B] block text-[10px] uppercase mb-1.5 font-semibold">
                            Departments / Business Units In Scope
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedInquiry.departmentsInvolved.map((dept, dIdx) => (
                              <span
                                key={dIdx}
                                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FFFFFF] border border-[#BFDBFE] text-[#1E40AF]"
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Original Customer Message */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#252720] mb-2">
                      Original Message & Client Requirements
                    </h4>
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E7E0D3] text-xs text-[#252720] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {selectedInquiry.message || selectedInquiry.requirement || 'No detailed message was included in this enquiry.'}
                    </div>
                  </div>

                  {/* Existing Quick Approve / Reject Actions + Create Proposal CTA */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E7E0D3] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#252720] block">Commercial & Workflow Actions</span>
                      <span className="text-[#64748B] text-[11px]">Generate formal proposals or update qualification status</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailTab('proposals');
                          setEditingProposal(null);
                          setIsProposalEditorOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1528] text-white hover:bg-emerald-600 font-semibold transition cursor-pointer shadow-sm"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                        <span>Create Proposal</span>
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => handleStageChange('qualified', 'approved')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#15803D] hover:bg-[#D1FAE5] border border-[#A7F3D0] font-semibold transition cursor-pointer"
                      >
                        <FiCheck className="w-3.5 h-3.5" />
                        <span>Approve / Qualify</span>
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => handleStageChange('lost', 'rejected')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] border border-[#FECACA] font-semibold transition cursor-pointer"
                      >
                        <FiX className="w-3.5 h-3.5" />
                        <span>Reject Lead</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROPOSALS & QUOTATIONS */}
              {detailTab === 'proposals' && (
                <InquiryProposalsTab
                  inquiry={selectedInquiry}
                  onOpenCreate={() => {
                    setEditingProposal(null);
                    setIsProposalEditorOpen(true);
                  }}
                  onOpenEdit={(prop) => {
                    setEditingProposal(prop);
                    setIsProposalEditorOpen(true);
                  }}
                  onInquiryUpdated={async () => {
                    try {
                      const refreshed = await getInquiry(selectedInquiry._id);
                      if (refreshed) {
                        setSelectedInquiry(refreshed);
                        setInquiries((prev) =>
                          prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...refreshed } : item))
                        );
                      }
                    } catch (err) {
                      console.error('Failed to refresh inquiry after proposal update', err);
                    }
                  }}
                  showFeedback={showFeedback}
                />
              )}

              {/* TAB 2: LEAD STAGE & OWNERSHIP */}
              {detailTab === 'actions' && (
                <div className="space-y-6">
                  {/* Lead Stage Progression */}
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E7E0D3]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#252720] mb-3">
                      Lead Lifecycle Stage
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'new', label: '1. New Lead', desc: 'Awaiting initial review' },
                        { id: 'contacted', label: '2. Contacted', desc: 'In discussion' },
                        { id: 'qualified', label: '3. Qualified', desc: 'Scope verified' },
                        { id: 'proposal-sent', label: '4. Proposal Sent', desc: 'Commercial offer out' },
                        { id: 'won', label: '5. Won', desc: 'Contract signed' },
                        { id: 'lost', label: '6. Lost', desc: 'Closed or rejected' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          disabled={actionLoading}
                          onClick={() => handleStageChange(st.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            (selectedInquiry.leadStage || selectedInquiry.status) === st.id
                              ? 'bg-[#174B39] text-white border-[#174B39] shadow-xs'
                              : 'bg-white border-[#E7E0D3] text-[#252720] hover:border-[#174B39]/40'
                          }`}
                        >
                          <span className="font-bold text-xs">{st.label}</span>
                          <span
                            className={`text-[10px] mt-1 ${
                              (selectedInquiry.leadStage || selectedInquiry.status) === st.id
                                ? 'text-white/80'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {st.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Selector */}
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E7E0D3]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#252720] mb-3">
                      Lead Priority
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'urgent', label: 'Urgent', desc: 'Respond within 2h' },
                        { id: 'high', label: 'High', desc: 'Respond today' },
                        { id: 'normal', label: 'Normal', desc: 'Standard enquiry' },
                        { id: 'low', label: 'Low', desc: 'Future opportunity' },
                      ].map((pr) => (
                        <button
                          key={pr.id}
                          disabled={actionLoading}
                          onClick={() => handlePriorityChange(pr.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            selectedInquiry.priority === pr.id
                              ? 'bg-[#252720] text-white border-[#252720] shadow-xs'
                              : 'bg-white border-[#E7E0D3] text-[#252720] hover:border-[#252720]/40'
                          }`}
                        >
                          <span className="font-bold text-xs uppercase">{pr.label}</span>
                          <span
                            className={`text-[10px] mt-1 ${
                              selectedInquiry.priority === pr.id ? 'text-white/80' : 'text-[#64748B]'
                            }`}
                          >
                            {pr.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team Assignment Selector */}
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E7E0D3]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#252720] mb-1.5">
                      Assigned Lead Owner
                    </label>
                    <p className="text-xs text-[#64748B] mb-3">
                      Assign an authorized administrator or editor responsible for this account.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <select
                        value={selectedInquiry.assignedTo?._id || selectedInquiry.assignedTo || 'unassigned'}
                        onChange={(e) => handleAssignMember(e.target.value)}
                        disabled={actionLoading}
                        className="w-full sm:w-80 px-3.5 py-2.5 text-xs font-semibold text-[#252720] bg-white border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none transition cursor-pointer"
                      >
                        <option value="unassigned">— Unassigned (Open Pool) —</option>
                        {teamMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name} ({member.email}) • {member.role.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      {selectedInquiry.assignedTo && (
                        <button
                          onClick={() => handleAssignMember('unassigned')}
                          disabled={actionLoading}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                        >
                          Unassign Owner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FOLLOW-UP SCHEDULER */}
              {detailTab === 'followup' && (
                <div className="space-y-6">
                  {/* Current Follow-up Status Box */}
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E7E0D3]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                      Current Follow-up Status
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {renderFollowUpIndicator(selectedInquiry)}
                          {selectedInquiry.followUpStatus === 'scheduled' && (
                            <span className="text-xs text-[#64748B]">
                              • {new Date(selectedInquiry.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {selectedInquiry.followUpNote && (
                          <p className="text-xs text-[#252720] font-medium mt-1.5 italic">
                            "{selectedInquiry.followUpNote}"
                          </p>
                        )}
                      </div>

                      {selectedInquiry.followUpStatus === 'scheduled' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCompleteFollowUp}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ECFDF5] text-[#15803D] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-xs font-semibold transition cursor-pointer"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule New / Reschedule Form */}
                  <form onSubmit={handleScheduleFollowUp} className="p-5 rounded-2xl bg-white border border-[#E7E0D3] space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#252720]">
                      {selectedInquiry.followUpStatus === 'scheduled' ? 'Reschedule Follow-up' : 'Schedule Next Follow-up'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Follow-up Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={followUpForm.date}
                          onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1">
                          Objective / Follow-up Note
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Call client regarding proposal feedback"
                          value={followUpForm.note}
                          onChange={(e) => setFollowUpForm({ ...followUpForm, note: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!followUpForm.date || actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? 'Saving...' : 'Confirm Follow-up'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: PRIVATE INTERNAL NOTES */}
              {detailTab === 'notes' && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-[#FEF3C7]/40 border border-[#FDE68A] flex items-center gap-2.5 text-xs text-[#92400E]">
                    <FiAlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
                    <span>
                      Private Staff Notes: These notes are strictly restricted to authorized administrators and are never visible to clients or visitors.
                    </span>
                  </div>

                  {/* Notes Feed */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                      selectedInquiry.notes.map((note, idx) => (
                        <div
                          key={note._id || idx}
                          className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E7E0D3] text-xs space-y-1.5"
                        >
                          <p className="text-[#252720] leading-relaxed whitespace-pre-wrap">{note.text}</p>
                          <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#E7E0D3]/60">
                            <span className="font-semibold text-[#252720] flex items-center gap-1">
                              <FiUser className="w-3 h-3 text-[#174B39]" />
                              {note.authorName || (note.addedBy?.name || 'Administrator')}
                            </span>
                            <span>{note.addedAt ? new Date(note.addedAt).toLocaleString() : 'Recently'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-[#94A3B8] italic">
                        No internal notes recorded for this enquiry yet.
                      </div>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <label className="block text-xs font-semibold text-[#252720]">
                      Add New Internal Note
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write internal notes about client meeting, pricing discussions, or next steps..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      maxLength={2000}
                      className="w-full p-3 text-xs bg-white border border-[#E7E0D3] rounded-xl focus:border-[#174B39] outline-none transition"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8]">
                        {2000 - newNoteText.length} characters remaining
                      </span>
                      <button
                        type="submit"
                        disabled={!newNoteText.trim() || actionLoading}
                        className="px-4 py-2 bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading ? 'Saving...' : 'Add Private Note'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: AUDIT TRAIL / TIMELINE */}
              {detailTab === 'timeline' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#64748B]">
                    Complete immutable chronological audit log of lifecycle actions and assignments.
                  </p>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7E0D3]">
                    {selectedInquiry.timeline && selectedInquiry.timeline.length > 0 ? (
                      selectedInquiry.timeline
                        .slice()
                        .reverse()
                        .map((act, idx) => (
                          <div key={act._id || idx} className="relative">
                            <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#174B39] ring-4 ring-white" />
                            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E7E0D3] text-xs">
                              <p className="font-semibold text-[#252720]">{act.description}</p>
                              <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-1 pt-1 border-t border-[#E7E0D3]/60">
                                <span>Actor: {act.performedByName || 'System'}</span>
                                <span>{new Date(act.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-[#94A3B8] italic">No historical audit events logged yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:px-6 border-t border-[#E7E0D3] bg-[#F8FAFC] flex items-center justify-between shrink-0">
              <button
                onClick={() => setDeleteConfirmId(selectedInquiry._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Delete Enquiry</span>
              </button>

              <button
                onClick={handleCloseDetail}
                className="px-5 py-2 rounded-xl bg-white border border-[#E7E0D3] text-[#252720] hover:bg-[#FDFBF7] text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 bg-[#252720]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-sm w-full p-6 border border-[#E7E0D3] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#252720]">Permanently Delete Enquiry?</h4>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              This action cannot be undone. All contact details, private notes, and audit timeline for this enquiry will be permanently removed.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#FDFBF7] hover:bg-[#E7E0D3] text-xs font-semibold text-[#252720] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleDeleteInquiry(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Generator & Commercial Editor Modal */}
      {isProposalEditorOpen && selectedInquiry && (
        <ProposalEditorModal
          isOpen={isProposalEditorOpen}
          onClose={() => setIsProposalEditorOpen(false)}
          inquiry={selectedInquiry}
          initialProposal={editingProposal}
          onSaved={async (saved) => {
            showFeedback('success', `Proposal ${saved.proposalNumber || ''} saved successfully.`);
            try {
              const refreshed = await getInquiry(selectedInquiry._id);
              if (refreshed) {
                setSelectedInquiry(refreshed);
                setInquiries((prev) =>
                  prev.map((item) => (item._id === selectedInquiry._id ? { ...item, ...refreshed } : item))
                );
              }
            } catch (err) {
              console.error('Failed to refresh inquiry after saving proposal', err);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminInquiries;
