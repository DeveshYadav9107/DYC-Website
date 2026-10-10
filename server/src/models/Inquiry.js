import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
});

const InquirySchema = new mongoose.Schema({
  // Contact info
  name: { type: String, required: [true, 'Name is required'] },
  company: { type: String },
  email: { type: String, required: [true, 'Email is required'] },
  phone: { type: String },

  // Classification
  type: {
    type: String,
    enum: ['general', 'sap-support', 'sap-resource-request', 'staffing-request', 'erp-inquiry'],
    required: true,
    default: 'general',
  },
  service: { type: String },
  requirement: { type: String },
  message: { type: String },

  // SAP Resource Request fields
  sapModule: { type: String },
  requiredRole: { type: String },
  experienceRequired: { type: String },
  numberOfProfessionals: { type: Number },
  location: { type: String },
  engagementType: { type: String },
  joiningTimeline: { type: String },

  // SAP Support fields
  sapSystem: { type: String },
  issueType: { type: String },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  preferredContact: { type: String },

  // ERP Inquiry fields
  businessType: { type: String },
  currentSystem: { type: String },
  requiredERPArea: { type: String },
  numberOfUsers: { type: Number },
  timeline: { type: String },

  // Workflow
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'converted', 'closed'],
    default: 'new',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [NoteSchema],
  source: { type: String, default: 'website' },
}, { timestamps: true });

// Index for fast querying
InquirySchema.index({ type: 1, status: 1, createdAt: -1 });

export default mongoose.model('Inquiry', InquirySchema);
