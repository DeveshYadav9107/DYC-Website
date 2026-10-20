import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const AuthLayout = ({
  children,
  badgeText = 'Enterprise Consulting & Staffing',
}) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated and not loading, redirect to returnTo or home
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo') || '/';
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.search]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans selection:bg-[#EEF2FF] selection:text-[#4F46E5]">
      {/* Top Mobile Bar */}
      <header className="lg:hidden w-full bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#11183F] flex items-center justify-center text-white font-black text-sm">
            <span className="text-[#10B981]">D</span>
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#11183F]">
            DY&C
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#11183F] transition"
        >
          <FiArrowLeft className="text-xs" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl bg-white rounded-3xl border border-[#E2E8F0] shadow-[0_20px_50px_rgba(17,24,63,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ================= LEFT VISUAL PANEL ================= */}
          <div className="lg:col-span-6 relative bg-[#F8FAFC] flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
            {/* Visual Image */}
            <div className="absolute inset-0">
              <img
                src="/images/auth-banner.png"
                alt="DY&C Enterprise Technology and Consulting"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>


          {/* ================= RIGHT FORM PANEL ================= */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white">
            {/* Top Nav inside Form Panel */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#11183F] transition group"
              >
                <FiArrowLeft className="text-xs transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Public Website</span>
              </Link>
              <div className="text-[11px] text-[#94A3B8] font-medium">
                DY&C Secure Portal
              </div>
            </div>

            {/* Form Slot */}
            <div className="my-auto py-2">
              {children}
            </div>

            {/* Bottom Notice */}
            <div className="pt-6 mt-4 border-t border-[#F1F5F9] text-center">
              <p className="text-[11px] text-[#94A3B8]">
                Protected by enterprise encryption & real email verification.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-[#94A3B8]">
        © {new Date().getFullYear()} Dinesh Yadav & Company (DY&C). All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
