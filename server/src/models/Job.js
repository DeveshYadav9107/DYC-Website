import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  department:  { type: String },
  location:    { type: String },
  type:        { type: String, enum: ['full-time', 'contract', 'part-time'] },
  experience:  { type: String },
  description: { type: String },
  requirements:[String],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Job', JobSchema);
