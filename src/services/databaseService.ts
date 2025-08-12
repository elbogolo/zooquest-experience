import { 
  userModel, 
  animalModel, 
  eventModel, 
  notificationModel, 
  healthReportModel,
  User,
  Animal,
  Event,
  Notification,
  HealthReport
} from '../database/models';
import { initializeWithSeedData } from '../database/seedData';
import { isDatabaseReady } from '../database/connection';

// Initialize database when service is imported
let isInitialized = false;

const initializeDatabase = async () => {
  if (!isInitialized) {
    try {
      if (!isDatabaseReady()) {
        throw new Error('Database connection failed');
      }
      
      await initializeWithSeedData();
      isInitialized = true;
      console.log('✅ Database service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }
};

// Call initialization
initializeDatabase().catch(console.error);

/**
 * Database service that replaces the mock adminService
 * Provides real CRUD operations with SQLite database
 */
export const databaseService = {
  // ========== ANIMALS ==========
  async getAnimals(): Promise<Animal[]> {
    await initializeDatabase(); 
    return animalModel.findAll();
  },

  async getAnimal(id: string): Promise<Animal | null> {
    await initializeDatabase();
    return animalModel.findById(id);
  },

  async createAnimal(data: Partial<Animal>): Promise<Animal> {
    await initializeDatabase();
    return animalModel.create(data);
  },

  async updateAnimal(id: string, data: Partial<Animal>): Promise<Animal | null> {
    await initializeDatabase();
    return animalModel.update(id, data);
  },

  async deleteAnimal(id: string): Promise<boolean> {
    await initializeDatabase();
    return animalModel.delete(id);
  },

  async searchAnimals(query: string): Promise<Animal[]> {
    await initializeDatabase();
    if (!query.trim()) {
      return animalModel.findAll();
    }
    return animalModel.search(query);
  },

  async getAnimalsByStatus(status: string): Promise<Animal[]> {
    await initializeDatabase();
    return animalModel.findByStatus(status);
  },

  async getAnimalsByLocation(location: string): Promise<Animal[]> {
    await initializeDatabase();
    return animalModel.findByLocation(location);
  },

  // ========== EVENTS ==========
  async getEvents(): Promise<Event[]> {
    await initializeDatabase();
    return eventModel.findAll();
  },

  async getEvent(id: string): Promise<Event | null> {
    await initializeDatabase();
    return eventModel.findById(id);
  },

  async createEvent(data: Partial<Event>): Promise<Event> {
    await initializeDatabase();
    return eventModel.create(data);
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
    await initializeDatabase();
    return eventModel.update(id, data);
  },

  async deleteEvent(id: string): Promise<boolean> {
    await initializeDatabase();
    return eventModel.delete(id);
  },

  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    await initializeDatabase();
    return eventModel.findUpcomingEvents(limit);
  },

  async getEventsByStatus(status: string): Promise<Event[]> {
    await initializeDatabase();
    return eventModel.findByStatus(status);
  },

  // ========== NOTIFICATIONS ==========
  async getNotifications(): Promise<Notification[]> {
    await initializeDatabase();
    return notificationModel.findAll();
  },

  async getNotification(id: string): Promise<Notification | null> {
    await initializeDatabase();
    return notificationModel.findById(id);
  },

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    await initializeDatabase();
    return notificationModel.create(data);
  },

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification | null> {
    await initializeDatabase();
    return notificationModel.update(id, data);
  },

  async deleteNotification(id: string): Promise<boolean> {
    await initializeDatabase();
    return notificationModel.delete(id);
  },

  async getNotificationsByStatus(status: string): Promise<Notification[]> {
    await initializeDatabase();
    return notificationModel.findByStatus(status);
  },

  async sendNotification(id: string): Promise<Notification | null> {
    await initializeDatabase();
    const now = new Date().toISOString();
    return notificationModel.update(id, {
      status: 'Sent',
      sent_at: now
    });
  },

  // ========== HEALTH REPORTS ==========
  async getHealthReports(): Promise<HealthReport[]> {
    await initializeDatabase();
    return healthReportModel.findAll();
  },

  async getHealthReport(id: string): Promise<HealthReport | null> {
    await initializeDatabase();
    return healthReportModel.findById(id);
  },

  async createHealthReport(data: Partial<HealthReport>): Promise<HealthReport> {
    await initializeDatabase();
    return healthReportModel.create(data);
  },

  async updateHealthReport(id: string, data: Partial<HealthReport>): Promise<HealthReport | null> {
    await initializeDatabase();
    return healthReportModel.update(id, data);
  },

  async deleteHealthReport(id: string): Promise<boolean> {
    await initializeDatabase();
    return healthReportModel.delete(id);
  },

  async getHealthReportsByAnimal(animalId: string): Promise<HealthReport[]> {
    await initializeDatabase();
    return healthReportModel.findByAnimalId(animalId);
  },

  async getHealthReportsByStatus(status: string): Promise<HealthReport[]> {
    await initializeDatabase();
    return healthReportModel.findByStatus(status);
  },

  // ========== USERS ==========
  async getUsers(): Promise<User[]> {
    await initializeDatabase();
    return userModel.findAll();
  },

  async getUser(id: string): Promise<User | null> {
    await initializeDatabase();
    return userModel.findById(id);
  },

  async getUserByEmail(email: string): Promise<User | null> {
    await initializeDatabase();
    return userModel.findByEmail(email);
  },

  async createUser(data: Partial<User>): Promise<User> {
    await initializeDatabase();
    return userModel.create(data);
  },

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await initializeDatabase();
    return userModel.update(id, data);
  },

  async deleteUser(id: string): Promise<boolean> {
    await initializeDatabase();
    return userModel.delete(id);
  },

  // ========== GENERIC OPERATIONS (for backward compatibility) ==========
  async getItems<T>(itemType: string): Promise<T[]> {
    await initializeDatabase();
    
    switch (itemType) {
      case 'animals':
        return this.getAnimals() as Promise<T[]>;
      case 'events':
        return this.getEvents() as Promise<T[]>;
      case 'notifications':
        return this.getNotifications() as Promise<T[]>;
      case 'healthReports':
        return this.getHealthReports() as Promise<T[]>;
      case 'users':
        return this.getUsers() as Promise<T[]>;
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  async getItem<T>(itemType: string, id: string): Promise<T | null> {
    await initializeDatabase();
    
    switch (itemType) {
      case 'animals':
        return this.getAnimal(id) as Promise<T | null>;
      case 'events':
        return this.getEvent(id) as Promise<T | null>;
      case 'notifications':
        return this.getNotification(id) as Promise<T | null>;
      case 'healthReports':
        return this.getHealthReport(id) as Promise<T | null>;
      case 'users':
        return this.getUser(id) as Promise<T | null>;
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  async createItem<T>(itemType: string, data: Partial<T>): Promise<T> {
    await initializeDatabase();
    
    switch (itemType) {
      case 'animals':
        return this.createAnimal(data as Partial<Animal>) as Promise<T>;
      case 'events':
        return this.createEvent(data as Partial<Event>) as Promise<T>;
      case 'notifications':
        return this.createNotification(data as Partial<Notification>) as Promise<T>;
      case 'healthReports':
        return this.createHealthReport(data as Partial<HealthReport>) as Promise<T>;
      case 'users':
        return this.createUser(data as Partial<User>) as Promise<T>;
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  async updateItem<T>(itemType: string, id: string, data: Partial<T>): Promise<T | null> {
    await initializeDatabase();
    
    switch (itemType) {
      case 'animals':
        return this.updateAnimal(id, data as Partial<Animal>) as Promise<T | null>;
      case 'events':
        return this.updateEvent(id, data as Partial<Event>) as Promise<T | null>;
      case 'notifications':
        return this.updateNotification(id, data as Partial<Notification>) as Promise<T | null>;
      case 'healthReports':
        return this.updateHealthReport(id, data as Partial<HealthReport>) as Promise<T | null>;
      case 'users':
        return this.updateUser(id, data as Partial<User>) as Promise<T | null>;
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  async deleteItem(itemType: string, id: string): Promise<boolean> {
    await initializeDatabase();
    
    switch (itemType) {
      case 'animals':
        return this.deleteAnimal(id);
      case 'events':
        return this.deleteEvent(id);
      case 'notifications':
        return this.deleteNotification(id);
      case 'healthReports':
        return this.deleteHealthReport(id);
      case 'users':
        return this.deleteUser(id);
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  },

  // ========== STATISTICS ==========
  async getStatistics(): Promise<{
    totalAnimals: number;
    totalEvents: number;
    totalNotifications: number;
    totalHealthReports: number;
    totalUsers: number;
    healthyAnimals: number;
    upcomingEvents: number;
    sentNotifications: number;
  }> {
    await initializeDatabase();
    
    const totalAnimals = await animalModel.count();
    const totalEvents = await eventModel.count();
    const totalNotifications = await notificationModel.count();
    const totalHealthReports = await healthReportModel.count();
    const totalUsers = await userModel.count();
    const healthyAnimals = (await animalModel.findByStatus('Healthy')).length;
    const upcomingEvents = (await eventModel.findUpcomingEvents()).length;
    const sentNotifications = (await notificationModel.findByStatus('Sent')).length;

    return {
      totalAnimals,
      totalEvents,
      totalNotifications,
      totalHealthReports,
      totalUsers,
      healthyAnimals,
      upcomingEvents,
      sentNotifications
    };
  }
};

export default databaseService;
