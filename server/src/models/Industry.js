import mongoose from 'mongoose';

const IndustrySchema = new mongoose.Schema({
  name:                  { type: String, required: true },
  slug:                  { type: String, required: true, unique: true },
  scope:                 { type: String, enum: ['sap-erp', 'staffing', 'both'] },
  description:           { type: String },
  challenges:            [String],
  sapCapabilities:       [String],
  staffingCapabilities:  [String],
  icon:                  { type: String },
  image:                 { type: String },
  isActive:              { type: Boolean, default: true },
  order:                 { type: Number, default: 0 },
  seo: {
    title:       { type: String },
    description: { type: String },
  },
}, { timestamps: true });

export default mongoose.model('Industry', IndustrySchema);
