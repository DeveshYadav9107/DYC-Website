import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  phone: { type: String, trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'editor', 'worker', 'customer', 'user', 'candidate', 'client'], default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  // Candidate Profile fields (for recruitment & staffing platform)
  skills: [{ type: String }],
  totalExperience: { type: String, trim: true },
  designation: { type: String, trim: true },
  company: { type: String, trim: true },
  noticePeriod: { type: String, trim: true },
  currentSalary: { type: String, trim: true },
  expectedSalary: { type: String, trim: true },
  resumeUrl: { type: String },
  resumeFileName: { type: String },
  location: { type: String, trim: true },
  headline: { type: String, trim: true },
  // SAP Client Support portal fields
  sapModules: [{ type: String }],
  sapSystem: { type: String, default: 'SAP S/4HANA Enterprise' },
  supportAgreement: { type: String, default: 'Gold Tier (8x5 Standard AMS)' },
  authorizedSupportUser: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-populate name if firstName and lastName are provided
UserSchema.pre('validate', function (next) {
  if (!this.name && (this.firstName || this.lastName)) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  next();
});

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);

