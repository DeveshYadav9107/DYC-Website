import { useState, useEffect } from 'react';
import { getInquiries, updateInquiryStatus } from '../../services/api';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await getInquiries();
        setInquiries(data);
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
      setInquiries(inquiries.map(inq => 
        inq._id === id ? { ...inq, status: newStatus } : inq
      ));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">New</span>;
      case 'read':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">Read</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getTypeLabel = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded shadow transition text-sm font-medium">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading inquiries...</div>
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
                      {inquiry.message}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">
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
    </div>
  );
};

export default AdminInquiries;
