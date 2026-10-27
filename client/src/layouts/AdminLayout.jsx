import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import siteConfig from '../config/siteConfig';
import { useAuth } from '../context/AuthContext';
import { getInquiries, getInquiryStats } from '../services/api';
import {
  FiGrid,
  FiInbox,
  FiSliders,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX,
  FiChevronRight,
  FiBriefcase,
  FiUsers,
  FiLayers,
  FiCpu,
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Fetch count of new enquiries for sidebar badge & notification
  useEffect(() => {
    let isMounted = true;
    const fetchBadgeData = async () => {
      try {
        const stats = await getInquiryStats();
        if (isMounted && stats) {
          setNewInquiriesCount(stats.newEnquiries || 0);
        }
      } catch {
        try {
          const data = await getInquiries();
          const list = Array.isArray(data) ? data : (data?.inquiries || data?.data || []);
          const newCount = list.filter((item) => item.status === 'new' || item.leadStage === 'new').length;
          if (isMounted) {
            setNewInquiriesCount(newCount);
          }
        } catch {
          // Silently handle
        }
      }
    };

    fetchBadgeData();
    const interval = setInterval(fetchBadgeData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: FiGrid,
      exact: true,
    },
    {
      name: 'Enquiries',
      path: '/admin/inquiries',
      icon: FiInbox,
      badge: newInquiriesCount > 0 ? newInquiriesCount : null,
    },
    {
      name: 'Job Requisitions',
      path: '/admin/jobs',
      icon: FiBriefcase,
    },
    {
      name: 'Candidate Database',
      path: '/admin/candidates',
      icon: FiUsers,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: FiSliders,
    },
  ];

  const getPageInfo = () => {
    if (location.pathname === '/admin') {
      return { title: 'Dashboard', section: 'Overview' };
    }
    if (location.pathname.startsWith('/admin/inquiries')) {
      return { title: 'Enquiries & Tickets', section: 'Customer & Ticket Management' };
    }
    if (location.pathname.startsWith('/admin/jobs')) {
      return { title: 'Job Requisitions', section: 'Recruitment & Staffing' };
    }
    if (location.pathname.startsWith('/admin/candidates')) {
      return { title: 'Candidate Pipeline', section: 'Recruitment & Staffing' };
    }
    if (location.pathname.startsWith('/admin/settings')) {
      return { title: 'Settings', section: 'System Configuration' };
    }
    return { title: 'Administration', section: 'Console' };
  };

  const pageInfo = getPageInfo();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  const adminName = user?.name || 'Administrator';
  const adminRole = user?.role === 'admin' ? 'Super Administrator' : 'Operations Editor';

  return (
    <div className="flex h-screen bg-[#F8F5EE] overflow-hidden font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#252720]/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#E7E0D3] flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#E7E0D3]">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#174B39] text-white flex items-center justify-center font-bold tracking-wider text-sm shadow-sm group-hover:bg-[#103728] transition">
                D
              </div>
              <div>
                <span className="font-serif font-bold text-base tracking-tight text-[#252720] leading-none block">
                  {siteConfig.company.shortName}
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#B88A3B] block mt-0.5">
                  Enterprise Admin
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-[#66665D] hover:text-[#252720] hover:bg-[#FDFBF7] md:hidden transition cursor-pointer"
              aria-label="Close menu"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-widest uppercase text-[#8A897C]">
              Management
            </div>

            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition group ${
                    isActive
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold'
                      : 'text-[#66665D] hover:bg-[#FDFBF7] hover:text-[#252720]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive
                          ? 'text-[#174B39]'
                          : 'text-[#8A897C] group-hover:text-[#252720]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FDFBF7] text-[#B88A3B] border border-[#B88A3B]/30">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            <div className="pt-5 px-3 pb-1.5 text-[11px] font-bold tracking-widest uppercase text-[#8A897C]">
              Quick Links
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#66665D] hover:bg-[#FDFBF7] hover:text-[#252720] transition group"
            >
              <div className="flex items-center gap-3">
                <FiExternalLink className="w-4 h-4 text-[#8A897C] group-hover:text-[#252720] transition" />
                <span>Live Website</span>
              </div>
              <span className="text-xs text-[#8A897C]">↗</span>
            </a>
          </nav>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="p-3.5 border-t border-[#E7E0D3] space-y-2">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#E7E0D3]">
            <div className="w-9 h-9 rounded-lg bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 flex items-center justify-center text-xs font-bold shrink-0">
              {initials || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#252720] truncate leading-tight">
                {adminName}
              </p>
              <p className="text-[10px] font-medium text-[#66665D] truncate mt-0.5">
                {adminRole}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FEE2E2] transition cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E7E0D3] flex items-center justify-between px-4 sm:px-6 md:px-8 z-10 shrink-0">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-xl text-[#66665D] hover:text-[#252720] hover:bg-[#FDFBF7] md:hidden transition cursor-pointer"
              aria-label="Open sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-[#66665D] font-medium hidden sm:inline">
                {pageInfo.section}
              </span>
              <FiChevronRight className="w-3.5 h-3.5 text-[#8A897C] hidden sm:inline" />
              <h1 className="text-[#252720] font-bold text-sm sm:text-base font-serif">
                {pageInfo.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Site Shortcut */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E7E0D3] text-xs font-semibold text-[#252720] hover:text-[#174B39] hover:bg-[#FDFBF7] transition"
            >
              <span>Live Site</span>
              <FiExternalLink className="w-3 h-3 text-[#B88A3B]" />
            </a>

            {/* Admin Avatar Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E7E0D3]">
              <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center font-bold text-xs border border-[#174B39]/20 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={adminName} className="w-full h-full object-cover" />
                ) : (
                  initials || 'A'
                )}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-semibold text-[#252720] block leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-[#66665D] block">
                  {adminRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F8F5EE]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
