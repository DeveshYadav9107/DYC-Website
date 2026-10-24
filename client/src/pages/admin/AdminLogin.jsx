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
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col justify-between items-center p-6 sm:p-8 font-sans selection:bg-[#EAF0E8] selection:text-[#174B39]">
      {/* Top Brand Link */}
      <div className="w-full max-w-md flex justify-between items-center pt-2">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#66665D] hover:text-[#174B39] transition"
        >
          <span>←</span> Back to Public Website
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#174B39] animate-pulse"></span>
          System Online
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E0D3] shadow-[0_8px_30px_rgba(37,39,32,0.06)] overflow-hidden p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EAF0E8] text-[#174B39] mb-4 shadow-sm border border-[#174B39]/20">
              <FiShield className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B88A3B] block mb-1">
              Authorized Personnel
            </span>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#252720]">
              {siteConfig.company.shortName} Admin Console
            </h1>
            <p className="text-sm text-[#66665D] mt-1.5 font-sans">
              Secure operations, proposal desk & inquiry management
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#252720] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#252720] bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition placeholder:text-[#8A897C]"
                  placeholder="admin@dycinfo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#252720] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#252720] bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition placeholder:text-[#8A897C]"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 rounded-full shadow-[0_4px_16px_rgba(23,75,57,0.25)] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <FiArrowRight className="w-4 h-4 text-[#D7B875]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-[#8A897C] text-center pb-2">
        DY&C Secure Enterprise Systems • Internal Use Only
      </div>
    </div>
  );
};

export default AdminLogin;
