import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema({
  label:        { type: String, required: true },
  key:          { type: String, required: true, unique: true },
  value:        { type: String, required: true },
  numericValue: { type: Number },
  suffix:       { type: String },
  icon:         { type: String },
  isVerified:   { type: Boolean, default: false }, // Requires client verification
  order:        { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Metric', MetricSchema);
