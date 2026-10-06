import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
  job:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  resume:      { type: String }, // file URL
  coverLetter: { type: String },
  status:      { type: String, enum: ['received', 'reviewing', 'shortlisted', 'rejected', 'hired'], default: 'received' },
}, { timestamps: true });

export default mongoose.model('JobApplication', JobApplicationSchema);
