import rateLimit from 'express-rate-limit';

// Standard rate limiter for login / signup initiation
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
  },
});

// Stricter rate limiter for OTP verification endpoints to prevent brute force
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 OTP verification attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts, please try again after 15 minutes.',
  },
});

// Rate limiter for OTP resend
export const otpResendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 resend requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP resend requests, please wait a few minutes before trying again.',
  },
});
