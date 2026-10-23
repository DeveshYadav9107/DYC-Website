import mongoose from 'mongoose';

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: [true, 'Line item description is required'], trim: true },
  quantity: { type: Number, required: true, default: 1, min: [0, 'Quantity cannot be negative'] },
  unit: { type: String, trim: true, default: 'Month' }, // e.g. Month, Hour, Resource, Unit, Project
  unitRate: { type: Number, required: true, default: 0, min: [0, 'Unit rate cannot be negative'] },
  total: { type: Number, required: true, default: 0, min: [0, 'Total cannot be negative'] },
});

const ProposalStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['draft', 'ready_for_review', 'sent', 'accepted', 'declined', 'expired'],
    required: true,
  },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedByName: { type: String, default: 'Administrator' },
  note: { type: String, trim: true },
});

const ProposalSchema = new mongoose.Schema({
  // Unique human-readable proposal reference (e.g. DYC-PROP-2026-0001)
  proposalNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  parentProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
  },

  // Linked Source Enquiry
  inquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: [true, 'Source enquiry reference is required'],
  },

  // Client / Recipient Snapshot
  client: {
    name: { type: String, required: [true, 'Client contact name is required'], trim: true },
    company: { type: String, trim: true, default: '' },
    email: { type: String, required: [true, 'Client email is required'], trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
  },

  // Document Headers
  title: {
    type: String,
    required: [true, 'Proposal title is required'],
    trim: true,
  },
  serviceCategory: {
    type: String,
    enum: ['staffing-request', 'sap-resource-request', 'sap-support', 'erp-inquiry', 'general'],
    required: true,
    default: 'general',
  },

  // Solution Narrative
  clientRequirementSummary: { type: String, trim: true },
  solutionSummary: { type: String, trim: true },
  scopeOfWork: [{ type: String, trim: true }],
  deliverables: [{ type: String, trim: true }],
  resourceRequirements: { type: String, trim: true },
  timeline: { type: String, trim: true },

  // Commercial Pricing & Currency (Default: INR / ₹)
  currency: { type: String, default: 'INR', trim: true },
  currencySymbol: { type: String, default: '₹', trim: true },
  lineItems: [LineItemSchema],
  subtotal: { type: Number, default: 0, min: 0 },
  discountType: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
  discountValue: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  taxLabel: { type: String, default: 'GST', trim: true }, // configurable, not hardcoded
  taxRate: { type: Number, default: 0, min: 0 }, // e.g. 18 for 18% (only applied if explicitly configured)
  taxAmount: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, default: 0, min: 0 },

  // Commercial Terms & Engagement
  paymentTerms: { type: String, trim: true },
  assumptions: [{ type: String, trim: true }],
  exclusions: [{ type: String, trim: true }],
  clientResponsibilities: [{ type: String, trim: true }],
  validUntil: { type: Date, required: [true, 'Proposal validity date is required'] },
  closingNotes: { type: String, trim: true },

  // Internal Notes (STRICTLY EXCLUDED from client-facing PDF)
  internalNotes: { type: String, trim: true },

  // Lifecycle Status
  status: {
    type: String,
    enum: ['draft', 'ready_for_review', 'sent', 'accepted', 'declined', 'expired'],
    default: 'draft',
    index: true,
  },
  sentAt: { type: Date },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sentByName: { type: String },

  statusHistory: [ProposalStatusHistorySchema],

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String, default: 'DYC Admin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String, default: 'DYC Admin' },
}, { timestamps: true });

// Pre-save calculation hook: guarantees accurate commercial pricing
ProposalSchema.pre('validate', function (next) {
  // 1. Calculate each line item total
  if (Array.isArray(this.lineItems)) {
    this.lineItems.forEach((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const rate = Math.max(0, Number(item.unitRate) || 0);
      item.total = Math.round(qty * rate * 100) / 100;
    });

    // 2. Subtotal
    this.subtotal = Math.round(this.lineItems.reduce((acc, curr) => acc + (curr.total || 0), 0) * 100) / 100;
  } else {
    this.subtotal = 0;
  }

  // 3. Discount calculation
  if (this.discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, Number(this.discountValue) || 0));
    this.discountAmount = Math.round((this.subtotal * (pct / 100)) * 100) / 100;
  } else {
    this.discountAmount = Math.min(this.subtotal, Math.max(0, Number(this.discountValue) || 0));
  }

  const taxableAmount = Math.max(0, this.subtotal - this.discountAmount);

  // 4. Tax calculation (explicitly configured rate)
  const rate = Math.max(0, Number(this.taxRate) || 0);
  if (rate > 0) {
    this.taxAmount = Math.round((taxableAmount * (rate / 100)) * 100) / 100;
  } else {
    this.taxAmount = 0;
  }

  // 5. Grand Total
  this.grandTotal = Math.round((taxableAmount + this.taxAmount) * 100) / 100;

  next();
});

// Indexes for fast searching and retrieval
ProposalSchema.index({ inquiry: 1, createdAt: -1 });
ProposalSchema.index({ status: 1, createdAt: -1 });
ProposalSchema.index({ 'client.company': 1, 'client.name': 1 });

export default mongoose.model('Proposal', ProposalSchema);
