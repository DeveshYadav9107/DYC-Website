import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: [true, 'Note text is required'], trim: true, maxlength: 2000 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, trim: true, default: 'DYC Admin' },
  addedAt: { type: Date, default: Date.now },
});

const AttachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number },
  fileType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  uploadedByName: { type: String, default: 'User' },
});

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, required: true },
  senderRole: {
    type: String,
    enum: ['client', 'customer', 'admin', 'editor', 'consultant'],
    default: 'customer',
  },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now },
});

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'created',
      'status_updated',
      'stage_updated',
      'priority_updated',
      'assigned',
      'unassigned',
      'follow_up_scheduled',
      'follow_up_rescheduled',
      'follow_up_completed',
      'follow_up_cancelled',
      'note_added',
      'approved',
      'rejected',
      'proposal_created',
      'proposal_updated',
      'proposal_sent',
      'proposal_accepted',
      'proposal_declined',
      'proposal_revised',
      'ticket_closed',
      'ticket_reopened',
      'message_sent',
    ],
    required: true,
  },
  description: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String, default: 'System' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const InquirySchema = new mongoose.Schema({
  // Unique human-readable enquiry reference
  enquiryNumber: { type: String, trim: true },

  // Contact info
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  company: { type: String, trim: true },
  email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
  phone: { type: String, trim: true },
  designation: { type: String, trim: true },

  // Classification
  type: {
    type: String,
    enum: ['general', 'sap-support', 'sap-resource-request', 'staffing-request', 'erp-inquiry'],
    required: true,
    default: 'general',
  },
  service: { type: String, trim: true },
  requirement: { type: String, trim: true },
  message: { type: String, trim: true },

  // Phase 2: Manpower & Staffing Specific Fields
  staffingPositions: [{
    roleTitle: { type: String, trim: true },
    count: { type: Number, default: 1 },
    skillLevel: { type: String, trim: true },
    employmentType: { type: String, trim: true },
    location: { type: String, trim: true },
  }],
  skillLevel: { type: String, trim: true },
  employmentType: { type: String, trim: true },
  budgetRange: { type: String, trim: true },
  deploymentPreference: { type: String, trim: true },
  startDate: { type: String, trim: true },
  duration: { type: String, trim: true },

  // Phase 2: SAP Resource Request Specific Fields
  sapRole: { type: String, trim: true },
  sapModule: { type: String, trim: true },
  sapResourceCategory: { type: String, trim: true }, // functional, technical, techno-functional
  experienceRequired: { type: String, trim: true },
  experienceLevel: { type: String, trim: true },
  numberOfProfessionals: { type: Number },
  numberOfConsultants: { type: Number },
  sapEnvironment: { type: String, trim: true }, // ECC 6.0, S/4HANA Cloud, S/4HANA On-Premise, etc.
  requiredRole: { type: String, trim: true },
  location: { type: String, trim: true },
  engagementType: { type: String, trim: true },
  joiningTimeline: { type: String, trim: true },

  // Phase 2: SAP Support & Maintenance Specific Fields
  supportType: { type: String, trim: true }, // AMS, incident, enhancements, upgrade, migration, integration
  supportCoverage: { type: String, trim: true }, // 8x5, 16x5, 24x7
  businessImpact: { type: String, trim: true },
  sapSystem: { type: String, trim: true },
  issueType: { type: String, trim: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical', 'urgent'] },
  preferredContact: { type: String, trim: true },

  // Phase 2: ERP Solutions Specific Fields
  industry: { type: String, trim: true },
  currentSystem: { type: String, trim: true },
  currentSoftware: { type: String, trim: true },
  departmentsInvolved: [{ type: String, trim: true }],
  requiredERPArea: { type: String, trim: true },
  desiredFunctionality: [{ type: String, trim: true }],
  integrationNeeds: { type: String, trim: true },
  numberOfUsers: { type: Number },
  userSize: { type: String, trim: true },
  timeline: { type: String, trim: true },
  businessType: { type: String, trim: true },
  businessObjectives: { type: String, trim: true },

  // Catch-all flexible structured store for domain-specific attributes
  structuredRequirements: { type: mongoose.Schema.Types.Mixed },

  // Lead Lifecycle & Workflow
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'converted', 'closed', 'approved', 'rejected'],
    default: 'new',
  },
  leadStage: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal-sent', 'won', 'lost'],
    default: 'new',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },

  // Ownership & Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Follow-up Management
  nextFollowUpAt: { type: Date },
  followUpNote: { type: String, trim: true, maxlength: 1000 },
  followUpStatus: {
    type: String,
    enum: ['none', 'scheduled', 'completed', 'cancelled'],
    default: 'none',
  },
  followUpCompletedAt: { type: Date },
  followUpCompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Private Internal Notes & Audit Trail
  notes: [NoteSchema],
  timeline: [ActivitySchema],

  // File Attachments submitted with initial enquiry / ticket
  attachments: [AttachmentSchema],

  // Two-way conversation messages between customer and staff
  messages: [MessageSchema],

  // Ticket closure tracking & lock
  closedAt: { type: Date },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedByName: { type: String },
  closureReason: { type: String, trim: true },

  source: { type: String, default: 'website', trim: true },
}, { timestamps: true });

// Pre-save hook: Auto-generate human-readable enquiryNumber and sync stage-status
InquirySchema.pre('save', function (next) {
  // Generate human-friendly reference if absent
  if (!this.enquiryNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.enquiryNumber = `DYC-ENQ-${year}-${rand}`;
  }

  // If leadStage is changed, sync status
  if (this.isModified('leadStage') && !this.isModified('status')) {
    const stageToStatusMap = {
      'new': 'new',
      'contacted': 'contacted',
      'qualified': 'qualified',
      'proposal-sent': 'proposal',
      'won': 'converted',
      'lost': 'closed',
    };
    if (stageToStatusMap[this.leadStage]) {
      this.status = stageToStatusMap[this.leadStage];
    }
  } else if (this.isModified('status') && !this.isModified('leadStage')) {
    // If status is changed, sync leadStage
    const statusToStageMap = {
      'new': 'new',
      'contacted': 'contacted',
      'qualified': 'qualified',
      'proposal': 'proposal-sent',
      'converted': 'won',
      'closed': 'lost',
      'approved': 'qualified',
      'rejected': 'lost',
    };
    if (statusToStageMap[this.status]) {
      this.leadStage = statusToStageMap[this.status];
    }
  }

  // Ensure initial timeline event exists on new documents
  if (this.isNew && (!this.timeline || this.timeline.length === 0)) {
    this.timeline = [{
      type: 'created',
      description: `Enquiry received via website (${this.type || 'general'})`,
      performedByName: this.name || 'Website Visitor',
      createdAt: this.createdAt || new Date(),
    }];
  }

  next();
});

// Indexes for fast querying, filtering, and sorting
InquirySchema.index({ type: 1, status: 1, leadStage: 1, priority: 1, createdAt: -1 });
InquirySchema.index({ enquiryNumber: 1 });
InquirySchema.index({ nextFollowUpAt: 1, followUpStatus: 1 });
InquirySchema.index({ assignedTo: 1 });
InquirySchema.index({ email: 1, user: 1 });

export default mongoose.model('Inquiry', InquirySchema);
