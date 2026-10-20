import express from 'express';
import {
  initiateSignup,
  verifySignupOtp,
  login,
  verifyLoginOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  authLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Signup flow
router.post('/signup/initiate', authLimiter, initiateSignup);
router.post('/signup/verify', otpVerifyLimiter, verifySignupOtp);

// Login flow (requires password then OTP)
router.post('/login', authLimiter, login);
router.post('/login/initiate', authLimiter, login);
router.post('/login/verify', otpVerifyLimiter, verifyLoginOtp);

// Resend OTP
router.post('/resend-otp', otpResendLimiter, resendOtp);

// Password recovery
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, resetPassword);

// Authenticated user operations
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', logout);

export default router;
