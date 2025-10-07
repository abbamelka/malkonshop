const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const cleanReset = async () => {
  let connection;
  try {
    console.log('🔄 Starting clean database reset...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Database dropped');

    // Recreate database
    await connection.execute(`CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.execute(`USE ${process.env.DB_NAME}`);
    console.log('✅ Database recreated');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../migrations/complete-schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📦 Creating tables...');
    await connection.execute(migrationSQL);
    console.log('✅ All tables created successfully');

    // Seed initial data
    console.log('🌱 Seeding initial data...');
    const { seedDatabase } = require('./seed');
    await seedDatabase();
    console.log('✅ Initial data seeded');

    await connection.end();
    console.log('🎉 Clean reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Clean reset failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
};

cleanReset();