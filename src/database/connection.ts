import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_PATH = path.join(process.cwd(), 'zooquest.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Create database instance
let db: Database.Database | null = null;

/**
 * Get database connection (singleton pattern)
 */
export const getDatabase = (): Database.Database => {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize database with schema if it's a new database
    initializeDatabase();
  }
  return db;
};

/**
 * Initialize database with schema
 */
const initializeDatabase = () => {
  if (!db) return;
  
  try {
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};

/**
 * Run database transaction
 */
export const runTransaction = <T>(callback: (db: Database.Database) => T): T => {
  const database = getDatabase();
  const transaction = database.transaction(callback);
  return transaction(database);
};

/**
 * Generate UUID for database records
 */
export const generateId = (): string => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Execute raw SQL query (use with caution)
 */
export const executeRawQuery = (sql: string, params: unknown[] = []): unknown[] => {
  const database = getDatabase();
  try {
    return database.prepare(sql).all(params);
  } catch (error) {
    console.error('Error executing raw query:', error);
    throw error;
  }
};

/**
 * Check if database exists and is accessible
 */
export const isDatabaseReady = (): boolean => {
  try {
    const database = getDatabase();
    // Test query to check if database is working
    database.prepare("SELECT 1").get();
    return true;
  } catch (error) {
    console.error('Database not ready:', error);
    return false;
  }
};

// Gracefully close database on process exit
process.on('exit', closeDatabase);
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

export default getDatabase;
