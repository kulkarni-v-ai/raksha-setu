const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');
const Pharmacy = require('./models/Pharmacy');
const User = require('./models/User');
require('dotenv').config();

const dns = require('dns');
if (dns.setServers) { dns.setServers(['8.8.8.8', '8.8.4.4']); }

const seedPharmacy = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Create Master Medicines
    await Medicine.deleteMany({});
    const baseMeds = await Medicine.insertMany([
      { name: 'Paracetamol 500mg', composition: 'Antipyretic', category: 'General' },
      { name: 'Amoxicillin 250mg', composition: 'Antibiotic', category: 'Antibiotics' },
      { name: 'Dolo 650', composition: 'Paracetamol', category: 'General' },
      { name: 'Asthalin Inhaler', composition: 'Salbutamol', category: 'Emergency' }
    ]);
    console.log('Master medicines seeded.');

    // 2. Clear Existing Pharmacies
    await Pharmacy.deleteMany({});

    // 3. Find Pharmacy Owner
    const owner = await User.findOne({ email: 'pharmacy@rakshasetu.in' });
    if (!owner) {
      console.error('Pharmacy owner not found. Run seed-users.js first.');
      process.exit(1);
    }

    // 4. Create Pharmacy Profile
    const apollo = new Pharmacy({
      owner: owner._id,
      name: 'Apollo Pharmacy Central',
      phone: '011-23456789',
      address: 'Connaught Place, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2167, 28.6315] // [lng, lat]
      },
      inventory: [
        { medicine: baseMeds[0]._id, stock: 150, status: 'Available', price: 15 },
        { medicine: baseMeds[2]._id, stock: 50, status: 'Available', price: 30 },
        { medicine: baseMeds[3]._id, stock: 5, status: 'Limited Stock', price: 120 }
      ]
    });

    await apollo.save();
    console.log('Pharmacy profile and inventory seeded.');
    console.log('---------------------------');
    console.log('Pharmacy ID for Dev Headers:', apollo._id);
    console.log('---------------------------');

    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedPharmacy();
