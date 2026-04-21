const User = require('../models/User');

// Node-side native Haversine Geometric Math Processing limiting explicit bounds
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in exact meters
    const rad = Math.PI / 180;
    const phi1 = lat1 * rad;
    const phi2 = lat2 * rad;
    const deltaPhi = (lat2 - lat1) * rad;
    const deltaLambda = (lon2 - lon1) * rad;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

exports.getNearby = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if(!lat || !lng) return res.status(400).json({success:false, message:'Missing origin vector.'});

        const uLat = parseFloat(lat);
        const uLng = parseFloat(lng);

        // Find all responder-role users with location data using Mongoose
        const responders = await User.find({
            role: { $in: ['responder', 'field'] },
            location_lat: { $ne: null }
        }).select('name phone location_lat location_lng');

        // Array filter strictly culling limits over exactly 2km mathematically
        const nearby = responders.map(r => {
            const rLat = parseFloat(r.location_lat);
            const rLng = parseFloat(r.location_lng);
            const staticDist = calculateDistance(uLat, uLng, rLat, rLng);
            return { 
                id: r._id, 
                name: r.name, 
                phone: r.phone, 
                lat: rLat, 
                lng: rLng, 
                distance: staticDist 
            };
        }).filter(r => r.distance <= 2000)
          .sort((a,b) => a.distance - b.distance)
          .slice(0, 5); // Bounded strictly to Top 5 natively safely

        res.status(200).json({ success: true, data: nearby });

    } catch (e) {
        console.error("Responder backend geometry fault:", e);
        res.status(500).json({ success: false, message: 'Server boundary fault' });
    }
};
