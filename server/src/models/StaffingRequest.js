import mongoose from 'mongoose';

const StaffingNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  authorName: { type: String, default: 'Recruitment Desk' },
  createdAt: { type: Date, default: Date.now },
});

const StaffingRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, unique: true, index: true },
  clientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String, required: [true, 'Company name is required'], trim: true },
  contactPerson: { type: String, required: [true, 'Contact person name is required'], trim: true },
  contactEmail: { type: String, required: [true, 'Contact email is required'], lowercase: true, trim: true },
  contactPhone: { type: String, required: [true, 'Contact phone is required'], trim: true },
  industry: { 
    type: String, 
    enum: [
      'Automotive & Engineering', 
      'Manufacturing & Production', 
      'SAP & Enterprise IT', 
      'Warehouse & Logistics', 
      'FMCG & Retail', 
      'Construction & Infrastructure',
      'Corporate & Administrative',
      'Other'
    ],
    default: 'Manufacturing & Production'
  },
  roleTitle: { type: String, required: [true, 'Role / Position title is required'], trim: true },
  employmentType: { 
    type: String, 
    enum: ['Contract Manpower', 'Permanent Placement', 'Temp-to-Hire', 'Bulk Factory Staffing', 'SAP Consultant'], 
    default: 'Contract Manpower' 
  },
  headcount: { type: Number, required: [true, 'Headcount number is required'], min: 1, default: 1 },
  experienceRequired: { type: String, default: '2-5 years' },
  requiredSkills: [{ type: String, trim: true }],
  workLocation: { type: String, required: [true, 'Work location is required'], trim: true },
  timeline: { 
    type: String, 
    enum: ['Immediate (Within 7 Days)', '15 Days', '30 Days', 'Flexible'], 
    default: '15 Days' 
  },
  budgetPerResource: { type: String, default: 'Standard / Negotiable' },
  jobDescription: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Sourcing Talent', 'Interviews Ongoing', 'Fulfilled', 'Closed'], 
    default: 'Submitted' 
  },
  fulfillmentProgress: {
    sourcedCount: { type: Number, default: 0 },
    interviewedCount: { type: Number, default: 0 },
    joinedCount: { type: Number, default: 0 },
  },
  assignedRecruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedRecruiterName: { type: String, default: 'DY&C Recruitment Desk' },
  recruiterNotes: [StaffingNoteSchema],
}, { timestamps: true });

// Auto-generate human-friendly unique requestNumber before saving
StaffingRequestSchema.pre('validate', function(next) {
  if (!this.requestNumber) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().getFullYear();
    this.requestNumber = `DYC-REQ-${datePrefix}-${randomHex}`;
  }
  next();
});

StaffingRequestSchema.index({ clientUser: 1, status: 1 });
StaffingRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('StaffingRequest', StaffingRequestSchema);
