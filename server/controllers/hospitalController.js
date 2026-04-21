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

    // --- 1. OpenStreetMap Overpass API (Primary) ---
    let overpassHospitals = [];
    try {
      const radius = 15000; // 15km
      const query = `[out:json];(node["amenity"="hospital"](around:${radius},${uLat},${uLng});way["amenity"="hospital"](around:${radius},${uLat},${uLng});relation["amenity"="hospital"](around:${radius},${uLat},${uLng}););out center 20;`;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();

      overpassHospitals = data.elements.map(el => {
        const pLat = el.lat || el.center?.lat;
        const pLng = el.lon || el.center?.lon;
        const dist = calculateDistance(uLat, uLng, pLat, pLng);
        return {
          _id: el.id.toString(),
          name: el.tags?.name || 'Hospital',
          address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Unknown Address',
          contact: el.tags?.phone || el.tags?.['contact:phone'] || 'N/A',
          emergencyStatus: 'Active',
          specialities: ['General', 'Emergency'],
          location: { type: 'Point', coordinates: [pLng, pLat] },
          distance: (dist / 1000).toFixed(1) + 'km',
          coords: { lat: pLat, lng: pLng }
        };
      });
    } catch (apiErr) {
      console.error('Overpass API error:', apiErr.message);
    }

    // --- 2. Also fetch local DB hospitals ---
    let localHospitals = [];
    try {
      localHospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [uLng, uLat] },
            $maxDistance: 15000
          }
        }
      });

      localHospitals = localHospitals.map(h => {
        const dist = calculateDistance(uLat, uLng, h.location.coordinates[1], h.location.coordinates[0]);
        return {
          ...h.toObject(),
          distance: (dist / 1000).toFixed(1) + 'km',
          coords: { lat: h.location.coordinates[1], lng: h.location.coordinates[0] }
        };
      });
    } catch (dbErr) {
      // No 2dsphere index or empty DB, ignore
    }

    // --- 3. Merge, deduplicate, sort ---
    const combined = [...overpassHospitals, ...localHospitals]
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    const unique = [];
    const names = new Set();
    for (const h of combined) {
      const key = h.name?.toLowerCase().replace(/\s+/g, '');
      if (!names.has(key)) {
        names.add(key);
        unique.push(h);
      }
    }

    res.json(unique.slice(0, 50));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const { name, address, contact, lat, lng, specialities, totalBeds } = req.body;
    const hospital = await Hospital.create({
      name, address, contact,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      specialities: specialities || [],
      totalBeds: totalBeds || 0,
      availableBeds: totalBeds || 0
    });
    res.status(201).json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
