import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';

const Footer = () => {
  return (
    <footer className="bg-[#103728] text-white pt-16 pb-10 px-4 sm:px-6 lg:px-12 border-t border-[#174B39]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-serif font-bold !text-white mb-3 tracking-tight">
            {siteConfig.company.name}
          </h3>
          <p className="text-xs uppercase tracking-widest text-[#D7B875] font-semibold mb-3">
            Business Solution
          </p>
          <p className="text-[#EAF0E8]/80 text-sm mb-6 leading-relaxed">
            {siteConfig.company.tagline}
          </p>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#EAF0E8]/70">
            <p className="flex items-start gap-2">
              <span className="text-[#D7B875]">📍</span>
              <span>{siteConfig.contact.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#D7B875]">📞</span>
              <span>{siteConfig.contact.phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#D7B875]">✉️</span>
              <span>{siteConfig.contact.email}</span>
            </p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-base font-serif font-bold mb-4 !text-white uppercase tracking-wider">
            Services
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-[#EAF0E8]/85">
            <li><Link to="/services/staffing" className="hover:text-white transition-colors">Manpower Supply</Link></li>
            <li><Link to="/services/sap-resources" className="hover:text-white transition-colors">SAP Resources</Link></li>
            <li><Link to="/services/sap-support" className="hover:text-white transition-colors">SAP Support</Link></li>
            <li><Link to="/services/erp-solutions" className="hover:text-white transition-colors">ERP Solutions</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-base font-serif font-bold mb-4 !text-white uppercase tracking-wider">
            Navigation
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm text-[#EAF0E8]/85">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-colors">Careers & Openings</Link></li>
            <li><Link to="/candidate/portal" className="hover:text-white transition-colors">Candidate Portal</Link></li>
            <li><Link to="/sap-capabilities" className="hover:text-white transition-colors">SAP Capabilities</Link></li>
            <li><Link to="/industries" className="hover:text-white transition-colors">Industries We Serve</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* CTA */}
        <div>
          <h4 className="text-base font-serif font-bold mb-4 !text-white uppercase tracking-wider">
            Ready To Start?
          </h4>
          <p className="text-sm text-[#EAF0E8]/85 mb-6 leading-relaxed">
            Talk to our consultants about your SAP, staffing, and ERP requirements.
          </p>
          <Link 
            to="/contact" 
            className="inline-block bg-[#174B39] hover:bg-[#1E5C46] border border-[#B88A3B]/40 text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-all shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
          >
            Get in Touch
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#174B39] flex flex-col md:flex-row justify-between items-center text-xs text-[#EAF0E8]/60">
        <p>© {new Date().getFullYear()} {siteConfig.company.name}. All rights reserved.</p>
        <div className="flex gap-4 mt-3 md:mt-0">
          <span className="text-[#D7B875]">SAP · ERP · STAFFING</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
