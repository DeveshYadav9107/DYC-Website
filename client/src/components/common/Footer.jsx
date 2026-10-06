import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white pt-16 pb-8 px-6 md:px-12 border-t-4 border-accent-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">{siteConfig.company.name}</h3>
          <p className="text-primary-200 mb-6 leading-relaxed">
            {siteConfig.company.tagline}
          </p>
          <div className="flex flex-col gap-2 text-sm text-primary-100">
            <p>📍 {siteConfig.contact.address}</p>
            <p>📞 {siteConfig.contact.phone}</p>
            <p>✉️ {siteConfig.contact.email}</p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Services</h4>
          <ul className="flex flex-col gap-3 text-primary-200">
            <li><Link to="/services/staffing" className="hover:text-accent-300 transition">Manpower Supply</Link></li>
            <li><Link to="/services/sap-resources" className="hover:text-accent-300 transition">SAP Resources</Link></li>
            <li><Link to="/services/sap-support" className="hover:text-accent-300 transition">SAP Support</Link></li>
            <li><Link to="/services/erp-solutions" className="hover:text-accent-300 transition">ERP Solutions</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-primary-200">
            <li><Link to="/about" className="hover:text-accent-300 transition">About Us</Link></li>
            <li><Link to="/sap-capabilities" className="hover:text-accent-300 transition">SAP Capabilities</Link></li>
            <li><Link to="/industries" className="hover:text-accent-300 transition">Industries We Serve</Link></li>
            <li><Link to="/our-approach" className="hover:text-accent-300 transition">Our Approach</Link></li>
            <li><Link to="/contact" className="hover:text-accent-300 transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* CTA */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Ready to start?</h4>
          <p className="text-primary-200 mb-6">Talk to our experts about your business needs.</p>
          <Link to="/contact" className="inline-block bg-accent-500 hover:bg-accent-400 text-white px-6 py-3 rounded shadow font-medium transition">
            Get in Touch
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center text-sm text-primary-300">
        <p>© {new Date().getFullYear()} {siteConfig.company.name}. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
