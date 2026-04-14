const Pharmacy = require('../models/Pharmacy');
const Demand = require('../models/Demand');
const Medicine = require('../models/Medicine');

// Distance calculation helper
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaPhi = (lat2 - lat1) * rad;
  const deltaLambda = (lon2 - lon1) * rad;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

const alternativesMap = {
  'paracetamol': ['Calpol 500', 'Dolo 650', 'Crocin'],
  'ibuprofen': ['Advil', 'Motrin', 'Brufen'],
  'aspirin': ['Disprin', 'EcoSprin'],
  'amoxicillin': ['Augmentin', 'Mox'],
  'cetirizine': ['Okacet', 'Zyrtec'],
  'dolo': ['Paracetamol', 'Calpol'],
  'calpol': ['Dolo 650', 'Paracetamol']
};

exports.searchMedicines = async (req, res) => {
  const { name, lat, lng } = req.query;
  if (!name) return res.status(400).json({ error: 'Medicine name required.' });

  const uLat = lat ? parseFloat(lat) : null;
  const uLng = lng ? parseFloat(lng) : null;

  try {
    // 1. Find the medicine in the master database first
    const medicine = await Medicine.findOne({ name: new RegExp(name, 'i') });
    
    let pharmacies = [];
    
    if (medicine) {
      // 2. Find pharmacies with this medicine available
      let query = {
        'inventory.medicine': medicine._id,
        'inventory.status': { $ne: 'Out of Stock' }
      };
      
      pharmacies = await Pharmacy.find(query).populate('inventory.medicine');
    }

    // 3. Format results with distance
    let results = pharmacies.map(ph => {
      // Find the specific item in the pharmacy's inventory
      const item = ph.inventory.find(i => 
        i.medicine && i.medicine._id.toString() === medicine._id.toString()
      );
      
      if (!item) return null;

      let dist = null;
      if (uLat !== null && uLng !== null && ph.location && ph.location.coordinates) {
        dist = calculateDistance(uLat, uLng, ph.location.coordinates[1], ph.location.coordinates[0]);
      }

      return {
        id: ph._id,
        pharmacyName: ph.name,
        address: ph.address,
        phone: ph.contact || ph.phone,
        medicine: item.medicine.name,
        stock: item.status,
        price: item.price ? `₹${item.price}` : 'N/A',
        distance: dist !== null ? (dist / 1000).toFixed(1) + 'km' : 'N/A',
        distValue: dist || 9999999
      };
    }).filter(r => r !== null).sort((a, b) => a.distValue - b.distValue);

    // 4. Smart Alternatives if no results found
    let suggestions = [];
    if (results.length === 0) {
      // LOG DEMAND
      try {
        await Demand.findOneAndUpdate(
          { medicineName: name.toLowerCase() },
          { $inc: { requestCount: 1 }, lastRequested: new Date() },
          { upsert: true, new: true }
        );
      } catch (logErr) {}

      const lowerName = name.toLowerCase();
      for (const [key, alts] of Object.entries(alternativesMap)) {
        if (lowerName.includes(key) || alts.some(a => lowerName.includes(a.toLowerCase()))) {
          suggestions = alts.filter(a => a.toLowerCase() !== lowerName);
          break;
        }
      }
    }

    res.json({ results, suggestions });
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).json({ error: 'Internal search engine error' });
  }
};
