/**
 * Seed Script: Add 15 realistic medicines to the pharmacy's inventory.
 * Run with: node server/seedMedicines.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const User = require('./models/User');

const MEDICINES = [
  { name: 'Paracetamol 500mg',    category: 'Analgesic',      stock: 250, price: 12,  status: 'Available'     },
  { name: 'Amoxicillin 500mg',    category: 'Antibiotic',     stock: 80,  price: 85,  status: 'Available'     },
  { name: 'Dolo 650mg',           category: 'Antipyretic',    stock: 320, price: 30,  status: 'Available'     },
  { name: 'Crocin Advance',       category: 'Analgesic',      stock: 4,   price: 28,  status: 'Limited Stock' },
  { name: 'Azithromycin 250mg',   category: 'Antibiotic',     stock: 45,  price: 110, status: 'Available'     },
  { name: 'Metformin 500mg',      category: 'Antidiabetic',   stock: 120, price: 18,  status: 'Available'     },
  { name: 'Atorvastatin 10mg',    category: 'Cardiovascular', stock: 90,  price: 55,  status: 'Available'     },
  { name: 'Pantoprazole 40mg',    category: 'GI',             stock: 3,   price: 42,  status: 'Limited Stock' },
  { name: 'Cetirizine 10mg',      category: 'Antihistamine',  stock: 200, price: 8,   status: 'Available'     },
  { name: 'Omeprazole 20mg',      category: 'GI',             stock: 75,  price: 35,  status: 'Available'     },
  { name: 'Ibuprofen 400mg',      category: 'NSAID',          stock: 0,   price: 22,  status: 'Out of Stock'  },
  { name: 'Losartan 50mg',        category: 'Cardiovascular', stock: 60,  price: 65,  status: 'Available'     },
  { name: 'Remdesivir 100mg',     category: 'Antiviral',      stock: 2,   price: 899, status: 'Limited Stock' },
  { name: 'Vitamin D3 60K IU',   category: 'Supplement',     stock: 150, price: 95,  status: 'Available'     },
  { name: 'Montelukast 10mg',     category: 'Respiratory',    stock: 0,   price: 48,  status: 'Out of Stock'  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshasetu');
    console.log('✅ Connected to MongoDB');

    // Find the pharmacy user
    const user = await User.findOne({ email: 'pharmacy@rakshasetu.in' });
    if (!user) {
      console.error('❌ Pharmacy user not found. Make sure pharmacy@rakshasetu.in exists.');
      process.exit(1);
    }

    const pharmacy = await Pharmacy.findOne({ owner: user._id });
    if (!pharmacy) {
      console.error('❌ Pharmacy profile not found for that user.');
      process.exit(1);
    }

    // Clear existing inventory
    pharmacy.inventory = [];
    console.log('🗑️  Cleared existing inventory');

    // Add each medicine
    for (const med of MEDICINES) {
      let masterMed = await Medicine.findOne({ name: new RegExp(`^${med.name}$`, 'i') });
      if (!masterMed) {
        masterMed = await Medicine.create({
          name: med.name,
          composition: 'Generic Composition',
          category: med.category,
        });
        console.log(`  ➕ Created master medicine: ${med.name}`);
      } else {
        console.log(`  ♻️  Found existing medicine: ${med.name}`);
      }

      pharmacy.inventory.push({
        medicine: masterMed._id,
        stock: med.stock,
        status: med.status,
        price: med.price,
      });
    }

    await pharmacy.save();
    console.log(`\n✅ Successfully seeded ${MEDICINES.length} medicines to "${pharmacy.name}"!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
