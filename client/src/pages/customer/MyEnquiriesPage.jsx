import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyInquiries } from '../../services/api';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiFileText,
  FiPlus,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiArrowUpRight,
  FiInbox,
  FiUser,
  FiRefreshCw,
} from 'react-icons/fi';

const statusConfig = {
  new: { label: 'Received', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  contacted: { label: 'In Review', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  qualified: { label: 'Qualified', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  proposal: { label: 'Proposal Sent', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  converted: { label: 'Active Project', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Completed', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const MyEnquiriesPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load your inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-[#E2E8F0]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold mb-2">
                <FiUser className="text-xs" />
                <span>Client Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#11183F] tracking-tight">
                My Enquiries
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Track all consulting requests, staffing orders, and SAP project inquiries for{' '}
                <span className="font-semibold text-[#11183F]">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={fetchEnquiries}
                disabled={loading}
                className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#11183F] hover:bg-[#F1F5F9] transition cursor-pointer"
                title="Refresh inquiries"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#172554] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <FiPlus className="w-4 h-4" />
                <span>Submit New Enquiry</span>
              </Link>
            </div>
          </div>

          {/* Content Area */}
          <div className="mt-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-[#64748B] font-medium">Loading your enquiries...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-center max-w-md mx-auto">
                <p className="text-sm font-semibold text-[#DC2626] mb-3">{error}</p>
                <button
                  type="button"
                  onClick={fetchEnquiries}
                  className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E2E8F0] p-10 sm:p-16 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#11183F]">No enquiries submitted yet</h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-sm mx-auto leading-relaxed">
                  Have an enterprise SAP requirement, need staffing solutions, or ERP implementation? Submit your first enquiry to get connected with our experts.
                </p>
                <div className="mt-6">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-[#172554] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition"
                  >
                    <span>Talk to our team</span>
                    <FiArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => {
                  const statusInfo = statusConfig[inquiry.status] || statusConfig.new;
                  const dateStr = new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={inquiry._id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs hover:border-[#CBD5E1] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] uppercase tracking-wide">
                            {inquiry.type?.replace(/-/g, ' ')}
                          </span>
                          {inquiry.service && (
                            <span className="text-xs text-[#64748B]">
                              • {inquiry.service}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <FiCalendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      {inquiry.company && (
                        <p className="text-xs font-semibold text-[#64748B] mb-1">
                          Company: <span className="text-[#11183F]">{inquiry.company}</span>
                        </p>
                      )}

                      {inquiry.message && (
                        <p className="text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9] mt-2">
                          "{inquiry.message}"
                        </p>
                      )}

                      {/* Additional Details Grid if available */}
                      {(inquiry.sapModule || inquiry.requiredRole || inquiry.urgency) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F1F5F9] text-xs">
                          {inquiry.sapModule && (
                            <div>
                              <span className="text-[#94A3B8]">Module: </span>
                              <span className="font-semibold text-[#11183F]">{inquiry.sapModule}</span>
                            </div>
                          )}
                          {inquiry.requiredRole && (
                            <div>
                              <span className="text-[#94A3B8]">Role: </span>
                              <span className="font-semibold text-[#11183F]">{inquiry.requiredRole}</span>
                            </div>
                          )}
                          {inquiry.urgency && (
                            <div>
                              <span className="text-[#94A3B8]">Urgency: </span>
                              <span className="font-semibold capitalize text-[#11183F]">{inquiry.urgency}</span>
                            </div>
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
      </div>
    </PublicLayout>
  );
};

export default MyEnquiriesPage;
