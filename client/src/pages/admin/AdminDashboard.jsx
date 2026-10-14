import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getInquiries, updateInquiryStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiInbox,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiArrowRight,
  FiEye,
  FiRefreshCw,
  FiAlertTriangle,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiLayers,
  FiSliders,
  FiX,
  FiFileText,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInquiries();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setInquiries(list);
    } catch (err) {
      console.error('Failed to fetch dashboard inquiries', err);
      setError('Unable to load dashboard data. Please verify your connection or retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle status update from modal
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingStatus(true);
    setStatusMessage(null);
    try {
      await updateInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      setStatusMessage({ type: 'success', text: `Status changed to ${newStatus}` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update status', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update status on server.',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Personalized Greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const adminGreetingName = user?.name ? user.name.split(' ')[0] : 'Admin';

  // Real backend calculations
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'new').length;
  const inProgressCount = inquiries.filter((i) =>
    ['contacted', 'qualified', 'proposal'].includes(i.status)
  ).length;
  const resolvedCount = inquiries.filter((i) =>
    ['converted', 'closed'].includes(i.status)
  ).length;

  // Breakdown by classification type
  const typeCounts = inquiries.reduce((acc, curr) => {
    const type = curr.type || 'general';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Status Badge Component matching exact color palette
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
        return 'General Inquiry';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-[#EEF4FF] via-[#F2EEFF] to-[#FFFFFF] rounded-2xl border border-[#E8ECF3] p-6 sm:p-7 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/80 border border-[#E8ECF3] text-[11px] font-medium text-[#4F46E5] mb-2 backdrop-blur-xs">
              <FiCalendar className="w-3 h-3 text-[#4F46E5]" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033]">
              {getGreeting()}, {adminGreetingName}
            </h2>
            <p className="text-sm text-[#64748B] mt-1 max-w-xl">
              Here’s an overview of your DYC website activity and client engagement.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8ECF3] text-xs font-semibold text-[#172033] hover:bg-[#F6F8FC] shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Manage Enquiries</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Enquiries */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8ECF3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Enquiries
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#172033]">
                {loading ? '—' : totalCount}
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">All-time</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
            <FiInbox className="w-5 h-5" />
          </div>
        </div>

        {/* New / Pending */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8ECF3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              New / Pending
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#172033]">
                {loading ? '—' : newCount}
              </span>
              <span className="text-[11px] font-medium text-[#B45309]">Awaiting review</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#B45309] flex items-center justify-center shrink-0 border border-[#FEF3C7]">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8ECF3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              In Progress
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#172033]">
                {loading ? '—' : inProgressCount}
              </span>
              <span className="text-[11px] font-medium text-[#7C3AED]">Under discussion</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F2EEFF] text-[#7C3AED] flex items-center justify-center shrink-0 border border-[#DDD6FE]">
            <FiActivity className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved / Converted */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8ECF3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Resolved / Converted
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#172033]">
                {loading ? '—' : resolvedCount}
              </span>
              <span className="text-[11px] font-medium text-[#15803D]">Completed</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0 border border-[#D1FAE5]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Category Breakdown & Fast Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Classification Distribution */}
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#E8ECF3] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8ECF3] mb-4">
            <div>
              <h3 className="font-bold text-[#172033] text-sm sm:text-base">
                Inquiry Breakdown by Service
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Distribution based on actual incoming requests
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F6F8FC] border border-[#E8ECF3] text-[#64748B]">
              {totalCount} Total
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-4 bg-[#F1F5F9] rounded-full animate-pulse w-3/4"></div>
              <div className="h-4 bg-[#F1F5F9] rounded-full animate-pulse w-1/2"></div>
              <div className="h-4 bg-[#F1F5F9] rounded-full animate-pulse w-2/3"></div>
            </div>
          ) : totalCount === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">
              No inquiries recorded yet to calculate breakdown.
            </div>
          ) : (
            <div className="space-y-3.5">
              {[
                { key: 'sap-support', label: 'SAP Support & Maintenance', bg: 'bg-[#4F46E5]' },
                { key: 'sap-resource-request', label: 'SAP Staffing & Resource Requests', bg: 'bg-[#7C3AED]' },
                { key: 'staffing-request', label: 'Enterprise Professional Staffing', bg: 'bg-[#0284C7]' },
                { key: 'erp-inquiry', label: 'ERP Transformation & Consulting', bg: 'bg-[#15803D]' },
                { key: 'general', label: 'General / Advisory Inquiries', bg: 'bg-[#64748B]' },
              ].map((category) => {
                const count = typeCounts[category.key] || 0;
                const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={category.key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#172033]">{category.label}</span>
                      <span className="font-semibold text-[#64748B]">
                        {count} <span className="text-[10px] font-normal text-[#94A3B8]">({percent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F6F8FC] rounded-full overflow-hidden border border-[#E8ECF3]">
                      <div
                        className={`h-full ${category.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operational Quick Actions Card */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8ECF3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#172033] text-sm sm:text-base">
              Admin Quick Actions
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 mb-4">
              Direct access to system tools
            </p>

            <div className="space-y-2.5">
              <Link
                to="/admin/inquiries"
                className="flex items-center gap-3 p-3 rounded-xl border border-[#E8ECF3] hover:border-[#4F46E5]/30 hover:bg-[#EEF4FF]/30 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <FiInbox className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#172033] block group-hover:text-[#4F46E5]">
                    Process Enquiries
                  </span>
                  <span className="text-[11px] text-[#64748B] block truncate">
                    Review messages & update workflow
                  </span>
                </div>
                <FiChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center gap-3 p-3 rounded-xl border border-[#E8ECF3] hover:border-[#7C3AED]/30 hover:bg-[#F2EEFF]/30 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F2EEFF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <FiSliders className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#172033] block group-hover:text-[#7C3AED]">
                    Site Configuration
                  </span>
                  <span className="text-[11px] text-[#64748B] block truncate">
                    Manage contact info & SEO defaults
                  </span>
                </div>
                <FiChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition" />
              </Link>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-[#E8ECF3] hover:bg-[#F6F8FC] transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F6F8FC] text-[#64748B] flex items-center justify-center shrink-0">
                  <FiLayers className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#172033] block">
                    Public Website
                  </span>
                  <span className="text-[11px] text-[#64748B] block truncate">
                    Open client-facing pages
                  </span>
                </div>
                <span className="text-xs text-[#94A3B8]">↗</span>
              </a>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E8ECF3]">
            <p className="text-[11px] text-[#64748B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              Backend API connected to MongoDB Atlas
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recent Enquiries Section */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8ECF3] shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-5 sm:px-6 sm:py-4 border-b border-[#E8ECF3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#172033] text-sm sm:text-base">
              Recent Website Enquiries
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Latest form submissions from client contacts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/inquiries"
              className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition"
            >
              View all ({totalCount}) →
            </Link>
          </div>
        </div>

        {/* Error State with Retry */}
        {error && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#172033]">{error}</p>
            <button
              onClick={fetchDashboardData}
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                <div className="w-1/4 h-4 bg-[#F1F5F9] rounded-md"></div>
                <div className="w-1/4 h-4 bg-[#F1F5F9] rounded-md"></div>
                <div className="w-1/6 h-4 bg-[#F1F5F9] rounded-md"></div>
                <div className="w-1/12 h-4 bg-[#F1F5F9] rounded-md"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && inquiries.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] text-[#4F46E5] flex items-center justify-center mx-auto mb-3">
              <FiInbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#172033]">No enquiries received yet</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              When prospective clients submit forms on your public website, they will appear here in real time.
            </p>
          </div>
        )}

        {/* Table View */}
        {!loading && !error && inquiries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Service Type</th>
                  <th className="py-3.5 px-4">Date Received</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3] text-xs">
                {inquiries.slice(0, 6).map((inquiry) => (
                  <tr
                    key={inquiry._id}
                    className="hover:bg-[#F8FAFC]/80 transition group cursor-pointer"
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E0E7FF]">
                          {(inquiry.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#172033] group-hover:text-[#4F46E5] transition truncate">
                            {inquiry.name}
                          </p>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {inquiry.company || inquiry.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F6F8FC] border border-[#E8ECF3] text-[#172033]">
                        {formatTypeLabel(inquiry.type)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(inquiry.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF4FF] transition cursor-pointer"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8ECF3] shadow-2xl p-6 sm:p-7">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#E8ECF3] pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Enquiry Details
                  </span>
                  {renderStatusBadge(selectedInquiry.status)}
                </div>
                <h3 className="text-xl font-bold text-[#172033]">{selectedInquiry.name}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F6F8FC] transition"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-[#ECFDF5] text-[#15803D] border border-[#D1FAE5]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Customer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#F8FAFC] p-4 rounded-xl border border-[#E8ECF3] mb-5 text-xs">
              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Email
                </span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-medium text-[#4F46E5] hover:underline break-all inline-flex items-center gap-1"
                >
                  <FiMail className="w-3.5 h-3.5" />
                  <span>{selectedInquiry.email || '—'}</span>
                </a>
              </div>

              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Phone
                </span>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="font-medium text-[#172033] hover:text-[#4F46E5] inline-flex items-center gap-1"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  <span>{selectedInquiry.phone || '—'}</span>
                </a>
              </div>

              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Company / Organization
                </span>
                <div className="font-medium text-[#172033] inline-flex items-center gap-1">
                  <FiBriefcase className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{selectedInquiry.company || 'Not specified'}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#64748B] uppercase text-[10px] block mb-1">
                  Classification
                </span>
                <span className="font-medium text-[#172033]">
                  {formatTypeLabel(selectedInquiry.type)}
                </span>
              </div>
            </div>

            {/* Specific SAP / ERP Details if present */}
            {(selectedInquiry.sapModule || selectedInquiry.requiredRole || selectedInquiry.sapSystem || selectedInquiry.urgency) && (
              <div className="mb-5 p-4 rounded-xl bg-[#EEF4FF]/50 border border-[#DBEAFE] text-xs">
                <h4 className="font-bold text-[#172033] mb-2 flex items-center gap-1.5">
                  <FiLayers className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Technical Requirements</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedInquiry.sapModule && (
                    <p><span className="text-[#64748B]">Module:</span> <strong className="text-[#172033]">{selectedInquiry.sapModule}</strong></p>
                  )}
                  {selectedInquiry.requiredRole && (
                    <p><span className="text-[#64748B]">Role:</span> <strong className="text-[#172033]">{selectedInquiry.requiredRole}</strong></p>
                  )}
                  {selectedInquiry.experienceRequired && (
                    <p><span className="text-[#64748B]">Experience:</span> <strong className="text-[#172033]">{selectedInquiry.experienceRequired}</strong></p>
                  )}
                  {selectedInquiry.urgency && (
                    <p><span className="text-[#64748B]">Urgency:</span> <strong className="text-[#172033] uppercase">{selectedInquiry.urgency}</strong></p>
                  )}
                </div>
              </div>
            )}

            {/* Status Workflow Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5">
                Workflow Status
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { value: 'new', label: 'Pending / New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'proposal', label: 'Proposal' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'closed', label: 'Closed' },
                ].map((st) => (
                  <button
                    key={st.value}
                    disabled={updatingStatus}
                    onClick={() => handleStatusUpdate(selectedInquiry._id, st.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedInquiry.status === st.value
                        ? 'bg-[#4F46E5] text-white shadow-xs'
                        : 'bg-[#F6F8FC] border border-[#E8ECF3] text-[#64748B] hover:text-[#172033] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Message */}
            <div className="mb-6">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5">
                Message & Requirement Details
              </span>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8ECF3] text-xs text-[#172033] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedInquiry.message || selectedInquiry.requirement || 'No message text provided.'}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8ECF3]">
              <Link
                to="/admin/inquiries"
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                Go to full enquiry manager →
              </Link>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-[#F6F8FC] hover:bg-[#E8ECF3] text-[#172033] text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
