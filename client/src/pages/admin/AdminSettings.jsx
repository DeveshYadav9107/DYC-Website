import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/api';
import {
  FiSave,
  FiCheckCircle,
  FiAlertTriangle,
  FiBriefcase,
  FiPhone,
  FiGlobe,
  FiToggleRight,
  FiRefreshCw,
} from 'react-icons/fi';

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
      defaultDescription: '',
    },
    features: {
      showCareers: false,
      showCaseStudies: false,
      showEcommerce: false,
      showBlog: true,
    },
  });

  const [status, setStatus] = useState({
    loading: true,
    saving: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const response = await getSettings();
        const data = response?.data || response;
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            seo: { ...prev.seo, ...data.seo },
            features: { ...prev.features, ...data.features },
          }));
        }
      } catch (err) {
        setStatus((prev) => ({ ...prev, error: 'Failed to load system settings from server.' }));
        console.error(err);
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchSettingsData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleToggle = (featureName) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName]: !prev.features[featureName],
      },
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatus((prev) => ({ ...prev, saving: true, error: null, success: false }));
    try {
      await updateSettings(formData);
      setStatus((prev) => ({ ...prev, saving: false, success: true }));
      setTimeout(() => setStatus((prev) => ({ ...prev, success: false })), 3500);
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        saving: false,
        error: err.response?.data?.message || 'Failed to persist settings.',
      }));
      console.error(err);
    }
  };

  if (status.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-[#174B39] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#64748B] font-medium">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252720]">
            Global Site Settings
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Configure company identity, contact information, SEO defaults, and feature visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={status.saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold shadow-xs transition cursor-pointer ${
              status.saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {status.saving ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <FiSave className="w-3.5 h-3.5" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {status.error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs font-medium text-[#DC2626] flex items-center gap-2.5">
          <FiAlertTriangle className="w-4 h-4 shrink-0" />
          <span>{status.error}</span>
        </div>
      )}

      {status.success && (
        <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] text-xs font-medium text-[#15803D] flex items-center gap-2.5">
          <FiCheckCircle className="w-4 h-4 shrink-0" />
          <span>System configuration successfully updated and saved!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Company Identity Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E7E0D3] shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E7E0D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
              <FiBriefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252720] text-sm sm:text-base">
                Company Identity
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Official enterprise legal name and branding slogan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Company Legal Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                placeholder="e.g. Dinesh Yadav & Company"
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Company Tagline / Subtitle
              </label>
              <input
                type="text"
                name="companyTagline"
                value={formData.companyTagline || ''}
                onChange={handleChange}
                placeholder="e.g. We help businesses run smarter with the right people and the right systems."
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                GST / Tax Registration Number
              </label>
              <input
                type="text"
                name="gst"
                value={formData.gst || ''}
                onChange={handleChange}
                placeholder="e.g. 06AOZPY8747D1ZX"
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition uppercase"
              />
            </div>
          </div>
        </div>

        {/* 2. Contact Information Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E7E0D3] shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E7E0D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0E8] text-[#7C3AED] flex items-center justify-center shrink-0 border border-[#DDD6FE]">
              <FiPhone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252720] text-sm sm:text-base">
                Contact & Office Details
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Displayed in website footer, header, and inquiry auto-replies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Primary Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+91 95883 09979"
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Primary Support Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="info@dycinfo.com"
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Corporate Office Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="E-52A, Suncity, Rewari, Haryana, India"
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 3. SEO Defaults Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E7E0D3] shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E7E0D3]">
            <div className="w-9 h-9 rounded-xl bg-[#E8F8FC] text-[#0284C7] flex items-center justify-center shrink-0 border border-[#BAE6FD]">
              <FiGlobe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252720] text-sm sm:text-base">
                Search Engine Optimization (SEO)
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Default metadata tags used for search indexing and social previews
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Default Meta Title
              </label>
              <input
                type="text"
                name="seo.defaultTitle"
                value={formData.seo?.defaultTitle || ''}
                onChange={handleChange}
                placeholder="e.g. Dinesh Yadav & Company | Enterprise SAP & ERP Consulting"
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252720] mb-1.5">
                Default Meta Description
              </label>
              <textarea
                name="seo.defaultDescription"
                value={formData.seo?.defaultDescription || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Enterprise SAP consulting, staffing solutions and custom ERP software."
                className="w-full px-3.5 py-2.5 text-xs text-[#252720] bg-[#FFFFFF] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/10 outline-none transition resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* 4. Feature Flags Card */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border border-[#E7E0D3] shadow-xs">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E7E0D3]">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0 border border-[#D1FAE5]">
              <FiToggleRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#252720] text-sm sm:text-base">
                Feature Flags & Visibility
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Toggle public visibility of upcoming sections and service modules
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'showCareers',
                title: 'Careers & Hiring Section',
                desc: 'Show job openings and application forms on public website',
              },
              {
                id: 'showCaseStudies',
                title: 'Client Case Studies',
                desc: 'Display success stories and enterprise implementation portfolios',
              },
              {
                id: 'showEcommerce',
                title: 'E-Commerce Services',
                desc: 'Enable commerce solutions & product catalog features',
              },
              {
                id: 'showBlog',
                title: 'Enterprise Insights / Blog',
                desc: 'Publish industry articles, SAP updates, and tech guides',
              },
            ].map((feature) => {
              const enabled = Boolean(formData.features?.[feature.id]);
              return (
                <div
                  key={feature.id}
                  onClick={() => handleToggle(feature.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 select-none ${
                    enabled
                      ? 'bg-[#EAF0E8]/30 border-[#174B39]/30'
                      : 'bg-[#FFFFFF] border-[#E7E0D3] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#252720]">{feature.title}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{feature.desc}</p>
                  </div>

                  {/* Switch Pill */}
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                      enabled ? 'bg-[#174B39]' : 'bg-[#E2E8F0]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={status.saving}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-semibold shadow-xs transition cursor-pointer ${
              status.saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {status.saving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
