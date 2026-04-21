const Pharmacy = require('../models/Pharmacy');
const Demand = require('../models/Demand');

// Get current pharmacy profile
exports.getProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy profile not found.' });
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update pharmacy profile
exports.updateProfile = async (req, res) => {
  const { name, address, contact, coordinates, workingHours, coverageRadius } = req.body;
  try {
    let pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found.' });

    if (name) pharmacy.name = name;
    if (address) pharmacy.address = address;
    if (contact) pharmacy.contact = contact;
    if (workingHours) pharmacy.workingHours = workingHours;
    if (coverageRadius) pharmacy.coverageRadius = coverageRadius;
    if (coordinates) {
      pharmacy.location = { type: 'Point', coordinates }; // [lng, lat]
    }

    pharmacy.updateFrequency += 1;
    await pharmacy.save();
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    pharmacy.isOnline = !pharmacy.isOnline;
    await pharmacy.save();
    res.json({ isOnline: pharmacy.isOnline });
  } catch (err) {
    res.status(500).json({ error: 'Toggle failed' });
  }
};

// --- MEDICINE CRUD ---

exports.getMedicines = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    if (!pharmacy) return res.json([]);
    res.json(pharmacy.medicines || []);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
};

exports.addMedicine = async (req, res) => {
  const { name, quantity, price, availability } = req.body;
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    
    const existingIndex = pharmacy.medicines.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex > -1) {
      pharmacy.medicines[existingIndex].quantity = quantity;
      pharmacy.medicines[existingIndex].price = price;
      pharmacy.medicines[existingIndex].availability = availability;
    } else {
      pharmacy.medicines.push({ name, quantity, price, availability });
    }
    
    pharmacy.updateFrequency += 1;
    await pharmacy.save();

    // Mark as added in demand if it exists
    await Demand.findOneAndUpdate({ medicineName: name.toLowerCase() }, { isAdded: true });

    res.json(pharmacy.medicines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add medicine' });
  }
};

exports.deleteMedicine = async (req, res) => {
  const { name } = req.params;
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    pharmacy.medicines = pharmacy.medicines.filter(m => m.name !== name);
    pharmacy.updateFrequency += 1;
    await pharmacy.save();
    res.json({ message: 'Medicine removed', medicines: pharmacy.medicines });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

// --- ANALYTICS & DEMANDS ---

exports.getAnalytics = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user.id });
    const meds = pharmacy.medicines || [];
    
    const stats = {
      total: meds.length,
      available: meds.filter(m => m.availability === 'Available').length,
      outOfStock: meds.filter(m => m.availability === 'Out of Stock').length,
      lowStock: meds.filter(m => m.quantity > 0 && m.quantity < 5).length,
      updateFrequency: pharmacy.updateFrequency,
      profileScore: pharmacy.isVerified ? 100 : 70
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Analytics failed' });
  }
};

exports.getDemands = async (req, res) => {
  try {
    const demands = await Demand.find({ isAdded: false }).sort({ requestCount: -1 }).limit(5);
    res.json(demands);
  } catch (err) {
    res.status(500).json({ error: 'Demands failed' });
  }
};
