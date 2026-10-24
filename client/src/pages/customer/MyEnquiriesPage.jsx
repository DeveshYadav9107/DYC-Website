import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyInquiries } from '../../services/api';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiPlus,
  FiCalendar,
  FiArrowUpRight,
  FiInbox,
  FiUser,
  FiRefreshCw,
} from 'react-icons/fi';

const statusConfig = {
  new: { label: 'Received', bg: 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/20' },
  contacted: { label: 'In Review', bg: 'bg-[#FDFBF7] text-[#B88A3B] border-[#B88A3B]/30' },
  qualified: { label: 'Qualified', bg: 'bg-[#EAF0E8] text-[#174B39] border-[#174B39]/30' },
  proposal: { label: 'Proposal Sent', bg: 'bg-[#FDFBF7] text-[#B88A3B] border-[#B88A3B]/40' },
  converted: { label: 'Active Project', bg: 'bg-[#174B39] text-white border-[#103728]' },
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
      <div className="min-h-screen bg-[#F8F5EE] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-[#E7E0D3]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 text-xs font-bold mb-2">
                <FiUser className="text-xs" />
                <span>Client Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight">
                My Enquiries
              </h1>
              <p className="text-xs sm:text-sm text-[#66665D] mt-1">
                Track all consulting requests, staffing orders, and SAP project inquiries for{' '}
                <span className="font-semibold text-[#174B39]">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={fetchEnquiries}
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
                <span>Submit New Enquiry</span>
              </Link>
            </div>
          </div>

          {/* Content Area */}
          <div className="mt-8">
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
                  onClick={fetchEnquiries}
                  className="px-4 py-2 rounded-full bg-[#DC2626] text-white text-xs font-semibold hover:bg-red-700 transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E0D3] p-10 sm:p-16 text-center max-w-xl mx-auto shadow-[0_4px_24px_rgba(37,39,32,0.04)]">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4">
                  <FiInbox className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#252720]">No enquiries submitted yet</h3>
                <p className="text-xs sm:text-sm text-[#66665D] mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                  Have an enterprise SAP requirement, need staffing solutions, or ERP implementation? Submit your first enquiry to get connected with our experts.
                </p>
                <div className="mt-6">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(23,75,57,0.25)] transition"
                  >
                    <span>Talk to Our Team</span>
                    <FiArrowUpRight className="w-4 h-4 text-[#D7B875]" />
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
                      className="bg-white rounded-2xl border border-[#E7E0D3] p-5 sm:p-6 shadow-[0_2px_12px_rgba(37,39,32,0.03)] hover:border-[#174B39]/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720] uppercase tracking-wide">
                            {inquiry.type?.replace(/-/g, ' ')}
                          </span>
                          {inquiry.service && (
                            <span className="text-xs text-[#66665D]">
                              • {inquiry.service}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#8A897C]">
                          <FiCalendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      {inquiry.company && (
                        <p className="text-xs font-semibold text-[#66665D] mb-1">
                          Company: <span className="text-[#252720] font-bold">{inquiry.company}</span>
                        </p>
                      )}

                      {inquiry.message && (
                        <p className="text-sm text-[#252720] leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E7E0D3] mt-2">
                          "{inquiry.message}"
                        </p>
                      )}

                      {/* Additional Details Grid if available */}
                      {(inquiry.sapModule || inquiry.requiredRole || inquiry.urgency) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#E7E0D3] text-xs">
                          {inquiry.sapModule && (
                            <div>
                              <span className="text-[#8A897C]">Module: </span>
                              <span className="font-semibold text-[#252720]">{inquiry.sapModule}</span>
                            </div>
                          )}
                          {inquiry.requiredRole && (
                            <div>
                              <span className="text-[#8A897C]">Role: </span>
                              <span className="font-semibold text-[#252720]">{inquiry.requiredRole}</span>
                            </div>
                          )}
                          {inquiry.urgency && (
                            <div>
                              <span className="text-[#8A897C]">Urgency: </span>
                              <span className="font-semibold capitalize text-[#252720]">{inquiry.urgency}</span>
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
