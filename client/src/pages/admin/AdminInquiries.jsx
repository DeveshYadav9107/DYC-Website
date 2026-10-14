import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getInquiries,
  updateInquiryStatus,
  addInquiryNote,
  deleteInquiry,
} from '../../services/api';
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
} from 'react-icons/fi';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Detail Modal & Action States
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInquiries();
      const list = Array.isArray(data) ? data : data?.data || [];
      setInquiries(list);
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
      setError('Failed to load enquiries from server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Show auto-dismissing toast feedback
  const showFeedback = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Status update with server validation
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await updateInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      showFeedback('success', `Status updated to "${newStatus}" successfully.`);
    } catch (err) {
      console.error('Failed to update status', err);
      showFeedback('error', err.response?.data?.message || 'Server failed to update status.');
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
      const updatedInquiry = await addInquiryNote(selectedInquiry._id, newNoteText.trim());
      const resData = updatedInquiry?.data || updatedInquiry;
      setInquiries((prev) =>
        prev.map((item) => (item._id === selectedInquiry._id ? resData : item))
      );
      setSelectedInquiry(resData);
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

  // Export CSV
  const exportCSV = () => {
    if (!filteredInquiries.length) return;
    const headers = [
      'Inquiry ID',
      'Date Submitted',
      'Customer Name',
      'Email',
      'Phone',
      'Company',
      'Service Classification',
      'Status',
      'Message',
    ];
    const rows = filteredInquiries.map((inq) => [
      inq._id,
      new Date(inq.createdAt).toISOString(),
      `"${(inq.name || '').replace(/"/g, '""')}"`,
      `"${(inq.email || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.company || '').replace(/"/g, '""')}"`,
      inq.type,
      inq.status,
      `"${(inq.message || inq.requirement || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DYC_Enquiries_Export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Searched data
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Status filter
      if (statusFilter !== 'all' && inq.status !== statusFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && inq.type !== typeFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = inq.name?.toLowerCase().includes(query);
        const emailMatch = inq.email?.toLowerCase().includes(query);
        const companyMatch = inq.company?.toLowerCase().includes(query);
        const phoneMatch = inq.phone?.toLowerCase().includes(query);
        const messageMatch = inq.message?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !companyMatch && !phoneMatch && !messageMatch) {
          return false;
        }
      }
      return true;
    });
  }, [inquiries, statusFilter, typeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredInquiries.length / pageSize) || 1;
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(start, start + pageSize);
  }, [filteredInquiries, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchQuery]);

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mr-1.5"></span>
            Pending
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] text-[#2563EB] border border-[#DBEAFE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mr-1.5"></span>
            Contacted
          </span>
        );
      case 'qualified':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F2EEFF] text-[#7C3AED] border border-[#DDD6FE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mr-1.5"></span>
            Qualified
          </span>
        );
      case 'proposal':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F8FC] text-[#0284C7] border border-[#BAE6FD]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mr-1.5"></span>
            Proposal
          </span>
        );
      case 'converted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#15803D] border border-[#D1FAE5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mr-1.5"></span>
            Converted
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] mr-1.5"></span>
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            {status}
          </span>
        );
    }
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
        return 'General';
    }
  };

  // Status counts for tabs
  const countByStatus = useMemo(() => {
    return inquiries.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
  }, [inquiries]);

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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033]">
            Enquiries Management
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Review, qualify, and respond to incoming enterprise customer requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInquiries}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8ECF3] text-xs font-semibold text-[#172033] hover:bg-[#F6F8FC] shadow-xs transition cursor-pointer disabled:opacity-60"
            title="Refresh List"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredInquiries.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8ECF3] p-4 shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Enquiries', count: inquiries.length },
            { id: 'new', label: 'Pending', count: countByStatus['new'] || 0 },
            { id: 'contacted', label: 'Contacted', count: countByStatus['contacted'] || 0 },
            { id: 'qualified', label: 'Qualified', count: countByStatus['qualified'] || 0 },
            { id: 'proposal', label: 'Proposal', count: countByStatus['proposal'] || 0 },
            { id: 'converted', label: 'Converted', count: countByStatus['converted'] || 0 },
            { id: 'closed', label: 'Closed', count: countByStatus['closed'] || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-[#F2EEFF] text-[#4F46E5]'
                  : 'text-[#64748B] hover:bg-[#F6F8FC] hover:text-[#172033]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === tab.id
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Service Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#E8ECF3]">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <FiSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by customer name, email, company, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs text-[#172033] bg-[#FFFFFF] border border-[#E8ECF3] rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 outline-none transition placeholder:text-[#94A3B8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#172033]"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Service Type Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <FiFilter className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-[#172033] bg-[#FFFFFF] border border-[#E8ECF3] rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 outline-none transition cursor-pointer"
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
      </div>

      {/* Enquiries Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8ECF3] shadow-xs overflow-hidden">
        {/* Error State */}
        {error && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#172033]">{error}</p>
            <button
              onClick={fetchInquiries}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-medium cursor-pointer"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
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
        {!loading && !error && filteredInquiries.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
              <FiInbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#172033]">No enquiries matched</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search terms or filter selection to see more results.'
                : 'There are currently no enquiry submissions stored in the database.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F6F8FC] border border-[#E8ECF3] text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF4FF] transition cursor-pointer"
              >
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && paginatedInquiries.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3.5 px-4 sm:px-6">Customer & Company</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Classification</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3] text-xs">
                  {paginatedInquiries.map((inquiry) => (
                    <tr
                      key={inquiry._id}
                      className="hover:bg-[#F8FAFC]/80 transition group cursor-pointer"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      {/* Customer & Company */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E0E7FF]">
                            {(inquiry.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#172033] group-hover:text-[#4F46E5] transition truncate">
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
                        <p className="text-[#172033] font-medium truncate max-w-xs">
                          {inquiry.email}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {inquiry.phone || 'No phone'}
                        </p>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F6F8FC] border border-[#E8ECF3] text-[#172033]">
                          {formatTypeLabel(inquiry.type)}
                        </span>
                        {inquiry.sapModule && (
                          <span className="ml-1 text-[10px] font-semibold text-[#4F46E5]">
                            ({inquiry.sapModule})
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inquiry.status}
                          disabled={actionLoading}
                          onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-[#F8FAFC] border border-[#E8ECF3] text-[#172033] hover:border-[#4F46E5] focus:border-[#4F46E5] outline-none transition cursor-pointer"
                        >
                          <option value="new">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="proposal">Proposal</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF4FF] transition cursor-pointer"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>View</span>
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

            {/* Pagination Bar */}
            <div className="p-4 border-t border-[#E8ECF3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <div>
                Showing{' '}
                <span className="font-semibold text-[#172033]">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-[#172033]">
                  {Math.min(currentPage * pageSize, filteredInquiries.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-[#172033]">
                  {filteredInquiries.length}
                </span>{' '}
                enquiries
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8ECF3] bg-[#FFFFFF] hover:bg-[#F6F8FC] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer font-medium"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-2 font-semibold text-[#172033]">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8ECF3] bg-[#FFFFFF] hover:bg-[#F6F8FC] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer font-medium"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E8ECF3] shadow-2xl p-6 sm:p-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#E8ECF3] pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Enterprise Enquiry
                  </span>
                  {renderStatusBadge(selectedInquiry.status)}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#172033]">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  ID: {selectedInquiry._id} • Received on{' '}
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F6F8FC] transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 sm:p-5 rounded-xl border border-[#E8ECF3] mb-6 text-xs">
              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Customer Email
                </span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-medium text-[#4F46E5] hover:underline break-all inline-flex items-center gap-1.5"
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
                  className="font-medium text-[#172033] hover:text-[#4F46E5] inline-flex items-center gap-1.5"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  <span>{selectedInquiry.phone || 'Not provided'}</span>
                </a>
              </div>

              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Company / Organization
                </span>
                <div className="font-medium text-[#172033] inline-flex items-center gap-1.5">
                  <FiBriefcase className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{selectedInquiry.company || 'Not provided'}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Service Category
                </span>
                <span className="font-medium text-[#172033]">
                  {formatTypeLabel(selectedInquiry.type)}
                </span>
              </div>
            </div>

            {/* Enterprise Specialized Information (if present) */}
            {(selectedInquiry.sapModule ||
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
              <div className="mb-6 p-4 rounded-xl bg-[#EEF4FF]/40 border border-[#DBEAFE]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-3 flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-[#4F46E5]" />
                  <span>Technical & Resource Specification</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {selectedInquiry.sapModule && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">SAP Module</span>
                      <strong className="text-[#172033]">{selectedInquiry.sapModule}</strong>
                    </div>
                  )}
                  {selectedInquiry.requiredRole && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Role Required</span>
                      <strong className="text-[#172033]">{selectedInquiry.requiredRole}</strong>
                    </div>
                  )}
                  {selectedInquiry.experienceRequired && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Experience</span>
                      <strong className="text-[#172033]">{selectedInquiry.experienceRequired}</strong>
                    </div>
                  )}
                  {selectedInquiry.numberOfProfessionals && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Professionals</span>
                      <strong className="text-[#172033]">{selectedInquiry.numberOfProfessionals}</strong>
                    </div>
                  )}
                  {selectedInquiry.location && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Work Location</span>
                      <strong className="text-[#172033]">{selectedInquiry.location}</strong>
                    </div>
                  )}
                  {selectedInquiry.engagementType && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Engagement Type</span>
                      <strong className="text-[#172033]">{selectedInquiry.engagementType}</strong>
                    </div>
                  )}
                  {selectedInquiry.joiningTimeline && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Joining Timeline</span>
                      <strong className="text-[#172033]">{selectedInquiry.joiningTimeline}</strong>
                    </div>
                  )}
                  {selectedInquiry.sapSystem && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">SAP System</span>
                      <strong className="text-[#172033]">{selectedInquiry.sapSystem}</strong>
                    </div>
                  )}
                  {selectedInquiry.issueType && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Issue Type</span>
                      <strong className="text-[#172033]">{selectedInquiry.issueType}</strong>
                    </div>
                  )}
                  {selectedInquiry.urgency && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Urgency</span>
                      <strong className="text-[#172033] uppercase">{selectedInquiry.urgency}</strong>
                    </div>
                  )}
                  {selectedInquiry.businessType && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Business Type</span>
                      <strong className="text-[#172033]">{selectedInquiry.businessType}</strong>
                    </div>
                  )}
                  {selectedInquiry.currentSystem && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Current ERP</span>
                      <strong className="text-[#172033]">{selectedInquiry.currentSystem}</strong>
                    </div>
                  )}
                  {selectedInquiry.requiredERPArea && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">ERP Domain</span>
                      <strong className="text-[#172033]">{selectedInquiry.requiredERPArea}</strong>
                    </div>
                  )}
                  {selectedInquiry.numberOfUsers && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Number of Users</span>
                      <strong className="text-[#172033]">{selectedInquiry.numberOfUsers}</strong>
                    </div>
                  )}
                  {selectedInquiry.timeline && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Target Timeline</span>
                      <strong className="text-[#172033]">{selectedInquiry.timeline}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Client Message */}
            <div className="mb-6">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5">
                Client Requirement & Message
              </span>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8ECF3] text-xs text-[#172033] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedInquiry.message || selectedInquiry.requirement || 'No detailed message was included.'}
              </div>
            </div>

            {/* Workflow Status Selector */}
            <div className="mb-6 p-4 rounded-xl bg-[#F8FAFC] border border-[#E8ECF3]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2">
                Update Status
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { value: 'new', label: 'Pending' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'proposal', label: 'Proposal' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'closed', label: 'Closed' },
                ].map((st) => (
                  <button
                    key={st.value}
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedInquiry._id, st.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedInquiry.status === st.value
                        ? 'bg-[#4F46E5] text-white shadow-xs'
                        : 'bg-[#FFFFFF] border border-[#E8ECF3] text-[#64748B] hover:text-[#172033]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2 flex items-center gap-2">
                <FiMessageSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Internal Team Notes ({selectedInquiry.notes?.length || 0})</span>
              </h4>

              {/* Notes List */}
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                  selectedInquiry.notes.map((note, idx) => (
                    <div
                      key={note._id || idx}
                      className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8ECF3] text-xs text-[#172033]"
                    >
                      <p>{note.text}</p>
                      <span className="text-[10px] text-[#94A3B8] mt-1 block">
                        {note.addedAt ? new Date(note.addedAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#94A3B8] italic p-2">
                    No internal notes yet. Add one below to track follow-ups.
                  </p>
                )}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add internal note or follow-up status..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E8ECF3] rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim() || actionLoading}
                  className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  Add Note
                </button>
              </form>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8ECF3]">
              <button
                onClick={() => setDeleteConfirmId(selectedInquiry._id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Delete Enquiry</span>
              </button>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 rounded-xl bg-[#F6F8FC] hover:bg-[#E8ECF3] text-[#172033] text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 bg-[#172033]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-sm w-full p-6 border border-[#E8ECF3] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#172033]">Delete Enquiry?</h4>
            <p className="text-xs text-[#64748B] mt-1.5">
              This action cannot be undone. The enquiry record will be permanently removed from MongoDB.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#F6F8FC] hover:bg-[#E8ECF3] text-xs font-semibold text-[#172033] transition cursor-pointer"
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
    </div>
  );
};

export default AdminInquiries;
