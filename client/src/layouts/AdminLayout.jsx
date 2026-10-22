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
  FiBell,
  FiSearch,
  FiChevronRight,
  FiCheckCircle,
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [followUpsDueCount, setFollowUpsDueCount] = useState(0);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Fetch count of new enquiries & follow-ups due for sidebar badge & notification
  useEffect(() => {
    let isMounted = true;
    const fetchBadgeData = async () => {
      try {
        const stats = await getInquiryStats();
        if (isMounted && stats) {
          setNewInquiriesCount(stats.newEnquiries || 0);
          setFollowUpsDueCount(stats.followUpsDue || 0);
        }
      } catch (err) {
        // Fallback to getInquiries if stats fails
        try {
          const data = await getInquiries();
          const list = Array.isArray(data) ? data : (data?.inquiries || data?.data || []);
          const newCount = list.filter((item) => item.status === 'new' || item.leadStage === 'new').length;
          if (isMounted) {
            setNewInquiriesCount(newCount);
          }
        } catch {
          // Silently handle if unauthenticated or offline
        }
      }
    };

    fetchBadgeData();
    const interval = setInterval(fetchBadgeData, 60000); // 1 min sync
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
      name: 'Settings',
      path: '/admin/settings',
      icon: FiSliders,
    },
  ];

  // Helper for page title / breadcrumbs
  const getPageInfo = () => {
    if (location.pathname === '/admin') {
      return { title: 'Dashboard', section: 'Overview' };
    }
    if (location.pathname.startsWith('/admin/inquiries')) {
      return { title: 'Enquiries', section: 'Customer Management' };
    }
    if (location.pathname.startsWith('/admin/settings')) {
      return { title: 'Settings', section: 'System Configuration' };
    }
    return { title: 'Admin Console', section: 'DYC Portal' };
  };

  const pageInfo = getPageInfo();

  // User initials
  const adminName = user?.name || 'DYC Admin';
  const adminRole = user?.role ? user.role.toUpperCase() : 'ADMINISTRATOR';
  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-[#F6F8FC] text-[#172033] font-sans overflow-hidden selection:bg-[#F2EEFF] selection:text-[#4F46E5]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#172033]/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#E8ECF3] flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#E8ECF3]">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-sm group-hover:bg-[#4338CA] transition">
                D
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-[#172033] leading-none block">
                  {siteConfig.company.shortName}
                </span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-[#64748B] block mt-0.5">
                  Enterprise Portal
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F6F8FC] md:hidden transition"
              aria-label="Close menu"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#64748B]">
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
                      ? 'bg-[#F2EEFF] text-[#4F46E5] font-semibold'
                      : 'text-[#64748B] hover:bg-[#F6F8FC] hover:text-[#172033]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive
                          ? 'text-[#4F46E5]'
                          : 'text-[#64748B] group-hover:text-[#172033]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FEF3C7]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            <div className="pt-5 px-3 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#64748B]">
              Quick Links
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F6F8FC] hover:text-[#172033] transition group"
            >
              <div className="flex items-center gap-3">
                <FiExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#172033] transition" />
                <span>Live Website</span>
              </div>
              <span className="text-xs text-[#94A3B8]">↗</span>
            </a>
          </nav>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="p-3.5 border-t border-[#E8ECF3] space-y-2">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F6F8FC] border border-[#E8ECF3]">
            <div className="w-9 h-9 rounded-lg bg-[#EEF4FF] text-[#4F46E5] border border-[#E0E7FF] flex items-center justify-center text-xs font-bold shrink-0">
              {initials || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#172033] truncate leading-tight">
                {adminName}
              </p>
              <p className="text-[10px] font-medium text-[#64748B] truncate mt-0.5">
                {adminRole}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FEE2E2] transition cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E8ECF3] flex items-center justify-between px-4 sm:px-6 md:px-8 z-10 shrink-0">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F6F8FC] md:hidden transition"
              aria-label="Open sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-[#64748B] font-medium hidden sm:inline">
                {pageInfo.section}
              </span>
              <FiChevronRight className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:inline" />
              <h1 className="text-[#172033] font-semibold text-sm sm:text-base">
                {pageInfo.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions, System Indicator & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#D1FAE5] text-[#15803D] text-xs font-medium">
              <FiCheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
              <span>API Connected</span>
            </div>

            {/* Inquiries Notification Icon */}
            <Link
              to="/admin/inquiries"
              className="relative p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F6F8FC] transition"
              title={`${newInquiriesCount} new enquiries`}
            >
              <FiBell className="w-4 h-4" />
              {newInquiriesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F46E5] ring-2 ring-[#FFFFFF]"></span>
              )}
            </Link>

            {/* Live Site Shortcut */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8ECF3] text-xs font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F6F8FC] transition"
            >
              <span>Live Site</span>
              <FiExternalLink className="w-3 h-3 text-[#94A3B8]" />
            </a>

            {/* Admin Avatar Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E8ECF3]">
              <div className="w-8 h-8 rounded-lg bg-[#F2EEFF] text-[#4F46E5] flex items-center justify-center font-bold text-xs border border-[#E0E7FF]">
                {initials || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-semibold text-[#172033] block leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  {adminRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
