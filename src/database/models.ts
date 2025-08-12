import { getDatabase, generateId, runTransaction } from './connection';
import Database from 'better-sqlite3';

// Database model interfaces
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'staff' | 'visitor';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  scientific_name?: string;
  description?: string;
  habitat?: string;
  diet?: string;
  fun_fact?: string;
  location: string;
  status: 'Healthy' | 'Under observation' | 'Scheduled for checkup' | 'Treatment required';
  image_url?: string;
  age?: number;
  weight?: number;
  arrival_date?: string;
  last_checkup?: string;
  caretaker?: string;
  dietary_needs?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered_count: number;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string;
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Failed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  sent_at?: string;
  scheduled_for?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  hire_date?: string;
  permissions?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  created_at: string;
  updated_at: string;
}

export interface HealthReport {
  id: string;
  animal_id: string;
  veterinarian: string;
  examination_date: string;
  findings: string;
  recommendations?: string;
  follow_up_date?: string;
  treatment_plan?: string;
  weight?: number;
  temperature?: number;
  status: 'Normal' | 'Attention Needed' | 'Critical';
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: 'animal' | 'event';
  item_id: string;
  created_at: string;
}

export interface VisitHistory {
  id: string;
  user_id: string;
  animal_id?: string;
  event_id?: string;
  visit_date: string;
  visit_duration?: number;
  created_at: string;
}

export interface SystemSettings {
  id: string;
  enable_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  maintenance_mode: boolean;
  last_backup_date?: string;
  zoo_name: string;
  zoo_description?: string;
  operating_hours?: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

// Base model class with common CRUD operations
export abstract class BaseModel<T> {
  protected db: Database.Database;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = getDatabase();
    this.tableName = tableName;
  }

  // Create record
  create(data: Partial<T>): T {
    const id = generateId();
    const now = new Date().toISOString();
    
    const recordData = {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    };

    const columns = Object.keys(recordData).join(', ');
    const placeholders = Object.keys(recordData).map(() => '?').join(', ');
    const values = Object.values(recordData);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    
    try {
      this.db.prepare(query).run(values);
      return this.findById(id)!;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Find by ID
  findById(id: string): T | null {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    try {
      return this.db.prepare(query).get(id) as T || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  // Find all records
  findAll(): T[] {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`;
    try {
      return this.db.prepare(query).all() as T[];
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  // Update record
  update(id: string, data: Partial<T>): T | null {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const columns = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    const query = `UPDATE ${this.tableName} SET ${columns} WHERE id = ?`;
    
    try {
      const result = this.db.prepare(query).run(values);
      if (result.changes > 0) {
        return this.findById(id);
      }
      return null;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  // Delete record
  delete(id: string): boolean {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    try {
      const result = this.db.prepare(query).run(id);
      return result.changes > 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  // Count records
  count(): number {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    try {
      const result = this.db.prepare(query).get() as { count: number };
      return result.count;
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }
}

// Specific model classes
export class UserModel extends BaseModel<User> {
  constructor() {
    super('users');
  }

  findByEmail(email: string): User | null {
    const query = `SELECT * FROM users WHERE email = ?`;
    return this.db.prepare(query).get(email) as User || null;
  }

  findByRole(role: string): User[] {
    const query = `SELECT * FROM users WHERE role = ?`;
    return this.db.prepare(query).all(role) as User[];
  }
}

export class AnimalModel extends BaseModel<Animal> {
  constructor() {
    super('animals');
  }

  findByStatus(status: string): Animal[] {
    const query = `SELECT * FROM animals WHERE status = ?`;
    return this.db.prepare(query).all(status) as Animal[];
  }

  findByLocation(location: string): Animal[] {
    const query = `SELECT * FROM animals WHERE location = ?`;
    return this.db.prepare(query).all(location) as Animal[];
  }

  search(searchTerm: string): Animal[] {
    const query = `
      SELECT * FROM animals 
      WHERE name LIKE ? OR species LIKE ? OR location LIKE ?
      ORDER BY name
    `;
    const term = `%${searchTerm}%`;
    return this.db.prepare(query).all(term, term, term) as Animal[];
  }
}

export class EventModel extends BaseModel<Event> {
  constructor() {
    super('events');
  }

  findByStatus(status: string): Event[] {
    const query = `SELECT * FROM events WHERE status = ?`;
    return this.db.prepare(query).all(status) as Event[];
  }

  findByDateRange(startDate: string, endDate: string): Event[] {
    const query = `SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date, time`;
    return this.db.prepare(query).all(startDate, endDate) as Event[];
  }

  findUpcomingEvents(limit: number = 10): Event[] {
    const query = `
      SELECT * FROM events 
      WHERE date >= date('now') AND status = 'Scheduled'
      ORDER BY date, time 
      LIMIT ?
    `;
    return this.db.prepare(query).all(limit) as Event[];
  }
}

export class NotificationModel extends BaseModel<Notification> {
  constructor() {
    super('notifications');
  }

  findByStatus(status: string): Notification[] {
    const query = `SELECT * FROM notifications WHERE status = ?`;
    return this.db.prepare(query).all(status) as Notification[];
  }

  findByRecipient(recipient: string): Notification[] {
    const query = `SELECT * FROM notifications WHERE recipients LIKE ?`;
    return this.db.prepare(query).all(`%${recipient}%`) as Notification[];
  }
}

export class HealthReportModel extends BaseModel<HealthReport> {
  constructor() {
    super('health_reports');
  }

  findByAnimalId(animalId: string): HealthReport[] {
    const query = `SELECT * FROM health_reports WHERE animal_id = ? ORDER BY examination_date DESC`;
    return this.db.prepare(query).all(animalId) as HealthReport[];
  }

  findByStatus(status: string): HealthReport[] {
    const query = `SELECT * FROM health_reports WHERE status = ?`;
    return this.db.prepare(query).all(status) as HealthReport[];
  }
}

// Model instances (singletons)
export const userModel = new UserModel();
export const animalModel = new AnimalModel();
export const eventModel = new EventModel();
export const notificationModel = new NotificationModel();
export const healthReportModel = new HealthReportModel();
