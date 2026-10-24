import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  FiKey,
  FiMail,
  FiArrowLeft,
  FiAlertCircle,
} from 'react-icons/fi';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout badgeText="Account Recovery">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mb-4 shadow-sm border border-[#174B39]/20">
            <FiKey className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B88A3B] block mb-1.5">
            Security Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight">
            Account Recovery
          </h1>
          <p className="text-xs sm:text-sm text-[#66665D] mt-1.5 leading-relaxed font-sans">
            Support and assistance for your Dinesh Yadav & Company enterprise account.
          </p>
        </div>

        {/* Informative Status Notice */}
        <div className="mb-6 p-4 rounded-xl bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720] text-xs leading-relaxed flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#B88A3B]" />
          <div>
            <p className="font-bold text-sm mb-1 text-[#252720]">Direct Account Support</p>
            <p className="text-[#66665D] leading-relaxed">
              For security compliance, enterprise password management is handled directly through our verified administrative support desk.
            </p>
            <p className="mt-2 text-[#66665D] leading-relaxed">
              Please contact our administrative support team from your registered business email:
            </p>
          </div>
        </div>

        {/* Contact Support Direct Action */}
        <div className="space-y-3">
          <a
            href="mailto:info@dycinfo.com?subject=DY%26C%20Account%20Password%20Reset%20Request"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white text-sm font-semibold py-3 px-4 rounded-full shadow-[0_4px_16px_rgba(23,75,57,0.25)] transition"
          >
            <FiMail className="w-4 h-4 text-[#D7B875]" />
            <span>Email Support: info@dycinfo.com</span>
          </a>

          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FDFBF7] border border-[#E7E0D3] text-[#252720] text-sm font-semibold py-3 px-4 rounded-full transition"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
