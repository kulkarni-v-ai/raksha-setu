require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const Hospital = require('./models/Hospital');
const SosAlert = require('./models/SosAlert');
const Demand = require('./models/Demand');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshasetu');
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing all existing data...');
    await Promise.all([
      User.deleteMany({}),
      Pharmacy.deleteMany({}),
      Medicine.deleteMany({}),
      Hospital.deleteMany({}),
      SosAlert.deleteMany({}),
      Demand.deleteMany({})
    ]);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    console.log('👥 Creating users...');
    const adminUser = await User.create({ name: 'Admin', email: 'admin@rakshasetu.in', phone: '9999999999', password: hash, role: 'admin' });
    const normalUser = await User.create({ name: 'Ramesh Kumar', email: 'ramesh@gmail.com', phone: '9888888888', password: hash, role: 'user' });
    const responderUser = await User.create({ name: 'Priya Medic', email: 'priya@medic.in', phone: '9777777777', password: hash, role: 'responder' });
    const pharmacyUser1 = await User.create({ name: 'Apollo Pharmacy', email: 'apollo@rakshasetu.in', phone: '9666666666', password: hash, role: 'pharmacy' });
    const pharmacyUser2 = await User.create({ name: 'MedPlus Store', email: 'medplus@rakshasetu.in', phone: '9555555555', password: hash, role: 'pharmacy' });

    console.log('🏥 Creating hospitals...');
    const hospitals = await Hospital.create([
      { name: 'AIIMS Delhi', address: 'Ansari Nagar, New Delhi', phone: '011-26588500', emergencyStatus: 'Active', location: { type: 'Point', coordinates: [77.2090, 28.5659] }, specialties: ['Trauma', 'Cardiology', 'Neurology'], isVerified: true },
      { name: 'Max Super Speciality', address: 'Saket, New Delhi', phone: '011-26515050', emergencyStatus: 'Crowded', location: { type: 'Point', coordinates: [77.2115, 28.5273] }, specialties: ['Oncology', 'Emergency'], isVerified: true },
      { name: 'Fortis Escorts', address: 'Okhla, New Delhi', phone: '011-47135000', emergencyStatus: 'Active', location: { type: 'Point', coordinates: [77.2796, 28.5601] }, specialties: ['Cardiology'], isVerified: true },
      { name: 'Safdarjung Hospital', address: 'Ring Road, New Delhi', phone: '011-26165060', emergencyStatus: 'Active', location: { type: 'Point', coordinates: [77.2057, 28.5684] }, specialties: ['Burns', 'Trauma'], isVerified: true },
      { name: 'Manipal Hospital', address: 'Dwarka, New Delhi', phone: '011-49666666', emergencyStatus: 'Active', location: { type: 'Point', coordinates: [77.0628, 28.5910] }, specialties: ['Emergency', 'Pediatrics'], isVerified: true },
    ]);

    console.log('💊 Creating master medicines...');
    const medicineDocs = await Medicine.create([
      { name: 'Paracetamol 500mg', composition: 'Paracetamol', category: 'General' },
      { name: 'Amoxicillin 500mg', composition: 'Amoxicillin', category: 'Antibiotics' },
      { name: 'Dolo 650mg', composition: 'Paracetamol', category: 'General' },
      { name: 'Crocin Advance', composition: 'Paracetamol', category: 'General' },
      { name: 'Azithromycin 250mg', composition: 'Azithromycin', category: 'Antibiotics' },
      { name: 'Cetirizine 10mg', composition: 'Cetirizine', category: 'General' },
      { name: 'Ibuprofen 400mg', composition: 'Ibuprofen', category: 'General' },
      { name: 'Remdesivir 100mg', composition: 'Remdesivir', category: 'Emergency' },
      { name: 'Vitamin D3 60K', composition: 'Cholecalciferol', category: 'Other' },
      { name: 'Aspirin 75mg', composition: 'Aspirin', category: 'Cardiology' },
      { name: 'Ecosprin 150mg', composition: 'Aspirin', category: 'Cardiology' },
      { name: 'Atorvastatin 10mg', composition: 'Atorvastatin', category: 'Cardiology' },
      { name: 'Metformin 500mg', composition: 'Metformin', category: 'Other' },
      { name: 'Pantoprazole 40mg', composition: 'Pantoprazole', category: 'Other' },
      { name: 'Ondansetron 4mg', composition: 'Ondansetron', category: 'Emergency' },
      { name: 'Deriphyllin', composition: 'Etofylline & Theophylline', category: 'Other' },
      { name: 'Montelukast 10mg', composition: 'Montelukast', category: 'Other' },
      { name: 'Avil 25mg', composition: 'Pheniramine', category: 'Emergency' },
      { name: 'Digene', composition: 'Antacid', category: 'General' },
    ]);

    console.log('🏪 Creating pharmacies & inventory...');
    await Pharmacy.create({
      owner: pharmacyUser1._id,
      name: 'Apollo Pharmacy Saket',
      phone: '9666666666',
      address: 'Select Citywalk, Saket',
      location: { type: 'Point', coordinates: [77.2185, 28.5283] }, // near max
      inventory: [
        { medicine: medicineDocs[0]._id, stock: 100, status: 'Available', price: 15 },
        { medicine: medicineDocs[2]._id, stock: 50, status: 'Available', price: 30 },
        { medicine: medicineDocs[7]._id, stock: 2, status: 'Limited Stock', price: 2500 }, // Remdesivir
        { medicine: medicineDocs[6]._id, stock: 0, status: 'Out of Stock', price: 20 },
      ]
    });

    await Pharmacy.create({
      owner: pharmacyUser2._id,
      name: 'MedPlus AIIMS',
      phone: '9555555555',
      address: 'Yusuf Sarai, Near AIIMS',
      location: { type: 'Point', coordinates: [77.2070, 28.5609] }, // near aiims
      inventory: [
        { medicine: medicineDocs[1]._id, stock: 200, status: 'Available', price: 80 },
        { medicine: medicineDocs[4]._id, stock: 150, status: 'Available', price: 120 },
        { medicine: medicineDocs[14]._id, stock: 20, status: 'Available', price: 40 }, // Ondansetron
        { medicine: medicineDocs[10]._id, stock: 5, status: 'Limited Stock', price: 18 }, // Ecosprin
        { medicine: medicineDocs[6]._id, stock: 50, status: 'Available', price: 22 }, // Ibuprofen is here!
      ]
    });

    console.log('🚨 Creating mock active SOS alerts...');
    await SosAlert.create({
      user: normalUser._id,
      location: { type: 'Point', coordinates: [77.2100, 28.5300] },
      status: 'active'
    });

    console.log('✅ Full Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
