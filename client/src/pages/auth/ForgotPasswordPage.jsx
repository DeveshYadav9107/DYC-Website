import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  FiKey,
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
} from 'react-icons/fi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailId = useId();
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await forgotPassword({ email: cleanEmail });
      const masked = res?.data?.maskedEmail || res?.maskedEmail || cleanEmail;

      navigate(
        `/reset-password?email=${encodeURIComponent(cleanEmail)}&masked=${encodeURIComponent(
          masked
        )}`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to process request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout badgeText="Account Recovery">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4 shadow-sm border border-[#E0E7FF]">
            <FiKey className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#11183F] tracking-tight">
            Forgot password?
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Enter your registered email address and we'll send a 6-digit verification code to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs leading-relaxed flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="block text-xs font-bold text-[#1E293B] mb-1.5 uppercase tracking-wider"
            >
              Registered Email
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

          <button
            type="submit"
            id="forgot-submit-btn"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#172554] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Reset Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-[#F1F5F9]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
