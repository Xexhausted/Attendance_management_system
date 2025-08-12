const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const isTestEnvironment = process.env.NODE_ENV === "test"



const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mysecretpassword',
  database: process.env.DB_NAME || 'attendance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table with enhanced fields
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        department VARCHAR(100) DEFAULT 'Engineering',
        join_date DATE,
        profile_picture VARCHAR(255),
        location VARCHAR(100) DEFAULT 'Office Floor 3',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create departments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table with enhanced fields
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'late', 'absent') DEFAULT 'present',
        time_in TIME,
        time_out TIME,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);

    // Create salary table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS salary (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        month VARCHAR(10) NOT NULL,
        year INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_month_year (user_id, month, year)
      )
    `);

    // Create user_preferences table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        notifications BOOLEAN DEFAULT TRUE,
        email_alerts BOOLEAN DEFAULT TRUE,
        dark_mode BOOLEAN DEFAULT FALSE,
        auto_checkout BOOLEAN DEFAULT TRUE,
        timezone VARCHAR(20) DEFAULT 'UTC+5',
        language ENUM('English', 'Nepali') DEFAULT 'English',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_preferences (user_id)
      )
    `);

    // Insert default departments if they don't exist
    const departments = [
      { name: 'HR Department', description: 'Human Resources Department' },
      { name: 'Engineering', description: 'Software Engineering Department' },
      { name: 'Marketing', description: 'Marketing and Sales Department' },
      { name: 'Sales', description: 'Sales Department' },
      { name: 'Operations', description: 'Operations Department' },
      { name: 'Finance', description: 'Finance Department' },
      { name: 'Legal', description: 'Legal Department' }
    ];

    for (const dept of departments) {
      await connection.execute(`
        INSERT IGNORE INTO departments (name, description) 
        VALUES (?, ?)
      `, [dept.name, dept.description]);
    }

    // Insert default admin user if it doesn't exist
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, password, role, department, join_date) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'John Smith',
      'admin@company.com',
      hashedPassword,
      'admin',
      'HR Department',
      '2020-01-15'
    ]);

    // Insert default user if it doesn't exist
    const userPassword = await bcrypt.hash('user123', 12);
    
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, password, role, department, join_date) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Jane Doe',
      'jane.doe@company.com',
      userPassword,
      'user',
      'Engineering',
      '2022-03-10'
    ]);

    connection.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
}; 