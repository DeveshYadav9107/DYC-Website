import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiArrowLeft } from 'react-icons/fi';

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
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col justify-between font-sans selection:bg-[#EAF0E8] selection:text-[#174B39]">
      {/* Top Mobile Bar */}
      <header className="lg:hidden w-full bg-[#FDFBF7] border-b border-[#E7E0D3] px-4 py-3 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#174B39] flex items-center justify-center text-white font-black text-sm">
            <span className="text-[#D7B875]">D</span>
          </div>
          <span className="text-base font-serif font-bold tracking-tight text-[#252720]">
            DY&C
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66665D] hover:text-[#174B39] transition"
        >
          <FiArrowLeft className="text-xs" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl bg-white rounded-3xl border border-[#E7E0D3] shadow-[0_20px_50px_rgba(23,75,57,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">

          {/* ================= LEFT VISUAL PANEL ================= */}
          <div className="lg:col-span-6 relative bg-[#FAF8F2] flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-[#E7E0D3]">
            {/* Visual Image */}
            <div className="absolute inset-0">
              <img
                src="/images/auth-banner.png"
                alt="DY&C Enterprise Technology and Consulting"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>

          {/* ================= RIGHT FORM PANEL ================= */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-[#FDFBF7]">
            {/* Top Nav inside Form Panel */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66665D] hover:text-[#174B39] transition group"
              >
                <FiArrowLeft className="text-xs transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Home Page</span>
              </Link>
              <div className="text-[11px] text-[#B88A3B] font-bold uppercase tracking-wider">
                DY&C Enterprise Portal
              </div>
            </div>

            {/* Form Slot */}
            <div className="my-auto py-2">
              {children}
            </div>

            {/* Bottom Notice */}
            <div className="pt-6 mt-4 border-t border-[#E7E0D3] text-center">
              <p className="text-[11px] text-[#66665D]">
                Protected by enterprise encryption & secure verification.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-[#66665D]">
        © {new Date().getFullYear()} Dinesh Yadav & Company (DY&C). All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
