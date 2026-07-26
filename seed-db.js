import 'dotenv/config';
import mongoose from 'mongoose';
import Admin from './api/models/Admin.js';
import MenuItem from './api/models/MenuItem.js';
import { menuData } from './src/menuData.js';
import { defaultSpecials } from './src/specialsData.js';

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable not found in .env file!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 1. Seed Admin
    const adminCount = await Admin.countDocuments({});
    if (adminCount === 0) {
      console.log('Seeding initial admin account (shatragnaasdf@gmail.com / Vishnu@143)...');
      await Admin.create({
        email: 'shatragnaasdf@gmail.com',
        password: 'Vishnu@143'
      });
      console.log('Admin seeded successfully!');
    } else {
      console.log('Admin account already exists in database.');
    }

    // 2. Seed Menu Items & Specials
    const menuCount = await MenuItem.countDocuments({});
    if (menuCount === 0) {
      console.log('Seeding initial menu items...');
      
      const itemsToSeed = [];

      // Add main menu items
      for (const item of menuData) {
        itemsToSeed.push({
          name: item.name,
          category: item.category,
          subCategory: item.type || '',
          description: item.description || '',
          price: Number(item.price) || 0,
          image: item.image,
          imagePublicId: 'placeholder_id',
          availability: true,
          featured: item.popular || false
        });
      }

      // Add specials
      for (const item of defaultSpecials) {
        itemsToSeed.push({
          name: item.name,
          category: 'specials',
          subCategory: item.type || '',
          description: item.description || '',
          price: 0,
          image: item.image,
          imagePublicId: 'placeholder_id',
          availability: true,
          featured: true,
          customPriceDisplay: item.price,
          tagText: item.tag || 'Chef Special',
          tagIcon: item.tagIcon || 'fa-fire'
        });
      }

      await MenuItem.insertMany(itemsToSeed);
      console.log(`Seeded ${itemsToSeed.length} menu items successfully!`);
    } else {
      console.log('Menu items already exist in database.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error.message);
    process.exit(1);
  }
};

seed();
