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
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4 shadow-sm border border-[#E0E7FF]">
            <FiKey className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#11183F] tracking-tight">
            Account Recovery
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
            Support and assistance for your Dinesh Yadav & Company account.
          </p>
        </div>

        {/* Informative Status Notice */}
        <div className="mb-6 p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-xs leading-relaxed flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#2563EB]" />
          <div>
            <p className="font-semibold text-sm mb-1 text-[#1E3A8A]">Automated Recovery Unavailable</p>
            <p className="text-[#1E40AF] leading-relaxed">
              Automated password reset via email is temporarily undergoing maintenance while domain verification is in progress.
            </p>
            <p className="mt-2 text-[#1E40AF] leading-relaxed">
              For immediate assistance with your account credentials, please contact our administrative support team directly with your registered email:
            </p>
          </div>
        </div>

        {/* Contact Support Direct Action */}
        <div className="space-y-3">
          <a
            href="mailto:info@dycinfo.com?subject=DY%26C%20Account%20Password%20Reset%20Request"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#172554] hover:bg-[#1E293B] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md transition"
          >
            <FiMail className="w-4 h-4" />
            <span>Email Support: info@dycinfo.com</span>
          </a>

          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#1E293B] text-sm font-semibold py-2.5 px-4 rounded-xl transition"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>

        <div className="mt-8 text-center pt-6 border-t border-[#F1F5F9]">
          <p className="text-xs text-[#64748B]">
            Need immediate phone assistance? Call{' '}
            <a href="tel:+919876543210" className="font-semibold text-[#4F46E5] hover:underline">
              +91 98765 43210
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
