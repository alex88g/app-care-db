const mysql = require('mysql2/promise'); // 👈 viktigt!
require('dotenv').config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.getConnection()
  .then(() => console.log('✅ MySQL connected!'))
  .catch(err => console.error('❌ MySQL connection error:', err.message));

module.exports = pool;
