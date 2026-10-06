import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInquiries } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    activeServices: 4
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const inquiries = await getInquiries();
        setStats({
          totalInquiries: inquiries.length,
          newInquiries: inquiries.filter(i => i.status === 'new').length,
          activeServices: 4
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-accent-400">
          <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center text-2xl">
            📬
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">New Inquiries</p>
            <p className="text-3xl font-bold text-gray-900">{stats.newInquiries}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-2xl">
            🗃️
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Inquiries</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-2xl">
            ⚙️
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Services</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeServices}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          <Link to="/admin/inquiries" className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary-100 group-hover:text-primary-700 rounded-full flex items-center justify-center transition">
              👀
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary-700">View Inquiries</h3>
              <p className="text-sm text-gray-500">Read and manage form submissions</p>
            </div>
          </Link>
          
          <Link to="/admin/settings" className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary-100 group-hover:text-primary-700 rounded-full flex items-center justify-center transition">
              ⚙️
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary-700">Site Settings</h3>
              <p className="text-sm text-gray-500">Update global configuration</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
