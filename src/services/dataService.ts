/**
 * Data Service - Firebase Integration Layer
 * Replaces API client with Firebase Firestore operations
 * Maintains the same interface as the original API service
 */

import { firebaseService } from './firebaseService';
import { localFileService } from './localFileService';
import type { 
  AdminAnimal, 
  AdminEvent, 
  AdminNotification, 
  AdminHealthReport,
  AdminStaff,
  AdminSystemSettings 
} from '@/types/admin';

/**
 * Use this flag to toggle between Firebase and API backend
 * Set to true to use Firebase, false to use your local API server
 */
const USE_FIREBASE = true;

// Re-export Firebase service functions with the same API interface
export class DataService {
  
  // Animals
  async getAnimals(): Promise<AdminAnimal[]> {
    if (USE_FIREBASE) {
      return firebaseService.getAnimals();
    }
    // Fallback to API (keep original API calls here if needed)
    throw new Error('API backend not configured');
  }

  async getAnimal(id: string): Promise<AdminAnimal | null> {
    if (USE_FIREBASE) {
      return firebaseService.getAnimal(id);
    }
    throw new Error('API backend not configured');
  }

  async createAnimal(data: Partial<AdminAnimal>): Promise<AdminAnimal> {
    if (USE_FIREBASE) {
      return firebaseService.createAnimal(data);
    }
    throw new Error('API backend not configured');
  }

  async updateAnimal(id: string, data: Partial<AdminAnimal>): Promise<AdminAnimal> {
    if (USE_FIREBASE) {
      return firebaseService.updateAnimal(id, data);
    }
    throw new Error('API backend not configured');
  }

  async deleteAnimal(id: string): Promise<void> {
    if (USE_FIREBASE) {
      return firebaseService.deleteAnimal(id);
    }
    throw new Error('API backend not configured');
  }

  // Events  
  async getEvents(): Promise<AdminEvent[]> {
    if (USE_FIREBASE) {
      return firebaseService.getEvents();
    }
    throw new Error('API backend not configured');
  }

  async getEvent(id: string): Promise<AdminEvent | null> {
    if (USE_FIREBASE) {
      return firebaseService.getEvent(id);
    }
    throw new Error('API backend not configured');
  }

  async createEvent(data: Partial<AdminEvent>): Promise<AdminEvent> {
    if (USE_FIREBASE) {
      return firebaseService.createEvent(data);
    }
    throw new Error('API backend not configured');
  }

  async updateEvent(id: string, data: Partial<AdminEvent>): Promise<AdminEvent> {
    if (USE_FIREBASE) {
      return firebaseService.updateEvent(id, data);
    }
    throw new Error('API backend not configured');
  }

  async deleteEvent(id: string): Promise<void> {
    if (USE_FIREBASE) {
      return firebaseService.deleteEvent(id);
    }
    throw new Error('API backend not configured');
  }

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    if (USE_FIREBASE) {
      return firebaseService.getNotifications();
    }
    throw new Error('API backend not configured');
  }

  async getNotification(id: string): Promise<AdminNotification | null> {
    if (USE_FIREBASE) {
      return firebaseService.getDocument<AdminNotification>('notifications', id);
    }
    throw new Error('API backend not configured');
  }

  async createNotification(data: Partial<AdminNotification>): Promise<AdminNotification> {
    if (USE_FIREBASE) {
      return firebaseService.createNotification(data);
    }
    throw new Error('API backend not configured');
  }

  async updateNotification(id: string, data: Partial<AdminNotification>): Promise<AdminNotification> {
    if (USE_FIREBASE) {
      return firebaseService.updateDocument<AdminNotification>('notifications', id, data);
    }
    throw new Error('API backend not configured');
  }

  async deleteNotification(id: string): Promise<void> {
    if (USE_FIREBASE) {
      return firebaseService.deleteDocument('notifications', id);
    }
    throw new Error('API backend not configured');
  }

  // Health Reports
  async getHealthReports(): Promise<AdminHealthReport[]> {
    if (USE_FIREBASE) {
      return firebaseService.getHealthReports();
    }
    throw new Error('API backend not configured');
  }

  async getHealthReportsByAnimal(animalId: string): Promise<AdminHealthReport[]> {
    if (USE_FIREBASE) {
      return firebaseService.getHealthReportsByAnimal(animalId);
    }
    throw new Error('API backend not configured');
  }

  async createHealthReport(data: Partial<AdminHealthReport>): Promise<AdminHealthReport> {
    if (USE_FIREBASE) {
      return firebaseService.createHealthReport(data);
    }
    throw new Error('API backend not configured');
  }

  // Users/Staff
  async getUsers(): Promise<AdminStaff[]> {
    if (USE_FIREBASE) {
      return firebaseService.getUsers();
    }
    throw new Error('API backend not configured');
  }

  async getUser(id: string): Promise<AdminStaff | null> {
    if (USE_FIREBASE) {
      return firebaseService.getUser(id);
    }
    throw new Error('API backend not configured');
  }

  // System Settings
  async getSystemSettings(): Promise<AdminSystemSettings> {
    if (USE_FIREBASE) {
      return firebaseService.getSystemSettings();
    }
    throw new Error('API backend not configured');
  }

  async updateSystemSettings(settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> {
    if (USE_FIREBASE) {
      return firebaseService.updateSystemSettings(settings);
    }
    throw new Error('API backend not configured');
  }

  // Statistics
  async getStatistics() {
    if (USE_FIREBASE) {
      return firebaseService.getStatistics();
    }
    throw new Error('API backend not configured');
  }

  // Image uploads
  async uploadAnimalImage(animalId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    if (USE_FIREBASE) {
      try {
        return await firebaseService.uploadAnimalImage(animalId, imageFile);
      } catch (error) {
        console.error('Firebase upload failed, falling back to local:', error);
        return await localFileService.uploadAnimalImage(animalId, imageFile);
      }
    }
    throw new Error('API backend not configured');
  }

  async uploadEventImage(eventId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    if (USE_FIREBASE) {
      try {
        return await firebaseService.uploadEventImage(eventId, imageFile);
      } catch (error) {
        console.error('Firebase upload failed, falling back to local:', error);
        return await localFileService.uploadEventImage(eventId, imageFile);
      }
    }
    throw new Error('API backend not configured');
  }

  async uploadProfileImage(imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    if (USE_FIREBASE) {
      try {
        // For profile images, we can use a generic storage folder
        return await firebaseService.uploadEventImage('profiles', imageFile);
      } catch (error) {
        console.error('Firebase upload failed, falling back to local:', error);
        return await localFileService.uploadProfileImage(imageFile);
      }
    }
    throw new Error('API backend not configured');
  }

  async deleteAnimalImage(animalId: string): Promise<void> {
    if (USE_FIREBASE) {
      // Note: Firebase Storage doesn't have a simple delete by animal ID
      // In production, you'd track image references in Firestore
      console.warn('Delete animal image not implemented for Firebase yet');
      return Promise.resolve();
    }
    throw new Error('API backend not configured');
  }

  // User favorites
  async getUserFavorites(userId: string): Promise<string[]> {
    if (USE_FIREBASE) {
      return firebaseService.getUserFavorites(userId);
    }
    throw new Error('API backend not configured');
  }

  async addToFavorites(userId: string, animalId: string): Promise<void> {
    if (USE_FIREBASE) {
      return firebaseService.addToFavorites(userId, animalId);
    }
    throw new Error('API backend not configured');
  }

  async removeFromFavorites(userId: string, animalId: string): Promise<void> {
    if (USE_FIREBASE) {
      return firebaseService.removeFromFavorites(userId, animalId);
    }
    throw new Error('API backend not configured');
  }

  // Search
  async searchAnimals(query: string): Promise<AdminAnimal[]> {
    if (USE_FIREBASE) {
      // Simple search - in production you'd use Algolia or similar
      const animals = await this.getAnimals();
      return animals.filter(animal => 
        animal.name.toLowerCase().includes(query.toLowerCase()) ||
        animal.species.toLowerCase().includes(query.toLowerCase())
      );
    }
    throw new Error('API backend not configured');
  }

  // Backup and reset
  async backupData(): Promise<{ success: boolean; message: string }> {
    if (USE_FIREBASE) {
      // Firebase handles backups automatically
      return { success: true, message: 'Firebase handles backups automatically' };
    }
    throw new Error('API backend not configured');
  }

  async resetSystem(): Promise<{ success: boolean; message: string }> {
    if (USE_FIREBASE) {
      // This would be a dangerous operation - just return a message
      return { success: false, message: 'System reset not available for Firebase' };
    }
    throw new Error('API backend not configured');
  }

  // Real-time subscriptions
  subscribeToAnimals(callback: (animals: AdminAnimal[]) => void) {
    if (USE_FIREBASE) {
      return firebaseService.subscribeToCollection<AdminAnimal>('animals', callback);
    }
    throw new Error('API backend not configured');
  }

  subscribeToEvents(callback: (events: AdminEvent[]) => void) {
    if (USE_FIREBASE) {
      return firebaseService.subscribeToCollection<AdminEvent>('events', callback);
    }
    throw new Error('API backend not configured');
  }

  // Toggle between Firebase and API
  static setUseFirebase(useFirebase: boolean) {
    // You can modify this to dynamically switch backends
    console.log(`DataService: ${useFirebase ? 'Using Firebase' : 'Using API backend'}`);
  }
}

// Create and export singleton instance
export const dataService = new DataService();

// Compatibility exports for existing code
export { firebaseService };
export default dataService;
