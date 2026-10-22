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
 * @desc    Initiate Signup — validate details, create pending record & send real OTP
 * @route   POST /api/v1/auth/signup/initiate
 * @access  Public
 */
export const initiateSignup = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in DB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(
        new ApiError(400, 'An account with this email address already exists. Please log in.')
      );
    }

    // Cooldown check for existing signup challenge (min 20 seconds between attempts)
    const existingChallenge = await OtpChallenge.findOne({
      email: normalizedEmail,
      purpose: 'signup',
    });
    if (existingChallenge) {
      const secondsSinceCreation = (Date.now() - new Date(existingChallenge.createdAt).getTime()) / 1000;
      if (secondsSinceCreation < 20) {
        return next(
          new ApiError(
            429,
            `Please wait ${Math.ceil(20 - secondsSinceCreation)} seconds before requesting a new code.`
          )
        );
      }
    }

    // Hash user's password for pending storage (do not store plaintext password)
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate random 6-digit numeric OTP and hash it with bcrypt
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove any previous signup challenges for this email
    await OtpChallenge.deleteMany({ email: normalizedEmail, purpose: 'signup' });

    // Store pending challenge (expires in 5 minutes)
    await OtpChallenge.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'signup',
      pendingUserData: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        passwordHash,
      },
      attempts: 0,
      maxAttempts: 5,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      createdAt: new Date(),
    });

    // Send real email via SMTP
    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose: 'signup',
      firstName: firstName.trim(),
    });

    return successResponse(
      res,
      200,
      'A 6-digit verification code has been sent to your email address.',
      {
        email: normalizedEmail,
        maskedEmail: maskEmail(normalizedEmail),
        purpose: 'signup',
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Signup OTP — verify challenge and create active User
 * @route   POST /api/v1/auth/signup/verify
 * @access  Public
 */
export const verifySignupOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ApiError(400, 'Please provide both email and verification code'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Find active challenge
    const challenge = await OtpChallenge.findOne({
      email: normalizedEmail,
      purpose: 'signup',
    });

    if (!challenge) {
      return next(
        new ApiError(400, 'Verification code has expired or is invalid. Please request a new code.')
      );
    }

    // Explicit expiration check
    if (new Date() > challenge.expiresAt) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(
        new ApiError(400, 'Verification code has expired. Please request a new code.')
      );
    }

    // Attempt limit check
    if (challenge.attempts >= challenge.maxAttempts) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(
        new ApiError(429, 'Too many failed verification attempts. Please request a new code.')
      );
    }

    // Verify OTP hash
    const isMatch = await bcrypt.compare(cleanOtp, challenge.otpHash);
    if (!isMatch) {
      challenge.attempts += 1;
      await challenge.save();
      const remaining = challenge.maxAttempts - challenge.attempts;
      return next(
        new ApiError(400, `Invalid verification code. ${remaining} attempt(s) remaining.`)
      );
    }

    // Double check email uniqueness before user creation
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(new ApiError(400, 'Account already exists. Please log in.'));
    }

    // Extract pending signup data
    const { firstName, lastName, phone, passwordHash } = challenge.pendingUserData || {};
    if (!passwordHash) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(new ApiError(400, 'Registration session expired. Please sign up again.'));
    }

    // Create verified user
    const newUser = new User({
      firstName,
      lastName,
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'User',
      phone,
      email: normalizedEmail,
      password: passwordHash, // already hashed
      role: 'customer',
      isEmailVerified: true,
      isActive: true,
      lastLogin: new Date(),
    });

    await newUser.save();

    // Invalidate challenge (single-use)
    await OtpChallenge.deleteOne({ _id: challenge._id });

    // Establish authenticated session
    return sendTokenResponse(newUser, 201, res, 'Account created and verified successfully!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initiate Login — verify password and send OTP challenge to email
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) {
      return next(new ApiError(400, 'Please enter your email address'));
    }

    const normalizedEmail = email.trim().toLowerCase();

    // If both password and OTP are supplied in a single call (e.g. automated verify)
    if (otp) {
      req.body.email = normalizedEmail;
      return verifyLoginOtp(req, res, next);
    }

    if (!password) {
      return next(new ApiError(400, 'Please enter your password'));
    }

    // Find user in database
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Generate random 6-digit numeric OTP and hash it with bcrypt
    const generatedOtp = generateOtp();
    const otpHash = await bcrypt.hash(generatedOtp, 10);

    // Remove any previous login challenges for this email
    await OtpChallenge.deleteMany({ email: normalizedEmail, purpose: 'login' });

    // Store login challenge (5 min expiry)
    await OtpChallenge.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'login',
      attempts: 0,
      maxAttempts: 5,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
    });

    // Send real OTP email
    await sendOtpEmail({
      to: normalizedEmail,
      otp: generatedOtp,
      purpose: 'login',
      firstName: user.firstName || user.name.split(' ')[0],
    });

    return successResponse(
      res,
      200,
      'A 6-digit login verification code has been sent to your email address.',
      {
        requiresOtp: true,
        email: normalizedEmail,
        maskedEmail: maskEmail(normalizedEmail),
        role: user.role,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Login OTP — verify code and establish authenticated session
 * @route   POST /api/v1/auth/login/verify
 * @access  Public
 */
export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ApiError(400, 'Please provide both email and verification code'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Find active challenge
    const challenge = await OtpChallenge.findOne({
      email: normalizedEmail,
      purpose: 'login',
    });

    if (!challenge) {
      return next(
        new ApiError(400, 'Verification code has expired or is invalid. Please sign in again.')
      );
    }

    // Expiry check
    if (new Date() > challenge.expiresAt) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(
        new ApiError(400, 'Verification code has expired. Please sign in again.')
      );
    }

    // Attempts check
    if (challenge.attempts >= challenge.maxAttempts) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(
        new ApiError(429, 'Too many failed verification attempts. Please sign in again.')
      );
    }

    // Verify OTP hash
    const isMatch = await bcrypt.compare(cleanOtp, challenge.otpHash);
    if (!isMatch) {
      challenge.attempts += 1;
      await challenge.save();
      const remaining = challenge.maxAttempts - challenge.attempts;
      return next(
        new ApiError(400, `Invalid verification code. ${remaining} attempt(s) remaining.`)
      );
    }

    // Challenge valid: delete challenge (single-use)
    await OtpChallenge.deleteOne({ _id: challenge._id });

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User account is inactive or not found'));
    }

    // Update user login metadata & email verified status
    user.lastLogin = new Date();
    user.isEmailVerified = true;
    await user.save();

    // Establish session
    return sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP for any purpose (signup, login, password-reset)
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return next(new ApiError(400, 'Please provide both email and purpose'));
    }

    if (!['signup', 'login', 'password-reset'].includes(purpose)) {
      return next(new ApiError(400, 'Invalid OTP purpose'));
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find existing challenge
    const existingChallenge = await OtpChallenge.findOne({
      email: normalizedEmail,
      purpose,
    });

    // Enforce cooldown (minimum 30 seconds since last challenge creation)
    if (existingChallenge) {
      const secondsSinceCreation = (Date.now() - new Date(existingChallenge.createdAt).getTime()) / 1000;
      if (secondsSinceCreation < 30) {
        return next(
          new ApiError(
            429,
            `Please wait ${Math.ceil(30 - secondsSinceCreation)} seconds before requesting a new code.`
          )
        );
      }
    }

    // For login or password-reset, user must exist in User collection
    let recipientName = '';
    if (purpose !== 'signup') {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        // Return generic message to avoid email enumeration
        return successResponse(
          res,
          200,
          'A new verification code has been sent if this account exists.',
          { maskedEmail: maskEmail(normalizedEmail) }
        );
      }
      recipientName = user.firstName || user.name.split(' ')[0];
    } else {
      if (!existingChallenge || !existingChallenge.pendingUserData) {
        return next(
          new ApiError(400, 'Registration session has expired. Please fill out the signup form again.')
        );
      }
      recipientName = existingChallenge.pendingUserData.firstName;
    }

    // Generate new OTP
    const newOtp = generateOtp();
    const newOtpHash = await bcrypt.hash(newOtp, 10);

    // Keep pendingUserData if signup
    const pendingData = existingChallenge?.pendingUserData;

    await OtpChallenge.deleteMany({ email: normalizedEmail, purpose });

    await OtpChallenge.create({
      email: normalizedEmail,
      otpHash: newOtpHash,
      purpose,
      pendingUserData: pendingData,
      attempts: 0,
      maxAttempts: 5,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
    });

    // Send email
    await sendOtpEmail({
      to: normalizedEmail,
      otp: newOtp,
      purpose,
      firstName: recipientName,
    });

    return successResponse(
      res,
      200,
      'A new verification code has been sent to your email.',
      {
        email: normalizedEmail,
        maskedEmail: maskEmail(normalizedEmail),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password — initiate password reset OTP
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return next(new ApiError(400, 'Please provide a valid email address'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // To prevent account enumeration, return generic success message even if user does not exist
    if (user && user.isActive) {
      // Cooldown check
      const existing = await OtpChallenge.findOne({
        email: normalizedEmail,
        purpose: 'password-reset',
      });
      if (existing) {
        const secondsSinceCreation = (Date.now() - new Date(existing.createdAt).getTime()) / 1000;
        if (secondsSinceCreation < 20) {
          return next(
            new ApiError(
              429,
              `Please wait ${Math.ceil(20 - secondsSinceCreation)} seconds before requesting a new code.`
            )
          );
        }
      }

      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      await OtpChallenge.deleteMany({ email: normalizedEmail, purpose: 'password-reset' });

      await OtpChallenge.create({
        email: normalizedEmail,
        otpHash,
        purpose: 'password-reset',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
      });

      await sendOtpEmail({
        to: normalizedEmail,
        otp,
        purpose: 'password-reset',
        firstName: user.firstName || user.name.split(' ')[0],
      });
    }

    return successResponse(
      res,
      200,
      'If an account exists with this email address, a verification code has been sent.',
      {
        email: normalizedEmail,
        maskedEmail: maskEmail(normalizedEmail),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password — verify reset OTP and save new password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return next(new ApiError(400, 'Please provide your email, verification code, and new password'));
    }

    if (!isValidPassword(newPassword)) {
      return next(
        new ApiError(
          400,
          'Password must be at least 8 characters long and contain both letters and numbers'
        )
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const challenge = await OtpChallenge.findOne({
      email: normalizedEmail,
      purpose: 'password-reset',
    });

    if (!challenge) {
      return next(
        new ApiError(400, 'Verification code has expired or is invalid. Please request a new code.')
      );
    }

    if (new Date() > challenge.expiresAt) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(
        new ApiError(400, 'Verification code has expired. Please request a new code.')
      );
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return next(
        new ApiError(429, 'Too many failed attempts. Please request a new code.')
      );
    }

    // Verify OTP hash
    const isMatch = await bcrypt.compare(cleanOtp, challenge.otpHash);
    if (!isMatch) {
      challenge.attempts += 1;
      await challenge.save();
      const remaining = challenge.maxAttempts - challenge.attempts;
      return next(
        new ApiError(400, `Invalid verification code. ${remaining} attempt(s) remaining.`)
      );
    }

    // Invalidate challenge (single-use)
    await OtpChallenge.deleteOne({ _id: challenge._id });

    // Update user password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return next(new ApiError(404, 'User account not found'));
    }

    user.password = newPassword;
    await user.save();

    return successResponse(
      res,
      200,
      'Your password has been reset successfully. Please sign in with your new password.'
    );
  } catch (error) {
    next(error);
  }
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
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
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
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (firstName || lastName) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    if (phone) {
      if (!isValidPhone(phone)) {
        return next(new ApiError(400, 'Please enter a valid phone number'));
      }
      user.phone = phone.trim();
    }

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
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
