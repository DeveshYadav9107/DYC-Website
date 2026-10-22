import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: [true, 'Note text is required'], trim: true, maxlength: 2000 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, trim: true, default: 'DYC Admin' },
  addedAt: { type: Date, default: Date.now },
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
  // Contact info
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  company: { type: String, trim: true },
  email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
  phone: { type: String, trim: true },

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

  // SAP Resource Request fields
  sapModule: { type: String, trim: true },
  requiredRole: { type: String, trim: true },
  experienceRequired: { type: String, trim: true },
  numberOfProfessionals: { type: Number },
  location: { type: String, trim: true },
  engagementType: { type: String, trim: true },
  joiningTimeline: { type: String, trim: true },

  // SAP Support fields
  sapSystem: { type: String, trim: true },
  issueType: { type: String, trim: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  preferredContact: { type: String, trim: true },

  // ERP Inquiry fields
  businessType: { type: String, trim: true },
  currentSystem: { type: String, trim: true },
  requiredERPArea: { type: String, trim: true },
  numberOfUsers: { type: Number },
  timeline: { type: String, trim: true },

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

  source: { type: String, default: 'website', trim: true },
}, { timestamps: true });

// Backward compatibility & stage-status synchronization hook
InquirySchema.pre('save', function (next) {
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
      performedByName: 'Website Visitor',
      createdAt: this.createdAt || new Date(),
    }];
  }

  next();
});

// Indexes for fast querying, filtering, and sorting
InquirySchema.index({ type: 1, status: 1, leadStage: 1, priority: 1, createdAt: -1 });
InquirySchema.index({ nextFollowUpAt: 1, followUpStatus: 1 });
InquirySchema.index({ assignedTo: 1 });
InquirySchema.index({ email: 1, user: 1 });

export default mongoose.model('Inquiry', InquirySchema);
