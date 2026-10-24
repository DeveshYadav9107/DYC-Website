import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
} from 'react-icons/fi';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const firstNameId = useId();
  const lastNameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength score 0 to 4
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#B88A3B]' };
    return { score: 4, label: 'Strong', color: 'bg-[#174B39]' };
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';

    const cleanedPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!cleanedPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanedPhone.length < 8 || cleanedPhone.length > 15 || !/^\+?[0-9]+$/.test(cleanedPhone)) {
      errs.phone = 'Please enter a valid phone number (e.g. +91 98765 43210)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!(/[a-zA-Z]/.test(formData.password) && /[0-9]/.test(formData.password))) {
      errs.password = 'Password must include both letters and numbers';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setServerError('');

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      await signup(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create account. Please verify your details or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout badgeText="Enterprise Registration">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B88A3B] block mb-1.5">
            Registration
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252720] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-[#66665D] mt-1.5 leading-relaxed font-sans">
            Register with Dinesh Yadav & Company to manage inquiries, view service updates, and access enterprise support.
          </p>
        </div>

        {/* Global Server Error */}
        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs leading-relaxed flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {/* Row 1 & 2: First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. First Name */}
            <div>
              <label
                htmlFor={firstNameId}
                className="block text-xs font-bold text-[#252720] mb-1 uppercase tracking-wider"
              >
                First Name <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A897C]">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  id={firstNameId}
                  type="text"
                  required
                  placeholder="Dinesh"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  className={`w-full pl-9 pr-3 py-2 text-sm text-[#252720] bg-white border rounded-xl focus:ring-2 outline-none transition placeholder:text-[#8A897C] ${
                    errors.firstName
                      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10'
                      : 'border-[#E7E0D3] focus:border-[#174B39] focus:ring-[#174B39]/20'
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* 2. Last Name */}
            <div>
              <label
                htmlFor={lastNameId}
                className="block text-xs font-bold text-[#252720] mb-1 uppercase tracking-wider"
              >
                Last Name <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A897C]">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  id={lastNameId}
                  type="text"
                  required
                  placeholder="Yadav"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  className={`w-full pl-9 pr-3 py-2 text-sm text-[#252720] bg-white border rounded-xl focus:ring-2 outline-none transition placeholder:text-[#8A897C] ${
                    errors.lastName
                      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10'
                      : 'border-[#E7E0D3] focus:border-[#174B39] focus:ring-[#174B39]/20'
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* 3. Phone Number */}
          <div>
            <label
              htmlFor={phoneId}
              className="block text-xs font-bold text-[#252720] mb-1 uppercase tracking-wider"
            >
              Phone Number <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                <FiPhone className="w-4 h-4" />
              </div>
              <input
                id={phoneId}
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange('phone')}
                className={`w-full pl-10 pr-4 py-2 text-sm text-[#252720] bg-white border rounded-xl focus:ring-2 outline-none transition placeholder:text-[#8A897C] ${
                  errors.phone
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10'
                    : 'border-[#E7E0D3] focus:border-[#174B39] focus:ring-[#174B39]/20'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-[#DC2626] mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 4. Business Email */}
          <div>
            <label
              htmlFor={emailId}
              className="block text-xs font-bold text-[#252720] mb-1 uppercase tracking-wider"
            >
              Email Address <span className="text-[#DC2626]">*</span>
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
                value={formData.email}
                onChange={handleChange('email')}
                className={`w-full pl-10 pr-4 py-2 text-sm text-[#252720] bg-white border rounded-xl focus:ring-2 outline-none transition placeholder:text-[#8A897C] ${
                  errors.email
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10'
                    : 'border-[#E7E0D3] focus:border-[#174B39] focus:ring-[#174B39]/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-[#DC2626] mt-1">{errors.email}</p>
            )}
          </div>

          {/* 5. Password */}
          <div>
            <label
              htmlFor={passwordId}
              className="block text-xs font-bold text-[#252720] mb-1 uppercase tracking-wider"
            >
              Password <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange('password')}
                className={`w-full pl-10 pr-10 py-2 text-sm text-[#252720] bg-white border rounded-xl focus:ring-2 outline-none transition placeholder:text-[#8A897C] ${
                  errors.password
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10'
                    : 'border-[#E7E0D3] focus:border-[#174B39] focus:ring-[#174B39]/20'
                }`}
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
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#66665D]">
                  {strength.label}
                </span>
              </div>
            )}
            {errors.password && (
              <p className="text-[11px] text-[#DC2626] mt-1">{errors.password}</p>
            )}
          </div>

          {/* 6. Confirm Password */}
          <div>
            <label
              htmlFor={confirmPasswordId}
              className="block text-xs font-bold text-[#252720] mb-1 uppercase tracking-wider"
            >
              Confirm Password <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A897C]">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                id={confirmPasswordId}
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={`w-full pl-10 pr-10 py-2 text-sm text-[#252720] bg-white border rounded-xl focus:ring-2 outline-none transition placeholder:text-[#8A897C] ${
                  errors.confirmPassword
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10'
                    : 'border-[#E7E0D3] focus:border-[#174B39] focus:ring-[#174B39]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A897C] hover:text-[#252720] cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-[#DC2626] mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="signup-submit-btn"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#174B39] hover:bg-[#103728] active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 rounded-full shadow-[0_4px_16px_rgba(23,75,57,0.25)] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174B39]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <FiArrowRight className="w-4 h-4 text-[#D7B875]" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center pt-4 border-t border-[#E7E0D3]">
          <p className="text-xs text-[#66665D]">
            Already have a DY&C account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#174B39] hover:text-[#103728] transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
