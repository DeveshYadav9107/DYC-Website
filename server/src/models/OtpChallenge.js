import mongoose from 'mongoose';

const OtpChallengeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'password-reset'],
    required: true,
    index: true,
  },
  // Used only for pending signup challenges so unverified users are NOT saved to User collection prematurely
  pendingUserData: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String },
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL auto-cleanup
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for querying active challenges by email and purpose
OtpChallengeSchema.index({ email: 1, purpose: 1 });

export default mongoose.model('OtpChallenge', OtpChallengeSchema);
