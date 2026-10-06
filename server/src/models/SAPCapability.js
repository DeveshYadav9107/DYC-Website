import mongoose from 'mongoose';

const SAPCapabilitySchema = new mongoose.Schema({
  name:             { type: String, required: true },
  slug:             { type: String, required: true, unique: true },
  type:             { type: String, enum: ['environment', 'functional', 'technical'] },
  category:         { type: String },
  description:      { type: String },
  shortDescription: { type: String },
  icon:             { type: String },
  technologies:     [String],
  isVerified:       { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  order:            { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('SAPCapability', SAPCapabilitySchema);
