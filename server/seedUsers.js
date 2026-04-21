const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Render Database.');

    const users = [
      {
        name: 'Admin Control Panel',
        email: 'admin@rakshasetu.in',
        password: 'admin123',
        role: 'admin',
        phone: '9999999991'
      },
      {
        name: 'Pharmacy Management',
        email: 'pharmacy@rakshasetu.in',
        password: 'pharmacy123',
        role: 'pharmacy',
        phone: '9999999992'
      },
      {
        name: 'General User',
        email: 'divya@rakshasetu.in',
        password: 'password123',
        role: 'user',
        phone: '9999999993'
      }
    ];

    for (const u of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      
      const existing = await User.findOne({ email: u.email });
      if (existing) {
         existing.password = hashedPassword;
         existing.role = u.role;
         existing.name = u.name;
         await existing.save();
         console.log('Updated user:', u.email);
      } else {
         await User.create({
           ...u,
           password: hashedPassword
         });
         console.log('Created user:', u.email);
      }
    }
    
    console.log('Seed formatting complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seed();
