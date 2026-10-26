import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  FiBriefcase,
  FiLifeBuoy,
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
          ? 'bg-[#F8F5EE]/95 backdrop-blur-md border-b border-[#E7E0D3] shadow-[0_4px_24px_rgba(23,75,57,0.06)] py-2.5 md:py-3'
          : 'bg-[#F8F5EE]/90 backdrop-blur-md border-b border-[#E7E0D3]/80 py-3.5 md:py-4 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* ================= 1. LEFT SECTION: BRAND ================= */}
        <div className="flex items-center shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39] rounded-xl"
            aria-label={`${siteConfig.company.name} Home`}
          >
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg p-0.5 bg-white border border-[#E7E0D3] shadow-xs flex items-center justify-center transition-all duration-200 group-hover:border-[#174B39]/50 group-hover:shadow-sm">
              <img
                src="/favicon.jpg"
                alt="DY&C Logo"
                className="h-full w-full object-contain rounded-md"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold font-serif text-[#252720] tracking-tight leading-none group-hover:text-[#174B39] transition-colors">
                {siteConfig.company.name}
              </span>
              <span className="text-[10px] font-semibold text-[#66665D] tracking-widest uppercase mt-1 hidden sm:inline-block">
                Business Solution
              </span>
            </div>
          </Link>
        </div>

        {/* ================= 2. CENTER SECTION: FLOATING PILL NAVIGATION ================= */}
        <nav
          className="hidden md:flex items-center bg-[#FDFBF7] border border-[#E7E0D3] rounded-full p-1.5 shadow-[0_2px_12px_rgba(23,75,57,0.04)] transition-all duration-300"
          aria-label="Main Navigation"
        >
          {/* Home */}
          <Link
            to="/"
            className={`relative px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
            }`}
          >
            Home
          </Link>

          {/* About */}
          <Link
            to="/about"
            className={`relative px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/about'
                ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
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
              className={`relative flex items-center gap-1 px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isServicesActive || servicesOpen
                  ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                  : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
              }`}
            >
              <span>Services</span>
              <FiChevronDown
                className={`text-xs transition-transform duration-200 ${
                  servicesOpen ? 'rotate-180 text-[#174B39]' : 'text-[#66665D]'
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
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 min-w-[290px] lg:min-w-[320px]"
                >
                  <div
                    role="menu"
                    aria-label="Services Submenu"
                    className="bg-[#FDFBF7] rounded-2xl border border-[#E7E0D3] shadow-[0_16px_40px_rgba(23,75,57,0.12),0_4px_12px_rgba(0,0,0,0.04)] p-2"
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
                              ? 'bg-[#EAF0E8] text-[#174B39]'
                              : 'hover:bg-[#EAF0E8]/60 text-[#252720]'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg mt-0.5 transition-colors ${
                              isActive
                                ? 'bg-white text-[#174B39] shadow-xs'
                                : 'bg-[#EAF0E8] text-[#174B39] group-hover/item:bg-[#174B39] group-hover/item:text-white'
                            }`}
                          >
                            <IconComponent className="text-base" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold transition-colors ${
                                  isActive
                                    ? 'text-[#174B39]'
                                    : 'text-[#252720] group-hover/item:text-[#174B39]'
                                }`}
                              >
                                {service.name}
                              </span>
                              <FiChevronRight
                                className={`text-xs opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 ${
                                  isActive
                                    ? 'opacity-100 translate-x-0 text-[#B88A3B]'
                                    : 'text-[#B88A3B]'
                                }`}
                              />
                            </div>
                            <p className="text-xs text-[#66665D] mt-0.5 line-clamp-1">
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
            className={`relative px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/sap-capabilities'
                ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
            }`}
          >
            SAP
          </Link>

          {/* Industries */}
          <Link
            to="/industries"
            className={`relative px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/industries'
                ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
            }`}
          >
            Industries
          </Link>

          {/* Careers */}
          <Link
            to="/careers"
            className={`relative px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith('/careers')
                ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
            }`}
          >
            Careers
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className={`relative px-3 md:px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
              location.pathname === '/contact'
                ? 'bg-[#EAF0E8] text-[#174B39] font-bold shadow-xs after:content-[""] after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:bg-[#B88A3B] after:rounded-full'
                : 'text-[#252720] hover:text-[#174B39] hover:bg-[#EAF0E8]/50'
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
                className="px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold text-[#252720] hover:text-[#174B39] hover:bg-white bg-[#FDFBF7] border border-[#E7E0D3] hover:border-[#174B39] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                id="navbar-signup-btn"
                className="group relative inline-flex items-center gap-1.5 bg-[#174B39] hover:bg-[#103728] text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold shadow-[0_2px_10px_rgba(23,75,57,0.2)] hover:shadow-[0_4px_16px_rgba(23,75,57,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-[#103728] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39]"
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
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E7E0D3] hover:border-[#174B39] bg-[#FDFBF7] hover:bg-white shadow-xs transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#174B39] to-[#B88A3B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {userInitials}
                </div>
                <span className="text-xs lg:text-sm font-semibold text-[#252720] max-w-[130px] truncate">
                  {user?.firstName || user?.name?.split(' ')[0] || 'My Account'}
                </span>
                <FiChevronDown
                  className={`text-xs text-[#66665D] transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180 text-[#174B39]' : ''
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
                    <div className="bg-[#FDFBF7] rounded-2xl border border-[#E7E0D3] shadow-[0_16px_40px_rgba(23,75,57,0.12),0_4px_12px_rgba(0,0,0,0.04)] p-2">
                      <div className="px-3 py-2 border-b border-[#E7E0D3]/60 mb-1">
                        <p className="text-xs font-bold text-[#252720] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#66665D] truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#252720] hover:bg-[#EAF0E8] hover:text-[#174B39] transition"
                      >
                        <FiUser className="text-sm text-[#66665D]" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/my-enquiries"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#252720] hover:bg-[#EAF0E8] hover:text-[#174B39] transition"
                      >
                        <FiFileText className="text-sm text-[#66665D]" />
                        <span>My Enquiries</span>
                      </Link>

                      <Link
                        to="/candidate/portal"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#252720] hover:bg-[#EAF0E8] hover:text-[#174B39] transition"
                      >
                        <FiBriefcase className="text-sm text-[#66665D]" />
                        <span>Candidate Portal</span>
                      </Link>

                      <Link
                        to="/support/tickets"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#252720] hover:bg-[#EAF0E8] hover:text-[#174B39] transition"
                      >
                        <FiLifeBuoy className="text-sm text-[#174B39]" />
                        <span>SAP Support Desk</span>
                      </Link>

                      {(user?.role === 'admin' || user?.role === 'editor') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#174B39] bg-[#EAF0E8] hover:bg-[#EAF0E8]/80 transition"
                        >
                          <FiShield className="text-sm text-[#174B39]" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-[#E7E0D3]/60"></div>

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
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-[#252720] bg-white border border-[#E7E0D3] hover:border-[#174B39] transition"
            >
              Login
            </Link>
          ) : (
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#174B39] to-[#B88A3B] text-white flex items-center justify-center text-xs font-bold shadow-xs"
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
            className="p-2 rounded-xl text-[#252720] hover:bg-[#EAF0E8] hover:text-[#174B39] border border-[#E7E0D3] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39] cursor-pointer"
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
              className="fixed inset-0 top-[56px] sm:top-[64px] bg-[#252720]/40 backdrop-blur-xs z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="relative z-50 md:hidden overflow-hidden bg-[#FDFBF7] border-t border-[#E7E0D3] shadow-2xl max-h-[calc(100vh-70px)] overflow-y-auto"
            >
              <div className="px-5 pt-3 pb-6 flex flex-col gap-1">
                {/* Home */}
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                      : 'text-[#252720] hover:bg-[#EAF0E8]/50'
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
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                      : 'text-[#252720] hover:bg-[#EAF0E8]/50'
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
                        ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                        : 'text-[#252720] hover:bg-[#EAF0E8]/50'
                    }`}
                  >
                    <span>Services</span>
                    <FiChevronDown
                      className={`text-sm transition-transform duration-200 ${
                        mobileServicesOpen ? 'rotate-180 text-[#174B39]' : 'text-[#66665D]'
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
                                  ? 'bg-[#EAF0E8] text-[#174B39] font-bold'
                                  : 'text-[#66665D] hover:bg-[#EAF0E8]/50 hover:text-[#252720]'
                              }`}
                            >
                              <IconComp className="text-sm text-[#174B39]" />
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
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                      : 'text-[#252720] hover:bg-[#EAF0E8]/50'
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
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                      : 'text-[#252720] hover:bg-[#EAF0E8]/50'
                  }`}
                >
                  Industries
                </Link>

                {/* Careers */}
                <Link
                  to="/careers"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/careers')
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                      : 'text-[#252720] hover:bg-[#EAF0E8]/50'
                  }`}
                >
                  Careers & Jobs
                </Link>

                {/* Contact */}
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === '/contact'
                      ? 'bg-[#EAF0E8] text-[#174B39] font-bold border-l-2 border-[#B88A3B]'
                      : 'text-[#252720] hover:bg-[#EAF0E8]/50'
                  }`}
                >
                  Contact
                </Link>

                {/* Mobile Auth Actions */}
                <div className="pt-3 mt-2 border-t border-[#E7E0D3]">
                  {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center py-2.5 rounded-full text-xs font-semibold text-[#252720] bg-white border border-[#E7E0D3] hover:border-[#174B39] transition"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center py-2.5 rounded-full text-xs font-semibold text-white bg-[#174B39] hover:bg-[#103728] shadow-sm transition border border-[#103728]"
                      >
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-[#E7E0D3]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#174B39] to-[#B88A3B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {userInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#252720] truncate">{user?.name}</p>
                          <p className="text-[11px] text-[#66665D] truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-[#252720] bg-white border border-[#E7E0D3] hover:bg-[#EAF0E8] transition"
                        >
                          <FiUser className="text-xs text-[#66665D]" />
                          Profile
                        </Link>
                        <Link
                          to="/my-enquiries"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-[#252720] bg-white border border-[#E7E0D3] hover:bg-[#EAF0E8] transition"
                        >
                          <FiFileText className="text-xs text-[#66665D]" />
                          My Enquiries
                        </Link>
                        <Link
                          to="/candidate/portal"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-[#252720] bg-white border border-[#E7E0D3] hover:bg-[#EAF0E8] transition"
                        >
                          <FiBriefcase className="text-xs text-[#66665D]" />
                          Candidate Portal
                        </Link>
                        <Link
                          to="/support/tickets"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-[#174B39] bg-[#EAF0E8] border border-[#174B39]/20 hover:bg-[#EAF0E8]/80 transition"
                        >
                          <FiLifeBuoy className="text-xs text-[#174B39]" />
                          SAP Support Desk
                        </Link>
                      </div>
                      {(user?.role === 'admin' || user?.role === 'editor') && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-[#174B39] bg-[#EAF0E8] border border-[#174B39]/20 transition"
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
