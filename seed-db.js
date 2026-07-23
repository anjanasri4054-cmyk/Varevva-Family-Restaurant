import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './api/models/Admin.js';

dotenv.config();

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable not found in .env file!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const adminCount = await Admin.countDocuments({});
    if (adminCount > 0) {
      console.log('Admin account already exists in database.');
      process.exit(0);
    }

    console.log('Seeding initial admin account (shatragnaasdf@gmail.com / Vishnu@143)...');
    await Admin.create({
      email: 'shatragnaasdf@gmail.com',
      password: 'Vishnu@143'
    });

    console.log('Admin seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  }
};

seed();
