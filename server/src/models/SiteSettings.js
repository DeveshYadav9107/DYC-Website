import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  // Company identity
  companyName:    { type: String, default: 'DY&C' },
  companyTagline: { type: String, default: 'We help businesses run smarter with the right people and the right systems.' },
  logoUrl:        { type: String },
  faviconUrl:     { type: String },

  // Contact
  phone:          { type: String, default: '+91-9729037456' },
  email:          { type: String, default: 'info@dycinfo.com' },
  address:        { type: String, default: 'E-52A, Suncity, Gurgaon' },
  gst:            { type: String, default: '06AOZPY8747D1ZX' },
  mapEmbedUrl:    { type: String },

  // Social
  socialLinks: {
    linkedin: String,
    twitter:  String,
    facebook: String,
  },

  // SEO defaults
  seo: {
    defaultTitle:       { type: String, default: 'DY&C | SAP & ERP Solutions' },
    defaultDescription: { type: String, default: 'Enterprise SAP consulting, staffing solutions and custom ERP software.' },
    ogImage:            { type: String },
  },

  // Feature flags
  features: {
    showCareers:     { type: Boolean, default: false },
    showCaseStudies: { type: Boolean, default: false },
    showEcommerce:   { type: Boolean, default: false },
    showBlog:        { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model('SiteSettings', SiteSettingsSchema);
