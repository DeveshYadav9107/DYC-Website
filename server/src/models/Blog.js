import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  excerpt:     { type: String },
  content:     { type: String, required: true },
  coverImage:  { type: String },
  category:    { type: String, enum: ['sap', 'erp', 'staffing', 'technology', 'digital-transformation', 'career', 'company'] },
  tags:        [String],
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  seo: {
    title:       { type: String },
    description: { type: String },
    keywords:    [String],
  },
}, { timestamps: true });

export default mongoose.model('Blog', BlogSchema);
