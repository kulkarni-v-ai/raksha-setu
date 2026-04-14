require('dotenv').config();
const db = require('./config/db');

async function seed() {
    try {
        console.log("Seeding fake responders...");
        const queries = [
            `INSERT INTO users (name, email, phone, password, role, location_lat, location_lng) VALUES ('Dr. Ravi Sharma', 'ravi@em.org', '111111', 'hash', 'responder', 28.614, 77.210) ON DUPLICATE KEY UPDATE role='responder'`,
            `INSERT INTO users (name, email, phone, password, role, location_lat, location_lng) VALUES ('Apollo Ambulance 4', 'amb4@apollo.com', '222222', 'hash', 'responder', 28.615, 77.208) ON DUPLICATE KEY UPDATE role='responder'`,
            `INSERT INTO users (name, email, phone, password, role, location_lat, location_lng) VALUES ('Medic Anita', 'anita@em.org', '333333', 'hash', 'responder', 28.620, 77.215) ON DUPLICATE KEY UPDATE role='responder'`,
            `INSERT INTO users (name, email, phone, password, role, location_lat, location_lng) VALUES ('City Hospital Unit', 'chu@hospital.in', '444444', 'hash', 'responder', 28.610, 77.200) ON DUPLICATE KEY UPDATE role='responder'`,
            `INSERT INTO users (name, email, phone, password, role, location_lat, location_lng) VALUES ('Dr. Sanjay (Off-Duty)', 'sanjay@em.org', '555555', 'hash', 'responder', 28.611, 77.211) ON DUPLICATE KEY UPDATE role='responder'`,
            `INSERT INTO users (name, email, phone, password, role, location_lat, location_lng) VALUES ('Far Medic (Ignore)', 'far@em.org', '666666', 'hash', 'responder', 28.911, 77.911) ON DUPLICATE KEY UPDATE role='responder'`
        ];
        for(let q of queries) {
            await db.execute(q);
        }
        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch(e) {
        console.error("Seed error", e);
        process.exit(1);
    }
}
seed();
