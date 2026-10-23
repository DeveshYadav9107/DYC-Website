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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#11183F] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Enter your email address and password to sign in to your account.
          </p>
        </div>

        {/* Password Reset Success Alert */}
        {resetSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#15803D] text-xs leading-relaxed flex items-start gap-2.5">
            <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D]" />
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
              className="block text-xs font-bold text-[#1E293B] mb-1.5 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
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
                className="w-full pl-10 pr-4 py-2.5 text-sm text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={passwordId}
                className="block text-xs font-bold text-[#1E293B] uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
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
                className="w-full pl-10 pr-10 py-2.5 text-sm text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition placeholder:text-[#94A3B8]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#11183F] cursor-pointer"
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
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#172554] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        <div className="mt-8 text-center pt-6 border-t border-[#F1F5F9]">
          <p className="text-xs text-[#64748B]">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-bold text-[#4F46E5] hover:text-[#4338CA] transition"
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
