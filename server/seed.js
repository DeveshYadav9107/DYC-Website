import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    // 1. Default seed admin
    const defaultAdminEmail = 'admin@dycinfo.com';
    let admin = await User.findOne({ email: defaultAdminEmail });

    if (!admin) {
      await User.create({
        name: 'DYC Admin',
        email: defaultAdminEmail,
        password: 'password123',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
      console.log(`✅ Seeded default admin: ${defaultAdminEmail} (password: password123)`);
    } else {
      admin.role = 'admin';
      admin.isActive = true;
      admin.isEmailVerified = true;
      await admin.save();
      console.log(`ℹ️ Admin user verified: ${defaultAdminEmail} (Role: admin, Active: true)`);
    }

    // 2. Also promote owner account (from EMAIL_USER in .env) to admin if present
    const ownerEmail = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim().toLowerCase() : null;
    if (ownerEmail) {
      const ownerUser = await User.findOne({ email: ownerEmail });
      if (ownerUser) {
        ownerUser.role = 'admin';
        ownerUser.isActive = true;
        ownerUser.isEmailVerified = true;
        await ownerUser.save();
        console.log(`👑 Owner account (${ownerEmail}) is set to 'admin' role!`);
      }
    }

    console.log('\n✨ Database ready! You can log in at: http://localhost:5173/admin/login');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();
