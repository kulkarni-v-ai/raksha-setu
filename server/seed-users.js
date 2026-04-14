const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

// Fix for querySrv ECONNREFUSED issues
if (dns.setServers) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const User = require('./models/User');

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    // Clear existing test users to avoid duplicates
    await User.deleteMany({ email: { $in: ['admin@rakshasetu.in', 'divya@rakshasetu.in'] } });
    console.log('Existing target users cleared.');

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Master Admin',
      email: 'admin@rakshasetu.in',
      phone: '9999999999',
      password: adminPassword,
      role: 'admin'
    });

    // 2. Create Standard User
    const userPassword = await bcrypt.hash('password123', 10);
    const standardUser = new User({
      name: 'Divya Resident',
      email: 'divya@rakshasetu.in',
      phone: '8888888888',
      password: userPassword,
      role: 'user'
    });

    // 3. Create Pharmacy User
    const pharmPassword = await bcrypt.hash('pharmacy123', 10);
    const pharmUser = new User({
      name: 'Apollo Pharmacy Owner',
      email: 'pharmacy@rakshasetu.in',
      phone: '7777777777',
      password: pharmPassword,
      role: 'pharmacy'
    });

    await User.insertMany([adminUser, standardUser, pharmUser]);
    console.log('Database seeded successfully!');
    console.log('---------------------------');
    console.log('Admin Account: admin@rakshasetu.in / admin123');
    console.log('User Account:  divya@rakshasetu.in / password123');
    console.log('Pharm Account: pharmacy@rakshasetu.in / pharmacy123');
    console.log('---------------------------');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
