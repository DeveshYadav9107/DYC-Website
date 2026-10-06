import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 md:px-12 sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-bold text-primary-900">
          {siteConfig.company.shortName}
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6 font-medium text-gray-700">
        <Link to="/" className="hover:text-primary-600 transition">Home</Link>
        <Link to="/about" className="hover:text-primary-600 transition">About</Link>
        
        <div className="relative group cursor-pointer py-2">
          <span className="hover:text-primary-600 transition">Services ▾</span>
          <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
            <div className="bg-white shadow-lg border rounded min-w-[200px] flex flex-col py-2">
              <Link to="/services/staffing" className="px-4 py-2 hover:bg-gray-50">Manpower Supply</Link>
              <Link to="/services/sap-resources" className="px-4 py-2 hover:bg-gray-50">SAP Resources</Link>
              <Link to="/services/sap-support" className="px-4 py-2 hover:bg-gray-50">SAP Support</Link>
              <Link to="/services/erp-solutions" className="px-4 py-2 hover:bg-gray-50">ERP Solutions</Link>
            </div>
          </div>
        </div>

        <Link to="/sap-capabilities" className="hover:text-primary-600 transition">SAP</Link>
        <Link to="/industries" className="hover:text-primary-600 transition">Industries</Link>
        <Link to="/contact" className="hover:text-primary-600 transition">Contact</Link>
      </nav>

      <div className="hidden md:block">
        <Link to="/contact" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded shadow-sm transition font-medium">
          Talk to an Expert
        </Link>
      </div>

      <button className="md:hidden text-2xl text-gray-700">
        ☰
      </button>
    </header>
  );
};

export default Navbar;
