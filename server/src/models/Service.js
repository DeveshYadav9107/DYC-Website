import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  slug:             { type: String, required: true, unique: true },
  category:         { type: String, enum: ['staffing', 'sap-resources', 'sap-support', 'erp'] },
  shortDescription: { type: String },
  description:      { type: String },
  icon:             { type: String },
  image:            { type: String },
  features:         [{ title: String, description: String, icon: String }],
  order:            { type: Number, default: 0 },
  isActive:         { type: Boolean, default: true },
  seo: {
    title:       { type: String },
    description: { type: String },
    keywords:    [String],
  },
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);
