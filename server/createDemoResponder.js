const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path based on where executed
require('dotenv').config();
const dns = require('dns');
if (dns.setServers) dns.setServers(['8.8.8.8', '8.8.4.4']);

const createResponderAccount = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshasetu');
        console.log("Connected to MongoDB completely.");

        // Clean any existing dummy responder to avoid unique constraint errors
        await User.deleteOne({ email: 'responder@rakshasetu.com' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('responder123', salt);

        const newResponder = new User({
            name: 'Priya Sharma - Field Responder',
            email: 'responder@rakshasetu.com',
            phone: '9998887771',
            password: passwordHash,
            role: 'field'
        });

        await newResponder.save();
        console.log("Successfully injected Field Responder into MongoDB!");
        console.log("Credentials -> Email: responder@rakshasetu.com | Password: responder123");
        
    } catch (err) {
        console.error("Failed to inject responder into MongoDB:", err);
    } finally {
        mongoose.connection.close();
    }
};

createResponderAccount();
