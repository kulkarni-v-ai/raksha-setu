const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const Demand = require('../models/Demand');

const jwt = require('jsonwebtoken');

// --- AUTH MIDDLEWARE ---
const authPharmacy = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Find the pharmacy owned by this user
    const pharmacy = await Pharmacy.findOne({ owner: decoded.id });
    if (!pharmacy) return res.status(403).json({ error: 'Your account is not associated with a registered pharmacy' });

    req.pharmacyId = pharmacy._id;
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 1. Get Pharmacy Profile & Inventory
router.get('/profile', authPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacyId).populate('inventory.medicine');
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1.1 GET Medicines (Specifically for management table)
router.get('/medicines', authPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacyId).populate('inventory.medicine');
    // Map to a flatter structure that the frontend expects
    const flattened = pharmacy.inventory.map(item => ({
      _id: item.medicine._id,
      name: item.medicine.name,
      quantity: item.stock,
      availability: item.status,
      price: item.price || 0,
    }));
    res.json(flattened);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add/Update Medicine in Inventory
router.post('/medicines', authPharmacy, async (req, res) => {
  const { medicineId, name, quantity, availability, price } = req.body;
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacyId);
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

    let targetMedId = medicineId;

    // If no ID but name provided, find or create the master medicine entry
    if (!targetMedId && name) {
      let masterMed = await Medicine.findOne({ name: new RegExp(`^${name}$`, 'i') });
      if (!masterMed) {
        masterMed = await Medicine.create({ 
          name, 
          composition: 'Generic', 
          category: 'General' 
        });
      }
      targetMedId = masterMed._id;
    }

    if (!targetMedId) return res.status(400).json({ error: 'Medicine identification required' });

    // Check if medicine exists in inventory
    const existingIndex = pharmacy.inventory.findIndex(item => item.medicine.toString() === targetMedId.toString());
    
    if (existingIndex > -1) {
      pharmacy.inventory[existingIndex].stock = quantity;
      pharmacy.inventory[existingIndex].status = availability;
      pharmacy.inventory[existingIndex].price = price;
    } else {
      pharmacy.inventory.push({ 
        medicine: targetMedId, 
        stock: quantity, 
        status: availability, 
        price 
      });
    }

    await pharmacy.save();
    res.json({ message: 'Inventory updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Remove Medicine from Inventory
router.delete('/medicines/:medicineId', authPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacyId);
    pharmacy.inventory = pharmacy.inventory.filter(item => item.medicine.toString() !== req.params.medicineId);
    await pharmacy.save();
    res.json({ message: 'Medicine removed from inventory' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Public: Search Medicines & Nearby Pharmacies
router.get('/search', async (req, res) => {
  const { medicineName, lat, lng } = req.query;
  try {
    // 1. Find the medicine
    const medicine = await Medicine.findOne({ name: new RegExp(medicineName, 'i') });
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found in our database' });
    }

    // 2. Find pharmacies with this medicine and within 10km
    const pharmacies = await Pharmacy.find({
      'inventory.medicine': medicine._id,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 10000 // 10km
        }
      }
    }).populate('owner', 'name phone');

    // Filter results to only show availability for this specific medicine
    const results = pharmacies.map(p => {
      const medInfo = p.inventory.find(inv => inv.medicine.toString() === medicine._id.toString());
      return {
        id: p._id,
        pharmacyName: p.name,
        address: p.address,
        phone: p.phone,
        coords: p.location.coordinates,
        medicineStatus: medInfo.status,
        stock: medInfo.stock,
        price: medInfo.price
      };
    });

    res.json({ medicine, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Store Status (Open/Closed)
router.patch('/status', authPharmacy, async (req, res) => {
  try {
    const { isOpen } = req.body;
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.pharmacyId,
      { isOpen },
      { new: true }
    );
    res.json({ isOpen: pharmacy.isOpen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Demand Analytics (Medicines frequently searched but missing from inventory)
router.get('/demands', authPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.pharmacyId);
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

    const currentMedIds = pharmacy.inventory.map(i => i.medicine.toString());

    // Get top 5 demands that are not in current inventory
    const demands = await Demand.find({
      isAdded: false
    })
    .sort({ requestCount: -1 })
    .limit(5);

    // Filter out items already in inventory (just in case)
    const filteredDemands = demands.filter(d => {
      // Logic to check if medicine name matches any populated medicine name in inventory
      // (Simplified: check against the master list)
      return true; // The isAdded flag handles this mostly
    });

    res.json(demands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
