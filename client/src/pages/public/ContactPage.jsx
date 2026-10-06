import { useState } from 'react';
import siteConfig from '../../config/siteConfig';
import { submitInquiry } from '../../services/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'general',
    message: '',
  });

  const [status, setStatus] = useState({ submitted: false, error: false, loading: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitted: false, error: false, loading: true });

    try {
      await submitInquiry(formData);
      setStatus({ submitted: true, error: false, loading: false });
      
      // Reset form after 4 seconds
      setTimeout(() => {
        setStatus({ submitted: false, error: false, loading: false });
        setFormData({ name: '', email: '', phone: '', company: '', type: 'general', message: '' });
      }, 4000);
    } catch (err) {
      console.error('Submission failed', err);
      setStatus({ submitted: false, error: true, loading: false });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-primary-200 max-w-2xl mx-auto">
            Ready to optimize your enterprise? Reach out to our team of experts for tailored SAP and staffing solutions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-primary-900 mb-8">Get in Touch</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-900">Head Office</h3>
                  <p className="text-gray-600 mt-1">{siteConfig.contact.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                  📞
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-900">Phone</h3>
                  <p className="text-gray-600 mt-1">{siteConfig.contact.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                  ✉️
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary-900">Email</h3>
                  <p className="text-gray-600 mt-1">{siteConfig.contact.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-primary-50 rounded-xl border border-primary-100">
              <h3 className="font-bold text-xl text-primary-900 mb-2">Support Hours</h3>
              <p className="text-primary-700">Monday - Friday: 9:00 AM - 6:00 PM (IST)</p>
              <p className="text-primary-700 mt-2">24/7 Support available for active SAP SLA clients.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Send a Message</h2>
            
            {status.submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center animate-fadeIn">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-bold text-lg mb-2">Message Sent Successfully!</h3>
                <p>Thank you for reaching out. One of our experts will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      placeholder="+91..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="sap-support">SAP Support & Maintenance</option>
                    <option value="sap-resource-request">SAP Resources Request</option>
                    <option value="staffing-request">Manpower & Staffing</option>
                    <option value="erp-inquiry">ERP Software Solutions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea 
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                {status.error && (
                  <div className="text-red-600 text-sm font-medium mb-2">
                    Something went wrong. Please try again later.
                  </div>
                )}
                <button 
                  type="submit"
                  disabled={status.loading}
                  className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded transition shadow-sm ${status.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {status.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
