/**
 * Admin Service - Firebase Integration
 * Handles all admin operations using Firebase Firestore
 */

import { dataService } from './dataService';
import type { 
  AdminAnimal, 
  AdminEvent, 
  AdminNotification, 
  AdminStaff, 
  AdminHealthReport, 
  AdminSystemSettings 
} from '../types/admin';

// Status mapping functions for database conversion (when needed)
const mapAnimalStatusToAdmin = (status: string): AdminAnimal['status'] => {
  switch (status.toLowerCase()) {
    case 'healthy': return 'Healthy';
    case 'under observation': return 'Under observation';
    case 'scheduled for checkup': return 'Scheduled for checkup';
    case 'treatment required': return 'Treatment required';
    default: return 'Healthy';
  }
};

const mapAnimalStatusToDatabase = (status: AdminAnimal['status']): string => {
  return status.toLowerCase();
};

const mapEventStatusToAdmin = (status: string): AdminEvent['status'] => {
  switch (status.toLowerCase()) {
    case 'scheduled': return 'Scheduled';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    default: return 'Scheduled';
  }
};

const mapEventStatusToDatabase = (status: AdminEvent['status']): string => {
  return status.toLowerCase();
};

const mapNotificationStatusToAdmin = (status: string): AdminNotification['status'] => {
  switch (status.toLowerCase()) {
    case 'scheduled': return 'Scheduled';
    case 'cancelled': return 'Cancelled';
    case 'sent': return 'Sent';
    case 'draft': return 'Draft';
    default: return 'Draft';
  }
};

const mapNotificationStatusToDatabase = (status: AdminNotification['status']): string => {
  return status.toLowerCase();
};

const mapPriorityToAdmin = (priority: string): AdminNotification['priority'] => {
  switch (priority.toLowerCase()) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Medium';
  }
};

const mapPriorityToDatabase = (priority: AdminNotification['priority']): string => {
  return priority.toLowerCase();
};

// Main admin service with specific typed methods
export const adminService = {
  // Generic CRUD operations with proper typing
  async getItems(itemType: string): Promise<AdminAnimal[] | AdminEvent[] | AdminNotification[] | AdminStaff[] | AdminHealthReport[]> {
    try {
      switch (itemType) {
        case 'animals': {
          const animals = await dataService.getAnimals();
          return animals;
        }
        case 'events': {
          const events = await dataService.getEvents();
          return events;
        }
        case 'notifications': {
          const notifications = await dataService.getNotifications();
          return notifications;
        }
        case 'healthReports': {
          const healthReports = await dataService.getHealthReports();
          return healthReports;
        }
        case 'staff': {
          const users = await dataService.getUsers();
          return users.filter(user => user.role === 'staff');
        }
        default:
          throw new Error(`Unknown item type: ${itemType}`);
      }
    } catch (error) {
      console.error(`Error fetching ${itemType}:`, error);
      throw error;
    }
  },

  async getItem(itemType: string, id: string): Promise<AdminAnimal | AdminEvent | AdminNotification | AdminStaff | null> {
    try {
      switch (itemType) {
        case 'animals': {
          const animal = await dataService.getAnimal(id);
          return animal;
        }
        case 'events': {
          const event = await dataService.getEvent(id);
          return event;
        }
        case 'notifications': {
          const notification = await dataService.getNotification(id);
          return notification;
        }
        case 'staff': {
          const user = await dataService.getUser(id);
          return user;
        }
        default:
          throw new Error(`Unknown item type: ${itemType}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Not Found') {
        return null;
      }
      console.error(`Error fetching ${itemType} with id ${id}:`, error);
      throw error;
    }
  },

  async createItem(itemType: string, data: Partial<AdminAnimal> | Partial<AdminEvent> | Partial<AdminNotification>): Promise<AdminAnimal | AdminEvent | AdminNotification> {
    try {
      switch (itemType) {
        case 'animals': {
          const newAnimal = await dataService.createAnimal(data as Partial<AdminAnimal>);
          return newAnimal;
        }
        case 'events': {
          const newEvent = await dataService.createEvent(data as Partial<AdminEvent>);
          return newEvent;
        }
        case 'notifications': {
          const newNotification = await dataService.createNotification(data as Partial<AdminNotification>);
          return newNotification;
        }
        default:
          throw new Error(`Create not implemented for ${itemType}`);
      }
    } catch (error) {
      console.error(`Error creating ${itemType}:`, error);
      throw error;
    }
  },

  async updateItem(itemType: string, id: string, data: Partial<AdminAnimal> | Partial<AdminEvent> | Partial<AdminNotification>): Promise<AdminAnimal | AdminEvent | AdminNotification> {
    try {
      switch (itemType) {
        case 'animals': {
          const updatedAnimal = await dataService.updateAnimal(id, data as Partial<AdminAnimal>);
          return updatedAnimal;
        }
        case 'events': {
          const updatedEvent = await dataService.updateEvent(id, data as Partial<AdminEvent>);
          return updatedEvent;
        }
        case 'notifications': {
          const updatedNotification = await dataService.updateNotification(id, data as Partial<AdminNotification>);
          return updatedNotification;
        }
        default:
          throw new Error(`Update not implemented for ${itemType}`);
      }
    } catch (error) {
      console.error(`Error updating ${itemType} with id ${id}:`, error);
      throw error;
    }
  },

  async deleteItem(itemType: string, id: string): Promise<void> {
    try {
      switch (itemType) {
        case 'animals': {
          await dataService.deleteAnimal(id);
          break;
        }
        case 'events': {
          await dataService.deleteEvent(id);
          break;
        }
        case 'notifications': {
          await dataService.deleteNotification(id);
          break;
        }
        default:
          throw new Error(`Delete not implemented for ${itemType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${itemType} with id ${id}:`, error);
      throw error;
    }
  },

  // System Settings
  async getSystemSettings(): Promise<AdminSystemSettings> {
    try {
      const settings = await dataService.getSystemSettings();
      return {
        enableNotifications: settings.enableNotifications,
        theme: settings.theme,
        lastBackupDate: settings.lastBackupDate,
      };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return {
        enableNotifications: true,
        theme: 'light',
        lastBackupDate: new Date().toISOString(),
      };
    }
  },

  async updateSystemSettings(settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> {
    try {
      const currentSettings = await adminService.getSystemSettings();
      return {
        ...currentSettings,
        ...settings,
      };
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  // Statistics
  async getStatistics() {
    try {
      return await dataService.getStatistics();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Health Reports
  async createHealthReport(data: Partial<AdminHealthReport>): Promise<AdminHealthReport> {
    return await dataService.createHealthReport(data);
  },

  async getHealthReportsByAnimal(animalId: string): Promise<AdminHealthReport[]> {
    return await dataService.getHealthReportsByAnimal(animalId);
  },

  // Image Upload Methods
  async uploadAnimalImage(animalId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const result = await dataService.uploadAnimalImage(animalId, imageFile);
      return {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl
      };
    } catch (error) {
      console.error('Error uploading animal image:', error);
      throw error;
    }
  },

  async uploadEventImage(eventId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const result = await dataService.uploadEventImage(eventId, imageFile);
      return {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl
      };
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  },

  async uploadProfileImage(imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const result = await dataService.uploadProfileImage(imageFile);
      return {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl
      };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  async deleteAnimalImage(animalId: string): Promise<void> {
    try {
      await dataService.deleteAnimalImage(animalId);
    } catch (error) {
      console.error('Error deleting animal image:', error);
      throw error;
    }
  },

  // System management operations
  async backupData(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await dataService.backupData();
      return { success: true, message: 'Backup completed successfully' };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, message: 'Backup failed' };
    }
  },

  async resetSystem(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await dataService.resetSystem();
      return { success: true, message: 'System reset completed successfully' };
    } catch (error) {
      console.error('System reset failed:', error);
      return { success: false, message: 'System reset failed' };
    }
  }
};

// Export specific services for direct use
export const animalService = {
  getAll: async (): Promise<AdminAnimal[]> => {
    const result = await adminService.getItems('animals');
    return result as AdminAnimal[];
  },
  getById: async (id: string): Promise<AdminAnimal | null> => {
    const result = await adminService.getItem('animals', id);
    return result as AdminAnimal | null;
  },
  create: async (data: Partial<AdminAnimal>): Promise<AdminAnimal> => {
    const result = await adminService.createItem('animals', data);
    return result as AdminAnimal;
  },
  update: async (id: string, data: Partial<AdminAnimal>): Promise<AdminAnimal> => {
    const result = await adminService.updateItem('animals', id, data);
    return result as AdminAnimal;
  },
  delete: (id: string) => adminService.deleteItem('animals', id),
  search: async (query: string): Promise<AdminAnimal[]> => {
    try {
      const results = await dataService.searchAnimals(query);
      return results;
    } catch (error) {
      console.error('Error searching animals:', error);
      throw error;
    }
  },
};

export const eventService = {
  getAll: async (): Promise<AdminEvent[]> => {
    const result = await adminService.getItems('events');
    return result as AdminEvent[];
  },
  getById: async (id: string): Promise<AdminEvent | null> => {
    const result = await adminService.getItem('events', id);
    return result as AdminEvent | null;
  },
  create: async (data: Partial<AdminEvent>): Promise<AdminEvent> => {
    const result = await adminService.createItem('events', data);
    return result as AdminEvent;
  },
  update: async (id: string, data: Partial<AdminEvent>): Promise<AdminEvent> => {
    const result = await adminService.updateItem('events', id, data);
    return result as AdminEvent;
  },
  delete: (id: string) => adminService.deleteItem('events', id),
};

export const notificationService = {
  getAll: async (): Promise<AdminNotification[]> => {
    const result = await adminService.getItems('notifications');
    return result as AdminNotification[];
  },
  getById: async (id: string): Promise<AdminNotification | null> => {
    const result = await adminService.getItem('notifications', id);
    return result as AdminNotification | null;
  },
  create: async (data: Partial<AdminNotification>): Promise<AdminNotification> => {
    const result = await adminService.createItem('notifications', data);
    return result as AdminNotification;
  },
  update: async (id: string, data: Partial<AdminNotification>): Promise<AdminNotification> => {
    const result = await adminService.updateItem('notifications', id, data);
    return result as AdminNotification;
  },
  delete: (id: string) => adminService.deleteItem('notifications', id),
};

export const healthReportService = {
  getAll: async (): Promise<AdminHealthReport[]> => {
    const result = await adminService.getItems('healthReports');
    return result as AdminHealthReport[];
  },
  getByAnimalId: async (animalId: string): Promise<AdminHealthReport[]> => {
    try {
      const reports = await dataService.getHealthReportsByAnimal(animalId);
      return reports;
    } catch (error) {
      console.error('Error fetching health reports for animal:', error);
      throw error;
    }
  },
  create: async (data: Partial<AdminHealthReport>): Promise<AdminHealthReport> => {
    try {
      const report = await dataService.createHealthReport(data);
      return report;
    } catch (error) {
      console.error('Error creating health report:', error);
      throw error;
    }
  },
};

export default adminService;
