import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tantraos',
  charset: 'utf8mb4'
};

let pool;

export async function initDatabase() {
  try {
    // Create connection pool
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();

    // Run migrations
    await runMigrations();
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = await fs.readdir(migrationsPath);
    
    // Sort migration files
    migrationFiles.sort();
    
    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = await fs.readFile(path.join(migrationsPath, file), 'utf8');
        await pool.execute(migrationSQL);
        console.log(`✅ Migration ${file} completed`);
      }
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}

export default { initDatabase, getPool };