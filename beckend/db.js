const mysql = require('mysql2');
require('dotenv').config();

// Anslut till Railway MySQL via fullständig URL
const pool = mysql.createPool(process.env.DATABASE_URL);

// Exportera connection poolen som Promise API
module.exports = pool.promise();
