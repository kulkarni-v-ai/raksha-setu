const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'raksha_setu';
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" created or already exists.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating database. Please check your MySQL credentials in .env file:', err.message);
    process.exit(1);
  }
}

init();