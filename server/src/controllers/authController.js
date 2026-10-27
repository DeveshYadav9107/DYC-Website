import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import OtpChallenge from '../models/OtpChallenge.js';
import ApiError from '../utils/apiError.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import env from '../config/env.js';
import { sendOtpEmail } from '../services/emailService.js';

// JWT generator
const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

// Helper: Mask email for privacy (e.g. d****@gmail.com)
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const visible = Math.min(2, Math.floor(local.length / 3) + 1);
  const maskedLocal = local.substring(0, visible) + '*'.repeat(Math.max(4, local.length - visible));
  return `${maskedLocal}@${domain}`;
};

// Helper: Standard response establishing session & cookies
const sendTokenResponse = (user, statusCode, res, message = 'Authentication successful') => {
  const token = generateToken(user._id);

  // Set HTTP-only cookie
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
  res.cookie('token', token, cookieOptions);

  return successResponse(res, statusCode, message, {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

// Helper: Validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Helper: Validate phone number format (supports Indian & International formats)
const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15 && /^\+?[0-9]+$/.test(cleaned);
};

// Helper: Validate password strength (min 8 chars, at least 1 letter and 1 number)
const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

// Helper: Generate secure 6-digit random numeric OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * @desc    Direct Signup — validate details, create User in MongoDB & return JWT session
 * @route   POST /api/v1/auth/signup (and /api/v1/auth/signup/initiate)
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, password, confirmPassword } = req.body;

    if (!firstName || !firstName.trim()) {
      return next(new ApiError(400, 'First name is required'));
    }
    if (!lastName || !lastName.trim()) {
      return next(new ApiError(400, 'Last name is required'));
    }
    if (!phone || !isValidPhone(phone)) {
      return next(new ApiError(400, 'Please enter a valid phone number (e.g. +91 98765 43210)'));
    }
    if (!email || !isValidEmail(email)) {
      return next(new ApiError(400, 'Please enter a valid email address'));
    }
    if (!password || !isValidPassword(password)) {
      return next(
        new ApiError(
          400,
          'Password must be at least 8 characters long and contain both letters and numbers'
        )
      );
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return next(new ApiError(400, 'Passwords do not match'));
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in DB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(
        new ApiError(400, 'An account with this email address already exists. Please log in.')
      );
    }

    // Create user directly in MongoDB
    // Strictly assign customer role — never allow self-assigning admin or other privileged roles
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
      email: normalizedEmail,
      password, // securely hashed with bcrypt in UserSchema pre-save hook
      role: 'customer',
      isEmailVerified: false, // email ownership is unverified since OTP was removed
      isActive: true,
      lastLogin: new Date(),
    });

    await newUser.save();

    // Establish authenticated session with JWT and HTTP-only cookie
    return sendTokenResponse(newUser, 201, res, 'Account created and logged in successfully!');
  } catch (error) {
    next(error);
  }
};

// Backwards-compatible alias
export const initiateSignup = signup;

/**
 * @desc    Verify Signup OTP — Deprecated (direct password signup in use)
 * @route   POST /api/v1/auth/signup/verify
 * @access  Public
 */
export const verifySignupOtp = async (req, res, next) => {
  return next(
    new ApiError(
      400,
      'Email OTP verification is no longer required. You can log in directly with your email and password.'
    )
  );
};

/**
 * @desc    Login — verify credentials & establish authenticated session
 * @route   POST /api/v1/auth/login (and /api/v1/auth/login/initiate)
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return next(new ApiError(400, 'Please enter your email address'));
    }
    if (!password) {
      return next(new ApiError(400, 'Please enter your password'));
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in database
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Update login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Establish session and return user + token directly (no OTP)
    return sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Login OTP — Deprecated (direct password login in use)
 * @route   POST /api/v1/auth/login/verify
 * @access  Public
 */
export const verifyLoginOtp = async (req, res, next) => {
  return next(
    new ApiError(
      400,
      'Email OTP verification is no longer required. You can log in directly with your email and password.'
    )
  );
};

/**
 * @desc    Resend OTP — Deprecated
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res, next) => {
  return next(new ApiError(400, 'Email OTP verification is no longer in use.'));
};

/**
 * @desc    Forgot Password — Notify users of manual reset assistance while automated reset is maintained
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  return next(
    new ApiError(
      503,
      'Automated password recovery via email is temporarily undergoing maintenance. Please contact support at info@dycinfo.com or call +91 98765 43210 for assistance.'
    )
  );
};

/**
 * @desc    Reset Password — Notify users of manual reset assistance while automated reset is maintained
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  return next(
    new ApiError(
      503,
      'Automated password recovery via email is temporarily undergoing maintenance. Please contact support at info@dycinfo.com or call +91 98765 43210 for assistance.'
    )
  );
};

/**
 * @desc    Get Current User (Authoritative backend verification)
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User account not found or inactive'));
    }

    return successResponse(res, 200, 'User data retrieved', {
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || '',
      bio: user.bio || '',
      designation: user.designation || '',
      company: user.company || '',
      skills: user.skills || [],
      totalExperience: user.totalExperience || '',
      noticePeriod: user.noticePeriod || '',
      currentSalary: user.currentSalary || '',
      expectedSalary: user.expectedSalary || '',
      location: user.location || '',
      headline: user.headline || '',
      resumeUrl: user.resumeUrl || '',
      resumeFileName: user.resumeFileName || '',
      sapModules: user.sapModules || [],
      sapSystem: user.sapSystem || '',
      supportAgreement: user.supportAgreement || '',
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      name,
      phone,
      avatar,
      bio,
      designation,
      company,
      skills,
      totalExperience,
      noticePeriod,
      currentSalary,
      expectedSalary,
      location,
      headline,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (name) {
      user.name = name.trim();
      const parts = user.name.split(' ');
      user.firstName = parts[0] || '';
      user.lastName = parts.slice(1).join(' ') || '';
    } else if (firstName !== undefined || lastName !== undefined) {
      if (firstName !== undefined) user.firstName = firstName.trim();
      if (lastName !== undefined) user.lastName = lastName.trim();
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar; // Stored directly in MongoDB Atlas document (base64 or URL)
    }

    if (bio !== undefined) user.bio = bio.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (company !== undefined) user.company = company.trim();
    if (location !== undefined) user.location = location.trim();
    if (headline !== undefined) user.headline = headline.trim();
    if (totalExperience !== undefined) user.totalExperience = totalExperience.trim();
    if (noticePeriod !== undefined) user.noticePeriod = noticePeriod.trim();
    if (currentSalary !== undefined) user.currentSalary = currentSalary.trim();
    if (expectedSalary !== undefined) user.expectedSalary = expectedSalary.trim();

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return next(new ApiError(400, 'Current password is required to change password'));
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return next(new ApiError(400, 'Current password is incorrect'));
      }
      if (newPassword.length < 6) {
        return next(new ApiError(400, 'New password must be at least 6 characters'));
      }
      user.password = newPassword;
    }

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || '',
      bio: user.bio || '',
      designation: user.designation || '',
      company: user.company || '',
      skills: user.skills || [],
      totalExperience: user.totalExperience || '',
      noticePeriod: user.noticePeriod || '',
      currentSalary: user.currentSalary || '',
      expectedSalary: user.expectedSalary || '',
      location: user.location || '',
      headline: user.headline || '',
      resumeUrl: user.resumeUrl || '',
      resumeFileName: user.resumeFileName || '',
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout — clear cookie & session
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  return successResponse(res, 200, 'Logged out successfully');
};
