import { useState, useEffect, useId } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword, resendOtp } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';
  const maskedEmail = searchParams.get('masked') || email;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [countdown, setCountdown] = useState(60);

  const otpId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  // If email is missing, redirect to forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!(/[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword))) {
      setError('Password must contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email,
        otp: cleanOtp,
        newPassword,
      });

      // Redirect to login with success flag
      navigate('/login?reset=success', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to reset password. Please verify the code or request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    setInfoMsg('');

    try {
      await resendOtp({ email, purpose: 'password-reset' });
      setInfoMsg('A new verification code has been sent to your email.');
      setCountdown(60);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to resend code. Please try again shortly.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout badgeText="Set New Password">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#11183F] tracking-tight">
            Set new password
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Enter the 6-digit recovery code sent to:
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-semibold text-[#11183F]">
            <FiMail className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>{maskedEmail}</span>
          </div>
        </div>

        {infoMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#15803D] text-xs leading-relaxed">
            {infoMsg}
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs leading-relaxed flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Code */}
          <div>
            <label
              htmlFor={otpId}
              className="block text-xs font-bold text-[#1E293B] mb-1 uppercase tracking-wider"
            >
              6-Digit Verification Code
            </label>
            <input
              id={otpId}
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 583921"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2.5 text-base sm:text-lg font-bold tracking-widest text-center text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-[#94A3B8]"
            />
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor={newPasswordId}
              className="block text-xs font-bold text-[#1E293B] mb-1 uppercase tracking-wider"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                id={newPasswordId}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            {newPassword && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B]">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor={confirmPasswordId}
              className="block text-xs font-bold text-[#1E293B] mb-1 uppercase tracking-wider"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                id={confirmPasswordId}
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition placeholder:text-[#94A3B8]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#11183F] cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="reset-submit-btn"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#172554] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Resetting password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-3 pt-6 border-t border-[#F1F5F9] text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
            <span>Didn't receive code?</span>
            {countdown > 0 ? (
              <span className="font-semibold text-[#11183F]">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 font-bold text-[#4F46E5] hover:text-[#4338CA] transition cursor-pointer"
              >
                <FiRefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#11183F] transition"
            >
              <FiArrowLeft className="w-3 h-3" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
