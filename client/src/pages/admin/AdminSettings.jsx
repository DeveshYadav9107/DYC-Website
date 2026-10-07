import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/api';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyTagline: '',
    phone: '',
    email: '',
    address: '',
    gst: '',
    seo: {
      defaultTitle: '',
      defaultDescription: ''
    },
    features: {
      showCareers: false,
      showCaseStudies: false,
      showEcommerce: false,
      showBlog: true
    }
  });

  const [status, setStatus] = useState({ loading: true, saving: false, error: null, success: false });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success && response.data) {
          // Initialize state with fetched data or empty defaults if missing
          setFormData(prev => ({
            ...prev,
            ...response.data,
            seo: { ...prev.seo, ...response.data.seo },
            features: { ...prev.features, ...response.data.features }
          }));
        }
      } catch (err) {
        setStatus(prev => ({ ...prev, error: 'Failed to load settings.' }));
        console.error(err);
      } finally {
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties (e.g. "seo.defaultTitle")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prev => ({ ...prev, saving: true, error: null, success: false }));
    try {
      await updateSettings(formData);
      setStatus(prev => ({ ...prev, saving: false, success: true }));
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      setStatus(prev => ({ ...prev, saving: false, error: 'Failed to save settings.' }));
      console.error(err);
    }
  };

  if (status.loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Site Settings</h1>
          <p className="text-gray-600 mt-1">Manage global configuration for your website.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={status.saving}
          className={`bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2 ${status.saving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {status.saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {status.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-red-700">{status.error}</p>
        </div>
      )}

      {status.success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
          <p className="text-green-700">Settings saved successfully!</p>
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* Company Identity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-primary-500">🏢</span> Company Identity
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input 
                type="text" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Tagline</label>
              <input 
                type="text" 
                name="companyTagline" 
                value={formData.companyTagline} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-primary-500">📞</span> Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input 
                type="text" 
                name="gst" 
                value={formData.gst} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-primary-500">🔍</span> SEO Defaults
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Title</label>
              <input 
                type="text" 
                name="seo.defaultTitle" 
                value={formData.seo.defaultTitle} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                placeholder="e.g. My Company | Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
              <textarea 
                name="seo.defaultDescription" 
                value={formData.seo.defaultDescription} 
                onChange={handleChange} 
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-primary-500">✨</span> Feature Flags
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                name="features.showCareers" 
                checked={formData.features.showCareers} 
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">Show Careers Section</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                name="features.showCaseStudies" 
                checked={formData.features.showCaseStudies} 
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">Show Case Studies</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                name="features.showEcommerce" 
                checked={formData.features.showEcommerce} 
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">Enable E-Commerce</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                name="features.showBlog" 
                checked={formData.features.showBlog} 
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">Enable Blog</span>
            </label>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AdminSettings;
