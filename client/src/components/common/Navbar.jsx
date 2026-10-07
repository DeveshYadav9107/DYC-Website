import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';

const Navbar = () => {
  return (
    <header className="bg-bg-primary/80 backdrop-blur-md border-b border-border py-4 px-6 md:px-12 sticky top-0 z-50 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-bold text-white tracking-tight">
          {siteConfig.company.shortName}
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <Link to="/about" className="hover:text-white transition-colors">About</Link>
        
        <div className="relative group cursor-pointer py-2">
          <span className="hover:text-white transition-colors">Services ▾</span>
          <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
            <div className="bg-surface border border-border rounded-xl shadow-surface flex flex-col py-2 min-w-[220px]">
              <Link to="/services/staffing" className="px-5 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover transition-colors">Manpower Supply</Link>
              <Link to="/services/sap-resources" className="px-5 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover transition-colors">SAP Resources</Link>
              <Link to="/services/sap-support" className="px-5 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover transition-colors">SAP Support</Link>
              <Link to="/services/erp-solutions" className="px-5 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover transition-colors">ERP Solutions</Link>
            </div>
          </div>
        </div>

        <Link to="/sap-capabilities" className="hover:text-white transition-colors">SAP</Link>
        <Link to="/industries" className="hover:text-white transition-colors">Industries</Link>
        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
      </nav>

      <div className="hidden md:block">
        <Link to="/contact" className="btn-primary px-6 py-2.5 text-sm">
          Talk to an Expert
        </Link>
      </div>

      <button className="md:hidden text-2xl text-text-secondary hover:text-white transition-colors">
        ☰
      </button>
    </header>
  );
};

export default Navbar;
