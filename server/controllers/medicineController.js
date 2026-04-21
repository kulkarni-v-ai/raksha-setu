const db = require('../config/db');

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

exports.search = async (req, res) => {
    try {
        const { name, lat, lng } = req.query;
        if(!name) return res.status(400).json({success:false, message: 'Missing substring origin search limits'});
        
        let uLat = lat ? parseFloat(lat) : null;
        let uLng = lng ? parseFloat(lng) : null;

        const sql = `
            SELECT m.name as medicine_name, m.composition, pm.stock, p.name as pharmacy_name, p.location_lat as ph_lat, p.location_lng as ph_lng
            FROM medicines m
            INNER JOIN pharmacy_medicines pm ON m.id = pm.medicine_id
            INNER JOIN pharmacies p ON pm.pharmacy_id = p.id
            WHERE m.name LIKE ? AND pm.stock > 0
        `;
        const [rows] = await db.execute(sql, [`%${name}%`]);

        let results = rows;
        if(uLat && uLng) {
            results = rows.map(r => {
                const dist = calculateDistance(uLat, uLng, parseFloat(r.ph_lat), parseFloat(r.ph_lng));
                return { ...r, distance: dist };
            }).sort((a,b) => a.distance - b.distance);
        }

        res.status(200).json({ success: true, data: results });
    } catch(e) {
        console.error("Medicine search processing boundary fault:", e);
        res.status(500).json({ success: false, message: 'Node Server Limit Trap Error' });
    }
};
