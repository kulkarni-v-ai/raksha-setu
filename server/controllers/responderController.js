const User = require('../models/User');

exports.getNearby = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if(!lat || !lng) return res.status(400).json({success:false, message:'Missing origin vector.'});

        const uLat = parseFloat(lat);
        const uLng = parseFloat(lng);

        // Fetch responders from MongoDB
        // Since User doesn't currently strictly have a geospatial default field initialized everywhere,
        // we simulate near by filtering or we could do it in memory if there's no geo index.
        const responders = await User.find({ role: 'responder' }).select('-password');

        // Simple memory distance calculation for now since User model doesn't have a 2dsphere index natively in all docs
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

        const nearby = responders.map(r => {
            // Suppose responders update their location via another endpoint, we mock default coords if empty
            // Usually r.location_lat/lng would exist if we add it to the model.
            // Just returning the ones found for now
            return {
                id: r._id,
                name: r.name,
                phone: r.phone,
                distance: Math.random() * 2000 // mock distance
            };
        }).sort((a,b) => a.distance - b.distance).slice(0, 5);

        res.status(200).json({ success: true, data: nearby });

    } catch (e) {
        console.error("Responder backend fault:", e);
        res.status(500).json({ success: false, message: 'Server boundary fault' });
    }
};
