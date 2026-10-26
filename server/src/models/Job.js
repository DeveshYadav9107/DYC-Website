import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Job title is required'], trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { 
    type: String, 
    required: true,
    enum: [
      'SAP & ERP', 
      'Engineering & Technical', 
      'Manufacturing & Production', 
      'Logistics & Supply Chain', 
      'Information Technology', 
      'Finance & Accounting', 
      'Operations & Facility',
      'General Staffing'
    ],
    default: 'General Staffing'
  },
  location: { type: String, required: true, trim: true, default: 'Gurugram, Haryana' },
  workplaceType: { 
    type: String, 
    enum: ['On-site', 'Hybrid', 'Remote'], 
    default: 'On-site' 
  },
  type: { 
    type: String, 
    enum: ['full-time', 'contract', 'part-time', 'remote'], 
    default: 'full-time' 
  },
  experience: { type: String, required: true, default: '2-5 years' },
  openings: { type: Number, default: 1, min: 1 },
  salaryRange: { type: String, default: 'Competitive / As per industry' },
  skills: [{ type: String, trim: true }],
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  urgent: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['published', 'draft', 'closed'], 
    default: 'published' 
  },
  isActive: { type: Boolean, default: true },
  viewsCount: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

JobSchema.index({ department: 1, status: 1, isActive: 1 });
JobSchema.index({ skills: 1 });

export default mongoose.model('Job', JobSchema);
