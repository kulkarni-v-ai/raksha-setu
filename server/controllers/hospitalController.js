const Hospital = require('../models/Hospital');

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

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({});
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNearby = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      const hospitals = await Hospital.find({});
      return res.json(hospitals);
    }

    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);

    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [uLng, uLat] },
          $maxDistance: 15000 // 15km
        }
      }
    });
    
    // add distance field for frontend
    const results = hospitals.map(h => {
        let dist = calculateDistance(uLat, uLng, h.location.coordinates[1], h.location.coordinates[0]);
        return {
            ...h.toObject(),
            distance: (dist / 1000).toFixed(1) + 'km',
            coords: { lat: h.location.coordinates[1], lng: h.location.coordinates[0] }
        };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const { name, address, phone, lat, lng, specialties } = req.body;
    const hospital = await Hospital.create({
      name, address, phone,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      specialties: specialties || []
    });
    res.status(201).json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
