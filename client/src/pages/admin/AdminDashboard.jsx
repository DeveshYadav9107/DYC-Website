import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInquiryStats, updateInquiryStatus } from '../../services/api';
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
  FiChevronRight,
  FiSend,
  FiAward,
  FiAlertCircle,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInquiryStats();
      setStats(data || null);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
      setError('Unable to load dashboard metrics. Please verify your connection or retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Handle status update from modal
  const handleStatusUpdate = async (id, newStage) => {
    setUpdatingStatus(true);
    setStatusMessage(null);
    try {
      const updated = await updateInquiryStatus(id, { leadStage: newStage });
      setStatusMessage({ type: 'success', text: `Lead stage updated to "${newStage}"` });
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => ({
          ...prev,
          leadStage: newStage,
          status: updated?.status || prev.status,
        }));
      }
      // Refresh statistics after update
      fetchDashboardStats();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update stage', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update stage on server.',
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

  const adminGreetingName = user?.name ? user.name.split(' ')[0] : 'Administrator';

  // Real backend calculations from stats payload
  const totalCount = stats?.totalEnquiries ?? 0;
  const newCount = stats?.newEnquiries ?? 0;
  const followUpsDueCount = stats?.followUpsDue ?? 0;
  const qualifiedCount = stats?.qualifiedLeads ?? 0;
  const proposalCount = stats?.proposalsSent ?? 0;
  const wonCount = stats?.wonLeads ?? 0;

  const overdueFollowUps = stats?.followUps?.overdue ?? 0;
  const todayFollowUps = stats?.followUps?.today ?? 0;
  const upcomingFollowUps = stats?.followUps?.upcoming ?? 0;

  const urgentCount = stats?.priorities?.urgent ?? 0;
  const highCount = stats?.priorities?.high ?? 0;

  const recentInquiries = stats?.recentInquiries || [];
  const typeCounts = stats?.serviceBreakdown || {};

  // Status & Stage Badge Formatter
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
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-[#EAF0E8] via-[#EAF0E8] to-[#FFFFFF] rounded-2xl border border-[#E7E0D3] p-6 sm:p-7 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/90 border border-[#E7E0D3] text-[11px] font-semibold text-[#174B39] mb-2 backdrop-blur-xs">
              <FiCalendar className="w-3.5 h-3.5 text-[#174B39]" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252720]">
              {getGreeting()}, {adminGreetingName}
            </h2>
            <p className="text-sm text-[#64748B] mt-1 max-w-xl">
              Manage your business enquiries, follow-ups, and opportunities from one place.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDashboardStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E7E0D3] text-xs font-semibold text-[#252720] hover:bg-[#FDFBF7] shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Enquiries Workspace</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Primary 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Enquiries */}
        <Link
          to="/admin/inquiries"
          className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] shadow-xs hover:border-[#174B39]/40 hover:shadow-sm transition group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:text-[#174B39] transition">
              Total Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
              <FiInbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#252720]">
              {loading ? '—' : totalCount}
            </span>
            <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center justify-between">
              <span>All records</span>
              <span className="text-[#174B39] font-semibold text-[10px] group-hover:translate-x-0.5 transition">View →</span>
            </p>
          </div>
        </Link>

        {/* KPI 2: New Enquiries */}
        <Link
          to="/admin/inquiries?status=new"
          className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] shadow-xs hover:border-[#B45309]/40 hover:shadow-sm transition group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:text-[#B45309] transition">
              New Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#B45309] flex items-center justify-center shrink-0 border border-[#FEF3C7]">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#252720]">
              {loading ? '—' : newCount}
            </span>
            <p className="text-[11px] text-[#B45309] font-medium mt-0.5 flex items-center justify-between">
              <span>Awaiting review</span>
              <span className="font-semibold text-[10px] group-hover:translate-x-0.5 transition">Filter →</span>
            </p>
          </div>
        </Link>

        {/* KPI 3: Follow-ups Due */}
        <Link
          to="/admin/inquiries?followUp=due"
          className={`p-4 sm:p-5 rounded-2xl border shadow-xs hover:shadow-sm transition group cursor-pointer flex flex-col justify-between ${
            followUpsDueCount > 0
              ? 'bg-[#FEF2F2]/60 border-[#FECACA] hover:border-[#DC2626]'
              : 'bg-[#FFFFFF] border-[#E7E0D3] hover:border-[#DC2626]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:text-[#DC2626] transition">
              Follow-ups Due
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                followUpsDueCount > 0
                  ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
              }`}
            >
              <FiAlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#252720]">
              {loading ? '—' : followUpsDueCount}
            </span>
            <p className="text-[11px] text-[#DC2626] font-medium mt-0.5 flex items-center justify-between">
              <span>{overdueFollowUps > 0 ? `${overdueFollowUps} overdue` : 'Scheduled today'}</span>
              <span className="font-semibold text-[10px] group-hover:translate-x-0.5 transition">Action →</span>
            </p>
          </div>
        </Link>

        {/* KPI 4: Qualified Leads */}
        <Link
          to="/admin/inquiries?leadStage=qualified"
          className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] shadow-xs hover:border-[#7C3AED]/40 hover:shadow-sm transition group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:text-[#7C3AED] transition">
              Qualified Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#7C3AED] flex items-center justify-center shrink-0 border border-[#DDD6FE]">
              <FiTarget className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#252720]">
              {loading ? '—' : qualifiedCount}
            </span>
            <p className="text-[11px] text-[#7C3AED] font-medium mt-0.5 flex items-center justify-between">
              <span>Ready for proposal</span>
              <span className="font-semibold text-[10px] group-hover:translate-x-0.5 transition">Filter →</span>
            </p>
          </div>
        </Link>

        {/* KPI 5: Proposals Sent */}
        <Link
          to="/admin/inquiries?leadStage=proposal-sent"
          className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] shadow-xs hover:border-[#0284C7]/40 hover:shadow-sm transition group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:text-[#0284C7] transition">
              Proposals Sent
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F8FC] text-[#0284C7] flex items-center justify-center shrink-0 border border-[#BAE6FD]">
              <FiSend className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#252720]">
              {loading ? '—' : proposalCount}
            </span>
            <p className="text-[11px] text-[#0284C7] font-medium mt-0.5 flex items-center justify-between">
              <span>Negotiations</span>
              <span className="font-semibold text-[10px] group-hover:translate-x-0.5 transition">Filter →</span>
            </p>
          </div>
        </Link>

        {/* KPI 6: Won Leads */}
        <Link
          to="/admin/inquiries?leadStage=won"
          className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E7E0D3] shadow-xs hover:border-[#15803D]/40 hover:shadow-sm transition group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] group-hover:text-[#15803D] transition">
              Won Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0 border border-[#D1FAE5]">
              <FiAward className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#252720]">
              {loading ? '—' : wonCount}
            </span>
            <p className="text-[11px] text-[#15803D] font-medium mt-0.5 flex items-center justify-between">
              <span>Converted clients</span>
              <span className="font-semibold text-[10px] group-hover:translate-x-0.5 transition">Filter →</span>
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Operational Insights: Follow-ups Schedule & Priority Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Follow-up Operations Radar */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E0D3] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center">
                  <FiClock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#252720] text-sm">
                    Follow-up Operations
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Status of client scheduling commitments
                  </p>
                </div>
              </div>

              <Link
                to="/admin/inquiries?followUp=due"
                className="text-[11px] font-semibold text-[#174B39] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {/* Overdue */}
              <Link
                to="/admin/inquiries?followUp=overdue"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] hover:border-[#DC2626]/30 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                  <span className="text-xs font-semibold text-[#991B1B]">Overdue Follow-ups</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#DC2626]">{overdueFollowUps}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-[#DC2626] group-hover:translate-x-0.5 transition" />
                </div>
              </Link>

              {/* Today */}
              <Link
                to="/admin/inquiries?followUp=today"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] hover:border-[#D97706]/30 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                  <span className="text-xs font-semibold text-[#92400E]">Due Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#D97706]">{todayFollowUps}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-[#D97706] group-hover:translate-x-0.5 transition" />
                </div>
              </Link>

              {/* Upcoming */}
              <Link
                to="/admin/inquiries?followUp=upcoming"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9FF] border border-[#E0F2FE] hover:border-[#0284C7]/30 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                  <span className="text-xs font-semibold text-[#075985]">Upcoming Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0284C7]">{upcomingFollowUps}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-[#0284C7] group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E7E0D3] flex items-center justify-between text-xs text-[#64748B]">
            <span>Urgent/High priority leads:</span>
            <span className="font-bold text-[#252720]">{urgentCount + highCount} leads</span>
          </div>
        </div>

        {/* Center: Service Classification Breakdown */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E0D3] mb-4">
              <div>
                <h3 className="font-bold text-[#252720] text-sm">
                  Service Inquiries Distribution
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Real distribution from incoming business requests
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720]">
                {totalCount} Total
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-3.5 bg-[#F1F5F9] rounded-full animate-pulse w-3/4"></div>
                <div className="h-3.5 bg-[#F1F5F9] rounded-full animate-pulse w-1/2"></div>
                <div className="h-3.5 bg-[#F1F5F9] rounded-full animate-pulse w-2/3"></div>
              </div>
            ) : totalCount === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748B]">
                No enquiries recorded yet to calculate distribution.
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'sap-support', label: 'SAP Support & Maintenance', bg: 'bg-[#174B39]' },
                  { key: 'sap-resource-request', label: 'SAP Staffing & Resources', bg: 'bg-[#7C3AED]' },
                  { key: 'staffing-request', label: 'Professional Staffing', bg: 'bg-[#0284C7]' },
                  { key: 'erp-inquiry', label: 'ERP Transformation', bg: 'bg-[#15803D]' },
                  { key: 'general', label: 'General Inquiries', bg: 'bg-[#64748B]' },
                ].map((category) => {
                  const count = typeCounts[category.key] || 0;
                  const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={category.key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#252720]">{category.label}</span>
                        <span className="font-semibold text-[#64748B]">
                          {count} <span className="text-[10px] font-normal text-[#94A3B8]">({percent}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#FDFBF7] rounded-full overflow-hidden border border-[#E7E0D3]">
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

          <div className="pt-3 mt-3 border-t border-[#E7E0D3] text-right">
            <Link
              to="/admin/inquiries"
              className="text-[11px] font-semibold text-[#174B39] hover:underline"
            >
              Filter by service type →
            </Link>
          </div>
        </div>

        {/* Right: Quick Lead Actions */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#252720] text-sm">
              Quick Lead Shortcuts
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5 mb-3.5">
              Instant filters for your daily sales & consulting review
            </p>

            <div className="space-y-2">
              <Link
                to="/admin/inquiries?priority=urgent"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E7E0D3] hover:border-[#DC2626]/30 hover:bg-[#FEF2F2]/30 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                  <FiAlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#252720] block group-hover:text-[#DC2626]">
                    Urgent Priority Leads
                  </span>
                  <span className="text-[10px] text-[#64748B] block truncate">
                    {urgentCount} critical enquiries requiring fast response
                  </span>
                </div>
                <FiChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#DC2626] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/admin/inquiries?assignedTo=unassigned"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E7E0D3] hover:border-[#174B39]/30 hover:bg-[#EAF0E8]/30 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center shrink-0">
                  <FiUser className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#252720] block group-hover:text-[#174B39]">
                    Unassigned Enquiries
                  </span>
                  <span className="text-[10px] text-[#64748B] block truncate">
                    Assign ownership to team members
                  </span>
                </div>
                <FiChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#174B39] group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/admin/inquiries"
                className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E7E0D3] hover:border-[#7C3AED]/30 hover:bg-[#EAF0E8]/30 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#EAF0E8] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <FiFileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-[#252720] block group-hover:text-[#7C3AED]">
                    Export Database CSV
                  </span>
                  <span className="text-[10px] text-[#64748B] block truncate">
                    Download sanitized spreadsheet export
                  </span>
                </div>
                <FiChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#E7E0D3] flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              MongoDB Atlas Live
            </span>
            <Link to="/admin/settings" className="hover:text-[#252720] font-medium">
              Settings →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Enquiries Workspace */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E0D3] shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-5 sm:px-6 sm:py-4 border-b border-[#E7E0D3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#252720] text-sm sm:text-base">
              Latest Incoming Enquiries
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Direct form submissions from your prospective enterprise clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#174B39] hover:text-[#103728] hover:underline transition"
            >
              <span>Open full workspace ({totalCount})</span>
              <FiChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Error State with Retry */}
        {error && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto mb-3">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#252720]">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174B39] text-white text-xs font-medium cursor-pointer"
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
        {!loading && !error && recentInquiries.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-3">
              <FiInbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#252720]">No enquiries received yet</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              When prospective clients submit forms on your public website, they will appear here in real time.
            </p>
          </div>
        )}

        {/* Table View */}
        {!loading && !error && recentInquiries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E7E0D3] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-4 sm:px-6">Customer & Company</th>
                  <th className="py-3.5 px-4">Service Type</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Lead Stage</th>
                  <th className="py-3.5 px-4">Follow-up</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D3] text-xs">
                {recentInquiries.map((inquiry) => (
                  <tr
                    key={inquiry._id}
                    className="hover:bg-[#F8FAFC]/80 transition group cursor-pointer"
                    onClick={() => navigate(`/admin/inquiries?id=${inquiry._id}`)}
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#174B39] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E0E7FF]">
                          {(inquiry.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#252720] group-hover:text-[#174B39] transition truncate">
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720]">
                        {formatTypeLabel(inquiry.type)}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      {renderPriorityBadge(inquiry.priority)}
                    </td>

                    {/* Stage Badge */}
                    <td className="py-3.5 px-4">
                      {renderStageBadge(inquiry.leadStage || inquiry.status)}
                    </td>

                    {/* Follow-up Indicator */}
                    <td className="py-3.5 px-4">
                      {inquiry.followUpStatus === 'scheduled' && inquiry.nextFollowUpAt ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB]">
                          <FiClock className="w-3 h-3" />
                          {new Date(inquiry.nextFollowUpAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] text-[11px]">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/admin/inquiries?id=${inquiry._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#174B39] hover:bg-[#EAF0E8] transition"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
