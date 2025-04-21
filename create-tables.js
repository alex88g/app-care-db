const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    const sql = `
      CREATE TABLE IF NOT EXISTS Patients (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        ssn VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE
      ) ENGINE=InnoDB CHARACTER SET utf8mb4;

      CREATE TABLE IF NOT EXISTS Doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        ssn VARCHAR(12),
        code VARCHAR(10) NOT NULL UNIQUE
      ) ENGINE=InnoDB CHARACTER SET utf8mb4;

      CREATE TABLE IF NOT EXISTS Bookings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        meetingLink TEXT NOT NULL,
        patient_id BIGINT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARACTER SET utf8mb4;

      CREATE TABLE IF NOT EXISTS OTPs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL UNIQUE,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL
      ) ENGINE=InnoDB CHARACTER SET utf8mb4;

      CREATE TABLE IF NOT EXISTS ChatMessages (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        patient_id BIGINT NOT NULL,
        sender ENUM('user', 'chatgpt') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB CHARACTER SET utf8mb4;

      INSERT INTO Doctors (name, phone, ssn, code)
      VALUES ('Dr. Admin', '0700000000', '190001019999', '123456')
      ON DUPLICATE KEY UPDATE code = '123456';
    `;

    const statements = sql.split(";").map(s => s.trim()).filter(Boolean);

    for (const stmt of statements) {
      await connection.query(stmt);
    }

    console.log("✅ Alla tabeller har skapats!");
    await connection.end();
  } catch (err) {
    console.error("❌ Fel:", err);
  }
})();
