require('dotenv').config();
const db = require('./config/db');

async function seed() {
    try {
        console.log("Seeding fake pharmacies & medicines array limits...");
        
        // Disable cascading securely for multiple sequential mappings if required natively bounds
        const pharmacies = [
            `INSERT INTO pharmacies (name, location_lat, location_lng) VALUES ('Apollo Pharmacy', 28.614, 77.209)`,
            `INSERT INTO pharmacies (name, location_lat, location_lng) VALUES ('Sanjeevani Medicos', 28.611, 77.215)`,
            `INSERT INTO pharmacies (name, location_lat, location_lng) VALUES ('Wellness Forever', 28.620, 77.200)`
        ];
        for(let p of pharmacies) await db.execute(p);

        const meds = [
            `INSERT INTO medicines (name, composition) VALUES ('Paracetamol 500mg', 'Antipyretic, Analgesic')`,
            `INSERT INTO medicines (name, composition) VALUES ('Amoxicillin 250mg', 'Antibiotic')`,
            `INSERT INTO medicines (name, composition) VALUES ('Dolo 650', 'Paracetamol')`,
            `INSERT INTO medicines (name, composition) VALUES ('Insulin Glargine', 'Insulin')`,
            `INSERT INTO medicines (name, composition) VALUES ('Asthalin Inhaler', 'Salbutamol')`
        ];
        for(let m of meds) await db.execute(m);

        const links = [
            `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock) VALUES (1, 1, 150)`,
            `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock) VALUES (1, 3, 50)`,
            `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock) VALUES (2, 2, 25)`,
            `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock) VALUES (2, 5, 10)`,
            `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock) VALUES (3, 1, 30)`,
            `INSERT INTO pharmacy_medicines (pharmacy_id, medicine_id, stock) VALUES (3, 4, 5)`
        ];
        for(let l of links) await db.execute(l);

        console.log("Pharmacy Seed Completed natively.");
        process.exit(0);
    } catch(e) {
        console.error("Dependency error parsing arrays natively: ", e);
        process.exit(1);
    }
}
seed();
