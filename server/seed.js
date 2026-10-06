import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@dycinfo.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'DYC Admin',
        email: 'admin@dycinfo.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user seeded successfully!');
    } else {
      console.log('Admin user already exists.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();
