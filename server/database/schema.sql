-- ZooQuest Experience Database Schema
-- SQLite Database Schema for Local Development

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'visitor', -- 'admin', 'staff', 'visitor'
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    scientific_name TEXT,
    description TEXT,
    habitat TEXT,
    diet TEXT,
    fun_fact TEXT,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Healthy', -- 'Healthy', 'Under observation', 'Scheduled for checkup'
    image_url TEXT,
    age INTEGER,
    weight REAL,
    arrival_date DATE,
    last_checkup DATE,
    caretaker TEXT,
    dietary_needs TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER DEFAULT 0,
    registered_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Scheduled', -- 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'
    image_url TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Notifications table  
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipients TEXT NOT NULL, -- 'all', 'visitors', 'members', or specific user IDs (JSON array)
    status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft', 'Scheduled', 'Sent', 'Failed'
    priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    sent_at DATETIME,
    scheduled_for DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT,
    hire_date DATE,
    permissions TEXT, -- JSON array of permissions
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive', 'On Leave'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Health Reports table
CREATE TABLE IF NOT EXISTS health_reports (
    id TEXT PRIMARY KEY,
    animal_id TEXT NOT NULL,
    veterinarian TEXT NOT NULL,
    examination_date DATE NOT NULL,
    findings TEXT NOT NULL,
    recommendations TEXT,
    follow_up_date DATE,
    treatment_plan TEXT,
    weight REAL,
    temperature REAL,
    status TEXT NOT NULL DEFAULT 'Normal', -- 'Normal', 'Attention Needed', 'Critical'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- User Favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'animal', 'event'
    item_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_type, item_id)
);

-- Visit History table
CREATE TABLE IF NOT EXISTS visit_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    animal_id TEXT,
    event_id TEXT,
    visit_date DATE NOT NULL,
    visit_duration INTEGER, -- in minutes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    enable_notifications BOOLEAN DEFAULT TRUE,
    theme TEXT DEFAULT 'light', -- 'light', 'dark', 'system'
    maintenance_mode BOOLEAN DEFAULT FALSE,
    last_backup_date DATETIME,
    zoo_name TEXT DEFAULT 'ZooQuest Experience',
    zoo_description TEXT,
    operating_hours TEXT,
    contact_info TEXT, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_location ON animals(location);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_health_reports_animal_id ON health_reports(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_reports_date ON health_reports(examination_date);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_user_id ON visit_history(user_id);
