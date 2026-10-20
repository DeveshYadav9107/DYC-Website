import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowUpRight,
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiX,
  FiUsers,
  FiCpu,
  FiLayers,
  FiDatabase,
  FiUser,
  FiLogOut,
  FiFileText,
  FiShield,
} from 'react-icons/fi';
import siteConfig from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';


const servicesList = [
  {
    name: 'Manpower Supply',
    path: '/services/staffing',
    desc: 'Contract & permanent talent placement',
    icon: FiUsers,
  },
  {
    name: 'SAP Resources',
    path: '/services/sap-resources',
    desc: 'Functional & technical specialists',
    icon: FiCpu,
  },
  {
    name: 'SAP Support',
    path: '/services/sap-support',
    desc: 'AMS, maintenance & optimizations',
    icon: FiLayers,
  },
  {
    name: 'ERP Solutions',
    path: '/services/erp-solutions',
    desc: 'Custom enterprise software systems',
    icon: FiDatabase,
  },
];

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const servicesDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : (user?.name?.slice(0, 2) || 'DY').toUpperCase();

  // Detect scroll to adjust header height & shadow smoothly
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Handle outside click & escape key for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(e.target)
      ) {
        setServicesOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // Auto-close mobile drawer when viewport expands to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced dropdown hover handlers to prevent flicker on rapid cursor transitions
  const handleDropdownEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleDropdownLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 150);
  };

  const isServicesActive = location.pathname.startsWith('/services');

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E8ECF3] shadow-[0_4px_20px_-2px_rgba(23,37,84,0.06)] py-2 md:py-2.5'
          : 'bg-white/90 backdrop-blur-md border-b border-[#E8ECF3]/70 py-3.5 md:py-4 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* ================= 1. LEFT SECTION: BRAND ================= */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-xl"
            aria-label={`${siteConfig.company.name} Home`}
          >
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg p-0.5 bg-white border border-[#E8ECF3] shadow-xs flex items-center justify-center transition-all duration-200 group-hover:border-[#4F46E5]/40 group-hover:shadow-sm">
              <img
                src="/favicon.jpg"
                alt="DY&C Logo"
                className="h-full w-full object-contain rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold text-[#172554] tracking-tight leading-none group-hover:text-[#4F46E5] transition-colors">
                {siteConfig.company.name}
              </span>
              <span className="text-[10px] font-semibold text-[#475569] tracking-wider uppercase mt-1 hidden sm:inline-block">
                Business Solution
              </span>
            </div>
          </Link>
        </div>

        {/* ================= 2. CENTER SECTION: FLOATING PILL NAVIGATION ================= */}
        <nav
          className="hidden md:flex items-center bg-white border border-[#E8ECF3] rounded-full p-1.5 shadow-[0_2px_12px_rgba(23,37,84,0.05)] transition-all duration-300"
          aria-label="Main Navigation"
        >
          {/* Home */}
          <Link
            to="/"
            className={`px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold shadow-xs'
                : 'text-[#172554] hover:text-[#4F46E5] hover:bg-[#F8FAFC]'
            }`}
          >
            Home
          </Link>

          {/* About */}
          <Link
            to="/about"
            className={`px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/about'
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold shadow-xs'
                : 'text-[#172554] hover:text-[#4F46E5] hover:bg-[#F8FAFC]'
            }`}
          >
            About
          </Link>

          {/* Services Dropdown */}
          <div
            ref={servicesDropdownRef}
            className="relative"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              type="button"
              onClick={() => setServicesOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              className={`flex items-center gap-1 px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isServicesActive || servicesOpen
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold shadow-xs'
                  : 'text-[#172554] hover:text-[#4F46E5] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Services</span>
              <FiChevronDown
                className={`text-xs transition-transform duration-200 ${
                  servicesOpen ? 'rotate-180 text-[#4F46E5]' : 'text-[#475569]'
                }`}
              />
            </button>

            {/* Dropdown Menu Container */}
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 min-w-[280px] lg:min-w-[310px]"
                >
                  <div
                    role="menu"
                    aria-label="Services Submenu"
                    className="bg-white rounded-2xl border border-[#E8ECF3] shadow-[0_12px_36px_rgba(23,37,84,0.12),0_4px_12px_rgba(0,0,0,0.04)] p-2"
                  >
                    {servicesList.map((service) => {
                      const isActive = location.pathname === service.path;
                      const IconComponent = service.icon;
                      return (
                        <Link
                          key={service.path}
                          to={service.path}
                          onClick={() => setServicesOpen(false)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 group/item ${
                            isActive
                              ? 'bg-[#EEF2FF] text-[#4F46E5]'
                              : 'hover:bg-[#F8FAFC] text-[#172554]'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg mt-0.5 transition-colors ${
                              isActive
                                ? 'bg-white text-[#4F46E5] shadow-xs'
                                : 'bg-[#EEF2FF]/70 text-[#4F46E5] group-hover/item:bg-[#4F46E5] group-hover/item:text-white'
                            }`}
                          >
                            <IconComponent className="text-base" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold transition-colors ${
                                  isActive
                                    ? 'text-[#4F46E5]'
                                    : 'text-[#172554] group-hover/item:text-[#4F46E5]'
                                }`}
                              >
                                {service.name}
                              </span>
                              <FiChevronRight
                                className={`text-xs opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 ${
                                  isActive
                                    ? 'opacity-100 translate-x-0 text-[#4F46E5]'
                                    : 'text-slate-400'
                                }`}
                              />
                            </div>
                            <p className="text-xs text-[#475569] mt-0.5 line-clamp-1">
                              {service.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SAP */}
          <Link
            to="/sap-capabilities"
            className={`px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/sap-capabilities'
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold shadow-xs'
                : 'text-[#172554] hover:text-[#4F46E5] hover:bg-[#F8FAFC]'
            }`}
          >
            SAP
          </Link>

          {/* Industries */}
          <Link
            to="/industries"
            className={`px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/industries'
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold shadow-xs'
                : 'text-[#172554] hover:text-[#4F46E5] hover:bg-[#F8FAFC]'
            }`}
          >
            Industries
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className={`px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/contact'
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold shadow-xs'
                : 'text-[#172554] hover:text-[#4F46E5] hover:bg-[#F8FAFC]'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* ================= 3. RIGHT SECTION: AUTH ACTIONS / USER MENU ================= */}
        <div className="hidden md:flex items-center shrink-0">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 lg:gap-2.5">
              <Link
                to="/login"
                id="navbar-login-btn"
                className="px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold text-[#172554] hover:text-[#4F46E5] hover:bg-[#EEF2FF]/60 border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                id="navbar-signup-btn"
                className="group relative inline-flex items-center gap-1.5 bg-[#172554] hover:bg-[#1E293B] text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold shadow-[0_2px_8px_rgba(23,37,84,0.15)] hover:shadow-[0_6px_20px_rgba(23,37,84,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                id="navbar-user-menu-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] shadow-xs transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#172554] to-[#4F46E5] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {userInitials}
                </div>
                <span className="text-xs lg:text-sm font-semibold text-[#172554] max-w-[130px] truncate">
                  {user?.firstName || user?.name?.split(' ')[0] || 'My Account'}
                </span>
                <FiChevronDown
                  className={`text-xs text-[#64748B] transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180 text-[#4F46E5]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-full pt-2 z-50 min-w-[230px]"
                  >
                    <div className="bg-white rounded-2xl border border-[#E8ECF3] shadow-[0_12px_36px_rgba(23,37,84,0.12),0_4px_12px_rgba(0,0,0,0.04)] p-2">
                      <div className="px-3 py-2 border-b border-[#F1F5F9] mb-1">
                        <p className="text-xs font-bold text-[#172554] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#4F46E5] transition"
                      >
                        <FiUser className="text-sm text-[#64748B]" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/my-enquiries"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#4F46E5] transition"
                      >
                        <FiFileText className="text-sm text-[#64748B]" />
                        <span>My Enquiries</span>
                      </Link>

                      {(user?.role === 'admin' || user?.role === 'editor') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF]/60 hover:bg-[#EEF2FF] transition"
                        >
                          <FiShield className="text-sm text-[#4F46E5]" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-[#F1F5F9]"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer text-left"
                      >
                        <FiLogOut className="text-sm text-[#DC2626]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ================= 4. MOBILE HAMBURGER BUTTON & COMPACT ACTION ================= */}
        <div className="flex md:hidden items-center gap-2">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-[#172554] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition"
            >
              Login
            </Link>
          ) : (
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#172554] to-[#4F46E5] text-white flex items-center justify-center text-xs font-bold shadow-xs"
              title="My Profile"
            >
              {userInitials}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="p-2 rounded-xl text-[#172554] hover:bg-[#EEF2FF] hover:text-[#4F46E5] border border-[#E8ECF3] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] cursor-pointer"
          >
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

      </div>


      {/* ================= 5. MOBILE ACCORDION DRAWER & BACKDROP ================= */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-[56px] sm:top-[64px] bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="relative z-50 md:hidden overflow-hidden bg-white border-t border-[#E8ECF3] shadow-2xl max-h-[calc(100vh-70px)] overflow-y-auto"
            >
              <div className="px-5 pt-3 pb-6 flex flex-col gap-1">
                {/* Home */}
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#172554] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Home
                </Link>

                {/* About */}
                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/about'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#172554] hover:bg-[#F8FAFC]'
                  }`}
                >
                  About
                </Link>

                {/* Services Accordion */}
                <div className="rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileServicesOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isServicesActive || mobileServicesOpen
                        ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                        : 'text-[#172554] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>Services</span>
                    <FiChevronDown
                      className={`text-sm transition-transform duration-200 ${
                        mobileServicesOpen ? 'rotate-180 text-[#4F46E5]' : 'text-[#475569]'
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 pr-2 py-1 flex flex-col gap-1"
                      >
                        {servicesList.map((service) => {
                          const isActive = location.pathname === service.path;
                          const IconComp = service.icon;
                          return (
                            <Link
                              key={service.path}
                              to={service.path}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                isActive
                                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#172554]'
                              }`}
                            >
                              <IconComp className="text-sm text-[#4F46E5]" />
                              <span>{service.name}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SAP */}
                <Link
                  to="/sap-capabilities"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/sap-capabilities'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#172554] hover:bg-[#F8FAFC]'
                  }`}
                >
                  SAP
                </Link>

                {/* Industries */}
                <Link
                  to="/industries"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/industries'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#172554] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Industries
                </Link>

                {/* Contact */}
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/contact'
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#172554] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Contact
                </Link>

                {/* Mobile Auth Actions */}
                <div className="pt-3 mt-2 border-t border-slate-100">
                  {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center py-2.5 rounded-full text-xs font-semibold text-[#172554] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center py-2.5 rounded-full text-xs font-semibold text-white bg-[#172554] hover:bg-[#1E293B] shadow-sm transition"
                      >
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#172554] to-[#4F46E5] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {userInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#172554] truncate">{user?.name}</p>
                          <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
                        >
                          <FiUser className="text-xs text-[#64748B]" />
                          Profile
                        </Link>
                        <Link
                          to="/my-enquiries"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
                        >
                          <FiFileText className="text-xs text-[#64748B]" />
                          My Enquiries
                        </Link>
                      </div>
                      {(user?.role === 'admin' || user?.role === 'editor') && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] border border-[#C7D2FE] transition"
                        >
                          <FiShield className="text-xs" />
                          Admin Console
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] hover:bg-[#FEE2E2] transition cursor-pointer"
                      >
                        <FiLogOut className="text-xs" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
