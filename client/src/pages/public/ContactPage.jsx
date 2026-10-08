import { useState } from 'react';
import siteConfig from '../../config/siteConfig';
import { submitInquiry } from '../../services/api';
import Reveal from '../../components/animations/Reveal';

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
    <div className="bg-bg-primary min-h-screen text-text-primary">
      {/* Header */}
      <div className="bg-white text-text-primary py-24 md:py-32 px-6 relative overflow-hidden border-b border-border-light">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/contact-banner.png" alt="Contact Us Banner" className="w-full h-full object-cover object-center" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pt-10">
          <Reveal>
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-[#102A43]">Contact Us</h1>
              <p className="text-xl text-text-secondary leading-relaxed">
                Ready to optimize your enterprise? Reach out to our team of experts for tailored SAP and staffing solutions.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Information */}
          <Reveal>
            <div>
              <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                Connect With Us
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-10 tracking-tight">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-surface border border-border-light rounded-xl shadow-sm flex items-center justify-center text-2xl group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
                    📍
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Head Office</h3>
                    <p className="text-text-secondary mt-1 leading-relaxed">{siteConfig.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-surface border border-border-light rounded-xl shadow-sm flex items-center justify-center text-2xl group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
                    📞
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Phone</h3>
                    <p className="text-text-secondary mt-1 leading-relaxed">{siteConfig.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-surface border border-border-light rounded-xl shadow-sm flex items-center justify-center text-2xl group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Email</h3>
                    <p className="text-text-secondary mt-1 leading-relaxed">{siteConfig.contact.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-surface border border-border rounded-2xl shadow-surface">
                <h3 className="font-bold text-xl text-text-primary mb-2">Support Hours</h3>
                <p className="text-text-secondary">Monday - Friday: 9:00 AM - 6:00 PM (IST)</p>
                <p className="text-primary text-sm mt-3 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  24/7 Support available for active SAP SLA clients.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Contact Form */}
          <Reveal delay={0.2}>
            <div className="bg-surface border border-border shadow-surface rounded-2xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-text-primary mb-8 tracking-tight">Send a Message</h2>
              
              {status.submitted ? (
                <div className="bg-primary-light/50 border border-primary/30 text-primary p-8 rounded-xl text-center animate-fadeIn">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-bold text-lg mb-2 text-text-primary">Message Sent Successfully!</h3>
                  <p className="text-sm">Thank you for reaching out. One of our experts will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Full Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-text-primary placeholder-text-muted/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Email *</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-text-primary placeholder-text-muted/50"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-text-primary placeholder-text-muted/50"
                        placeholder="+91..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Company</label>
                      <input 
                        type="text" 
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-text-primary placeholder-text-muted/50"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Inquiry Type</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-text-primary"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sap-support">SAP Support & Maintenance</option>
                      <option value="sap-resource-request">SAP Resources Request</option>
                      <option value="staffing-request">Manpower & Staffing</option>
                      <option value="erp-inquiry">ERP Software Solutions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Message *</label>
                    <textarea 
                      name="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-bg-primary border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none text-text-primary placeholder-text-muted/50"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  {status.error && (
                    <div className="text-red-400 text-sm font-medium mb-2">
                      Something went wrong. Please try again later.
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={status.loading}
                    className={`w-full btn-primary py-4 text-lg ${status.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {status.loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
