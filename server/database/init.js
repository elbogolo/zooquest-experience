const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database file path
const DB_PATH = path.join(__dirname, '..', 'zooquest.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

/**
 * Generate UUID for database records
 */
function generateId() {
  return uuidv4();
}

/**
 * Get database connection (singleton pattern)
 */
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        throw err;
      }
      console.log('Connected to the SQLite database');
    });
    
    // Enable WAL mode and foreign keys
    db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;', (err) => {
      if (err) console.error('Error setting PRAGMA:', err.message);
    });
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      console.log('Closing database connection...');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
        } else {
          console.log('Database connection closed');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

/**
 * Run a database query with parameters (Promise wrapper)
 */
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Get a single row from database (Promise wrapper)
 */
function getRow(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get multiple rows from database (Promise wrapper)
 */
function getRows(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Execute SQL directly (Promise wrapper)
 */
function execSQL(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Seed database with initial data
 */
async function seedDatabase(database) {
  try {
    // Clear existing data (for development)
    const tables = [
      'health_reports',
      'user_favorites', 
      'visit_history',
      'notifications',
      'events',
      'animals',
      'users'
    ];
    
    // Execute DELETE operations in sequence
    for (const table of tables) {
      await runQuery(database, `DELETE FROM ${table}`);
    }
    
    // Seed users
    const users = [
      {
        email: 'admin@zooquest.com',
        password: 'admin123',
        name: 'Zoo Administrator',
        role: 'admin',
      },
      {
        email: 'staff@zooquest.com',
        password: 'staff123',
        name: 'Zoo Staff Member',
        role: 'staff',
      },
      {
        email: 'visitor@zooquest.com',
        password: 'visitor123',
        name: 'John Visitor',
        role: 'visitor',
      }
    ];

    // Insert users
    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const userId = generateId();
      
      await runQuery(
        database,
        `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [userId, userData.email, passwordHash, userData.name, userData.role]
      );
    }
    
    // Seed animals
    const animals = [
      {
        name: 'Simba',
        species: 'African Lion',
        scientific_name: 'Panthera leo',
        description: 'A majestic male lion known for his impressive mane and regal presence.',
        habitat: 'African Savanna',
        diet: 'Carnivore - primarily zebras, wildebeest, and other large mammals',
        fun_fact: 'Lions can sleep up to 20 hours a day!',
        location: 'Lion Pride Lands',
        status: 'healthy',
        age: 8,
        weight: 190.5,
        arrival_date: '2019-03-15',
        last_checkup: '2024-01-15',
        caretaker: 'Dr. Sarah Wilson',
        dietary_needs: 'High-protein diet, 15-20 lbs of meat daily',
        image_url: '/images/animals/lion.jpg'
      },
      {
        name: 'Rajah',
        species: 'Bengal Tiger',
        scientific_name: 'Panthera tigris tigris',
        description: 'A powerful Bengal tiger with distinctive black stripes and piercing amber eyes.',
        habitat: 'Indian Forests and Grasslands',
        diet: 'Carnivore - deer, wild boar, and other medium to large mammals',
        fun_fact: 'Each tiger has a unique stripe pattern, like human fingerprints!',
        location: 'Tiger Territory',
        status: 'healthy',
        age: 6,
        weight: 220.0,
        arrival_date: '2020-07-22',
        last_checkup: '2024-01-10',
        caretaker: 'Dr. Michael Chen',
        dietary_needs: 'Raw meat diet, 20-25 lbs daily',
        image_url: '/images/animals/tiger.jpg'
      },
      {
        name: 'Koko',
        species: 'Western Lowland Gorilla',
        scientific_name: 'Gorilla gorilla gorilla',
        description: 'A gentle giant gorilla known for his intelligence and playful nature.',
        habitat: 'Central African Rainforests',
        diet: 'Herbivore - fruits, leaves, bark, and stems',
        fun_fact: 'Gorillas share 98% of their DNA with humans!',
        location: 'Gorilla Grove',
        status: 'sick',
        age: 12,
        weight: 180.0,
        arrival_date: '2018-05-10',
        last_checkup: '2024-01-20',
        caretaker: 'Dr. Emily Rodriguez',
        dietary_needs: 'High-fiber plant diet, 40 lbs daily',
        image_url: '/images/animals/gorilla.jpg'
      }
    ];
    
    // Insert animals
    for (const animalData of animals) {
      const animalId = generateId();
      
      await runQuery(
        database,
        `INSERT INTO animals (
          id, name, species, scientific_name, description, habitat, diet, 
          fun_fact, location, status, age, weight, arrival_date, 
          last_checkup, caretaker, dietary_needs, image_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          animalId,
          animalData.name,
          animalData.species,
          animalData.scientific_name,
          animalData.description,
          animalData.habitat,
          animalData.diet,
          animalData.fun_fact,
          animalData.location,
          animalData.status,
          animalData.age,
          animalData.weight,
          animalData.arrival_date,
          animalData.last_checkup,
          animalData.caretaker,
          animalData.dietary_needs,
          animalData.image_url
        ]
      );
    }
    
    // Seed events
    const events = [
      {
        title: 'Lion Feeding',
        description: 'Watch our lions feast during their daily feeding time.',
        date: '2024-06-15',
        start_time: '10:30',
        duration: 30,
        location: 'Lion Pride Lands',
        status: 'scheduled',
        max_attendees: 50,
        image_url: '/images/events/lion-feeding.jpg'
      },
      {
        title: 'Gorilla Talk',
        description: 'Learn about our gorillas and their conservation status.',
        date: '2024-06-16',
        start_time: '13:00',
        duration: 45,
        location: 'Gorilla Grove',
        status: 'scheduled',
        max_attendees: 30,
        image_url: '/images/events/gorilla-talk.jpg'
      },
      {
        title: 'Zoo Photography Workshop',
        description: 'Learn wildlife photography techniques with our resident photographer.',
        date: '2024-06-20',
        start_time: '09:00',
        duration: 120,
        location: 'Education Center',
        status: 'scheduled',
        max_attendees: 15,
        image_url: '/images/events/photo-workshop.jpg'
      }
    ];
    
    // Insert events
    for (const eventData of events) {
      await runQuery(
        database,
        `INSERT INTO events (
          id, title, description, date, time, location, 
          status, capacity, image_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          generateId(),
          eventData.title,
          eventData.description,
          eventData.date,
          eventData.start_time,
          eventData.location,
          eventData.status,
          eventData.max_attendees,
          eventData.image_url
        ]
      );
    }
    
    // Seed notifications
    const notifications = [
      {
        title: 'Special Holiday Hours',
        content: 'The zoo will be open extended hours during the holiday weekend.',
        status: 'scheduled',
        priority: 'medium',
        publish_date: '2024-06-30',
        image_url: '/images/notifications/holiday-hours.jpg'
      },
      {
        title: 'New Tiger Cubs',
        content: 'We\'re excited to announce the arrival of three tiger cubs! Visit the Tiger Territory to see them.',
        status: 'draft',
        priority: 'high',
        publish_date: '2024-07-15',
        image_url: '/images/notifications/tiger-cubs.jpg'
      }
    ];
    
    // Insert notifications
    for (const notificationData of notifications) {
      await runQuery(
        database,
        `INSERT INTO notifications (
          id, title, content, status, priority, publish_date, 
          image_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          generateId(),
          notificationData.title,
          notificationData.content,
          notificationData.status,
          notificationData.priority,
          notificationData.publish_date,
          notificationData.image_url
        ]
      );
    }
    
    console.log('Database seeded with initial data');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

/**
 * Initialize database with schema and seed data
 */
async function initializeDatabase() {
  try {
    const database = getDatabase();
    
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await execSQL(database, schema);
    console.log('✅ Database schema initialized');
    
    // Check if we need to seed data
    const row = await getRow(database, 'SELECT COUNT(*) as count FROM animals');
    
    if (row.count === 0) {
      console.log('🌱 Seeding database with initial data...');
      await seedDatabase(database);
      console.log('✅ Database seeded successfully');
    } else {
      console.log('📊 Database already contains data, skipping seeding');
    }
    
    return database;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  runQuery,
  getRow,
  getRows,
  execSQL,
  generateId
};

// Gracefully close database on process exit
process.on('exit', () => {
  if (db) {
    console.log('Process exiting, closing database connection...');
    db.close();
  }
});

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
