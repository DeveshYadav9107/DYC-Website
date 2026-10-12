import { useState, useEffect } from 'react';
import { getInquiries, updateInquiryStatus } from '../../services/api';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await getInquiries();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setInquiries(list);
      } catch (error) {
        console.error('Failed to fetch inquiries', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateInquiryStatus(id, newStatus);
      // Update local state
      setInquiries(prev => prev.map(inq => 
        inq._id === id ? { ...inq, status: newStatus } : inq
      ));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const exportCSV = () => {
    if (!inquiries.length) return;
    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Company', 'Type', 'Status', 'Message'];
    const rows = inquiries.map(inq => [
      inq._id,
      new Date(inq.createdAt).toISOString(),
      `"${(inq.name || '').replace(/"/g, '""')}"`,
      `"${(inq.email || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.company || '').replace(/"/g, '""')}"`,
      inq.type,
      inq.status,
      `"${(inq.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dyc_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">New</span>;
      case 'contacted':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Contacted</span>;
      case 'qualified':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider">Qualified</span>;
      case 'converted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">Converted</span>;
      case 'closed':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">Closed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getTypeLabel = (type = '') => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and respond to client inquiries</p>
        </div>
        <button 
          onClick={exportCSV}
          disabled={inquiries.length === 0}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow transition text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No inquiries received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Name / Company</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Message snippet</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map(inquiry => (
                  <tr key={inquiry._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">{getStatusBadge(inquiry.status)}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{inquiry.name}</div>
                      <div className="text-sm text-gray-500">{inquiry.company || inquiry.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-primary-700 font-medium">
                        {getTypeLabel(inquiry.type)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                      {inquiry.message || 'No message provided'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm px-3 py-1 rounded hover:bg-primary-50 transition"
                      >
                        View
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedInquiry.name}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">Email</span>
                  <p className="font-medium text-gray-800 break-all">{selectedInquiry.email || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">Phone</span>
                  <p className="font-medium text-gray-800">{selectedInquiry.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">Company</span>
                  <p className="font-medium text-gray-800">{selectedInquiry.company || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">Type</span>
                  <p className="font-medium text-gray-800">{getTypeLabel(selectedInquiry.type)}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase">Status</span>
                <div className="mt-1 flex items-center gap-3">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase">Message</span>
                <div className="mt-1 bg-gray-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100">
                  {selectedInquiry.message || 'No message provided.'}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition"
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

export default AdminInquiries;
