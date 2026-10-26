import mongoose from 'mongoose';

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
    enum: ['client', 'customer', 'admin', 'editor', 'consultant', 'support_agent'], 
    default: 'client' 
  },
  message: { type: String, required: true },
  isInternalNote: { type: Boolean, default: false },
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now },
});

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now },
});

const SupportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true, index: true },
  clientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, lowercase: true, trim: true },
  clientPhone: { type: String, trim: true },
  companyName: { type: String, required: true, trim: true },
  
  // SAP Landscape Details
  module: { 
    type: String, 
    required: true,
    enum: ['FICO', 'MM', 'SD', 'PP', 'QM', 'PM', 'ABAP', 'Basis & Security', 'S/4HANA', 'Integration & IDoc', 'Other'],
    default: 'FICO'
  },
  environment: { 
    type: String, 
    enum: ['Production (PRD)', 'Quality / UAT (QAS)', 'Development (DEV)', 'Sandbox / Test'],
    default: 'Production (PRD)'
  },
  tCode: { type: String, trim: true, default: '' },
  sapVersion: { type: String, default: 'SAP S/4HANA Enterprise' },
  
  // Classification
  category: { 
    type: String, 
    enum: [
      'Functional Issue', 
      'Configuration Bug', 
      'Enhancement Request', 
      'User Access & Authorization', 
      'Performance / Dump (ST22)', 
      'Month-End Critical', 
      'General Query'
    ],
    default: 'Functional Issue'
  },
  subject: { type: String, required: [true, 'Subject is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  
  // Priority & SLA Deadlines
  priority: { 
    type: String, 
    enum: ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'],
    default: 'P3 - Medium'
  },
  slaTargetHours: { type: Number, default: 24 },
  slaResponseDeadline: { type: Date },
  slaResolutionDeadline: { type: Date },
  slaStatus: { 
    type: String, 
    enum: ['Within SLA', 'At Risk', 'SLA Breached'],
    default: 'Within SLA'
  },
  firstRespondedAt: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  
  // Lifecycle Status
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Pending Client Info', 'In Testing / UAT', 'Resolved', 'Closed'],
    default: 'Open'
  },
  
  // Team Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String, default: 'DY&C SAP AMS Team' },
  assignedTeam: { type: String, default: 'SAP Functional & Technical Support' },
  
  // File Attachments
  attachments: [AttachmentSchema],
  
  // Discussion Thread & History
  messages: [MessageSchema],
  activityLogs: [ActivityLogSchema],
  
  // Resolution Details
  resolutionSummary: { type: String, default: '' },
  transportRequest: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  
  // CSAT Rating
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, default: '' },
}, { timestamps: true });

// Auto-generate ticketNumber and SLA deadlines before validation
SupportTicketSchema.pre('validate', function(next) {
  if (!this.ticketNumber) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    this.ticketNumber = `DYC-SAP-${year}-${randomHex}`;
  }

  // Calculate SLA deadlines if new
  if (this.isNew) {
    const now = new Date();
    let responseHours = 4;
    let resolutionHours = 24;

    if (this.priority === 'P1 - Critical') {
      responseHours = 1;
      resolutionHours = 4;
    } else if (this.priority === 'P2 - High') {
      responseHours = 2;
      resolutionHours = 8;
    } else if (this.priority === 'P3 - Medium') {
      responseHours = 4;
      resolutionHours = 24;
    } else if (this.priority === 'P4 - Low') {
      responseHours = 8;
      resolutionHours = 48;
    }

    this.slaTargetHours = resolutionHours;
    this.slaResponseDeadline = new Date(now.getTime() + responseHours * 3600 * 1000);
    this.slaResolutionDeadline = new Date(now.getTime() + resolutionHours * 3600 * 1000);
  }

  next();
});

// Dynamic SLA Status evaluator helper
SupportTicketSchema.methods.evaluateSlaStatus = function() {
  if (['Resolved', 'Closed'].includes(this.status)) {
    if (this.resolvedAt && this.slaResolutionDeadline) {
      this.slaStatus = this.resolvedAt > this.slaResolutionDeadline ? 'SLA Breached' : 'Within SLA';
    }
    return this.slaStatus;
  }

  if (this.slaResolutionDeadline) {
    const now = new Date();
    if (now > this.slaResolutionDeadline) {
      this.slaStatus = 'SLA Breached';
    } else {
      const timeRemaining = this.slaResolutionDeadline.getTime() - now.getTime();
      const totalSlaTime = this.slaTargetHours * 3600 * 1000;
      if (timeRemaining < totalSlaTime * 0.25) {
        this.slaStatus = 'At Risk';
      } else {
        this.slaStatus = 'Within SLA';
      }
    }
  }

  return this.slaStatus;
};

SupportTicketSchema.index({ clientUser: 1, status: 1 });
SupportTicketSchema.index({ module: 1, priority: 1, status: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export default mongoose.model('SupportTicket', SupportTicketSchema);
