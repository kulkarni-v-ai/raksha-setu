const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Fix for querySrv ECONNREFUSED in certain network environments
if (dns.setServers) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rakshasetu');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
