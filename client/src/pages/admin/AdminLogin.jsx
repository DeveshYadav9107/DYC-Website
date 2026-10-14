import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiShield, FiAlertCircle } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email.trim() || !password) {
        setError('Please enter both your admin email and password.');
        setLoading(false);
        return;
      }

      await login({ email: email.trim(), password });
      navigate('/admin');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Authentication failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-between items-center p-6 sm:p-8 font-sans selection:bg-[#F2EEFF] selection:text-[#4F46E5]">
      {/* Top Brand Link */}
      <div className="w-full max-w-md flex justify-between items-center pt-2">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition"
        >
          <span>←</span> Back to Public Website
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#D1FAE5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse"></span>
          System Online
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8ECF3] shadow-[0_4px_24px_rgba(23,32,51,0.04)] overflow-hidden p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#EEF4FF] text-[#4F46E5] mb-4 shadow-sm">
              <FiShield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
              {siteConfig.company.shortName} Admin
            </h1>
            <p className="text-sm text-[#64748B] mt-1.5">
              Secure console for enterprise operations
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs leading-relaxed flex items-start gap-2.5">
              <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#172033] bg-[#FFFFFF] border border-[#E8ECF3] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition placeholder:text-[#94A3B8]"
                  placeholder="admin@dycinfo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033]">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#172033] bg-[#FFFFFF] border border-[#E8ECF3] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition placeholder:text-[#94A3B8]"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.99] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-[#E8ECF3] text-center">
            <p className="text-xs text-[#64748B]">
              Restricted area. Authorized personnel only.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-2">
        <p className="text-xs text-[#64748B]">
          © {new Date().getFullYear()} {siteConfig.company.name}. Enterprise Systems.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
