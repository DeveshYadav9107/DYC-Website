import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  logo:        { type: String },
  website:     { type: String },
  industry:    { type: String },
  isApproved:  { type: Boolean, default: false }, // Requires client approval
  isPublished: { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Client', ClientSchema);
