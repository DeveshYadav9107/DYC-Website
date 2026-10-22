import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'dyc_jwt_secret_dev_key_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  EMAIL_HOST: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || process.env.SMTP_USER || 'deveshrao130@gmail.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || 'pjufigganibdzkqy',
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_FROM || `Dinesh Yadav & Company <${process.env.EMAIL_USER || 'deveshrao130@gmail.com'}>`,
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true' || parseInt(process.env.EMAIL_PORT || '587', 10) === 465,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
};

export default env;

