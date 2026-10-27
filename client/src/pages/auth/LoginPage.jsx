import { useState, useId } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailId = useId();
  const passwordId = useId();

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/';
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await login({ email: cleanEmail, password });
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout badgeText="Secure Enterprise Login">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B88A3B] block mb-1.5">
            Enterprise Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[#66665D] mt-1.5 leading-relaxed font-sans">
            Enter your email address and password to sign in to your DY&C account.
          </p>
        </div>

        {/* Password Reset Success Alert */}
        {resetSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs leading-relaxed flex items-start gap-2.5">
            <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#174B39]" />
            <span>Your password was reset successfully. Please sign in with your new password.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs leading-relaxed flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="block text-xs font-bold text-[#252720] mb-1.5 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-[#252720] bg-white border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition placeholder:text-[#8A897C]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={passwordId}
                className="block text-xs font-bold text-[#252720] uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#174B39] hover:text-[#103728] transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-10 py-2.5 text-sm text-[#252720] bg-white border border-[#E7E0D3] rounded-xl focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition placeholder:text-[#8A897C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A897C] hover:text-[#252720] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 rounded-full shadow-[0_4px_16px_rgba(23,75,57,0.25)] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight className="w-4 h-4 text-[#D7B875]" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        <div className="mt-8 text-center pt-6 border-t border-[#E7E0D3]">
          <p className="text-xs text-[#66665D]">
            Don't have an account yet?{' '}
            <Link
              to={returnTo && returnTo !== '/' ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : '/signup'}
              className="font-bold text-[#174B39] hover:text-[#103728] transition"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
