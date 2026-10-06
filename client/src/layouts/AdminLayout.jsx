import { Link, useLocation, useNavigate } from 'react-router-dom';
import siteConfig from '../config/siteConfig';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Inquiries', path: '/admin/inquiries', icon: '✉️' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-primary-800">
          <Link to="/" className="text-xl font-bold tracking-wider">
            {siteConfig.company.shortName} <span className="text-accent-400">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? 'bg-primary-800 text-white shadow-inner border-l-4 border-accent-400' : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-primary-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-primary-200 hover:text-red-400 transition"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="md:hidden font-bold text-primary-900">DYC Admin</div>
          <div className="text-gray-500 font-medium hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="text-sm text-primary-600 hover:underline font-medium">
              View Live Site ↗
            </Link>
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
