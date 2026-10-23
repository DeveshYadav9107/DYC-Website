import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  FiShield,
  FiMail,
  FiArrowRight,
  FiRefreshCw,
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';


const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifySignupOtp, verifyLoginOtp, resendOtp } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';
  const maskedEmail = searchParams.get('masked') || email;
  const flowType = searchParams.get('type') || 'signup'; // 'signup' | 'login'
  const returnTo = searchParams.get('returnTo') || '/';

  // 6 digit values
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(60);

  // OTP is deprecated: automatically redirect to login
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Handle digit input change
  const handleDigitChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '');

    // Handle paste of multiple characters
    if (cleanValue.length > 1) {
      handlePaste(cleanValue);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanValue;
    setDigits(newDigits);
    setError('');

    // If entered a digit, advance focus to next box
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace & navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle full clipboard paste
  const handlePaste = (pastedText) => {
    const numbersOnly = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!numbersOnly) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < numbersOnly.length; i++) {
      newDigits[i] = numbersOnly[i];
    }
    setDigits(newDigits);
    setError('');

    // Focus appropriate box
    const focusIndex = Math.min(numbersOnly.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Submit verification
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (flowType === 'signup') {
        await verifySignupOtp({ email, otp: otpCode });
      } else {
        await verifyLoginOtp({ email, otp: otpCode });
      }

      // Successful verification and session creation
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Verification failed. The code may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      await resendOtp({
        email,
        purpose: flowType === 'login' ? 'login' : 'signup',
      });
      setSuccessMsg('A new 6-digit verification code has been sent to your email.');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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

  const isComplete = digits.every((d) => d.length === 1);

  return (
    <AuthLayout badgeText="Email Verification">
      <div className="w-full max-w-md mx-auto">
        {/* Header with Icon */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4 shadow-sm border border-[#E0E7FF]">
            <FiShield className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#11183F] tracking-tight">
            {flowType === 'login' ? 'Two-Factor Login' : 'Verify your email'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            We've sent a 6-digit verification code to your email address:
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-semibold text-[#11183F]">
            <FiMail className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>{maskedEmail}</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#15803D] text-xs leading-relaxed flex items-start gap-2.5">
            <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs leading-relaxed flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-3 uppercase tracking-wider text-center">
              Enter 6-Digit One-Time Code
            </label>
            <div
              className="grid grid-cols-6 gap-2 sm:gap-3"
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text');
                handlePaste(pasted);
              }}
            >
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e.target)}
                  className={`w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold text-[#11183F] bg-white border rounded-xl focus:ring-4 outline-none transition ${
                    digit
                      ? 'border-[#4F46E5] bg-[#EEF2FF]/20 shadow-xs'
                      : 'border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5]/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-[#94A3B8] text-center mt-2.5">
              Code expires in 5 minutes. You can also paste the full 6-digit code.
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            id="otp-verify-btn"
            disabled={loading || !isComplete}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#172554] hover:bg-[#1E293B] active:scale-[0.99] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying code...</span>
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend and Navigation Actions */}
        <div className="mt-8 space-y-3 pt-6 border-t border-[#F1F5F9] text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
            <span>Didn't receive the email?</span>
            {countdown > 0 ? (
              <span className="font-semibold text-[#11183F]">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                type="button"
                id="otp-resend-btn"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 font-bold text-[#4F46E5] hover:text-[#4338CA] transition cursor-pointer disabled:opacity-60"
              >
                <FiRefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <div>
            <Link
              to={flowType === 'login' ? '/login' : '/signup'}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#11183F] transition"
            >
              <FiArrowLeft className="w-3 h-3" />
              <span>Change email or try again</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
