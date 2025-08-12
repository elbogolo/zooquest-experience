/**
 * Firebase Service - Firestore Database Integration
 * Handles all data operations using Firebase Firestore
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  WriteBatch,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { 
  AdminAnimal, 
  AdminEvent, 
  AdminNotification, 
  AdminHealthReport,
  AdminStaff,
  AdminSystemSettings 
} from '@/types/admin';

// Collection names
const COLLECTIONS = {
  animals: 'animals',
  events: 'events',
  notifications: 'notifications',
  healthReports: 'healthReports',
  users: 'users',
  systemSettings: 'systemSettings',
  userFavorites: 'userFavorites',
  visitHistory: 'visitHistory'
} as const;

// Firestore timestamp interface
interface FirestoreTimestamp {
  toDate(): Date;
}

// Type conversion utilities
const convertTimestamp = (timestamp: FirestoreTimestamp | string | null | undefined): string => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp as string;
};

const convertToFirestoreDoc = (data: Record<string, unknown>): Record<string, unknown> => {
  const doc = { ...data };
  
  // Convert date strings to Firestore Timestamps
  if (doc.createdAt && typeof doc.createdAt === 'string') {
    doc.createdAt = Timestamp.fromDate(new Date(doc.createdAt));
  }
  if (doc.updatedAt && typeof doc.updatedAt === 'string') {
    doc.updatedAt = Timestamp.fromDate(new Date(doc.updatedAt));
  }
  if (doc.dateTime && typeof doc.dateTime === 'string') {
    doc.dateTime = Timestamp.fromDate(new Date(doc.dateTime));
  }
  if (doc.checkupDate && typeof doc.checkupDate === 'string') {
    doc.checkupDate = Timestamp.fromDate(new Date(doc.checkupDate));
  }
  
  return doc;
};

const convertFromFirestoreDoc = (doc: Record<string, unknown>): Record<string, unknown> => {
  const data = { ...doc };
  
  // Convert Firestore Timestamps to ISO strings
  if (data.createdAt) data.createdAt = convertTimestamp(data.createdAt as FirestoreTimestamp);
  if (data.updatedAt) data.updatedAt = convertTimestamp(data.updatedAt as FirestoreTimestamp);
  if (data.dateTime) data.dateTime = convertTimestamp(data.dateTime as FirestoreTimestamp);
  if (data.checkupDate) data.checkupDate = convertTimestamp(data.checkupDate as FirestoreTimestamp);
  
  return data;
};

export class FirebaseService {
  // Generic CRUD operations
  async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFromFirestoreDoc(doc.data())
      })) as T[];
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      throw new Error(`Failed to fetch ${collectionName}`);
    }
  }

  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...convertFromFirestoreDoc(docSnap.data())
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${collectionName} document:`, error);
      throw new Error(`Failed to fetch ${collectionName} document`);
    }
  }

  async addDocument<T>(collectionName: string, data: Partial<T>): Promise<T> {
    try {
      const firestoreData = convertToFirestoreDoc({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const docRef = await addDoc(collection(db, collectionName), firestoreData);
      
      return {
        id: docRef.id,
        ...convertFromFirestoreDoc(firestoreData)
      } as T;
    } catch (error) {
      console.error(`Error adding ${collectionName} document:`, error);
      throw new Error(`Failed to add ${collectionName} document`);
    }
  }

  async updateDocument<T>(collectionName: string, docId: string, data: Partial<T>): Promise<T> {
    try {
      const docRef = doc(db, collectionName, docId);
      const firestoreData = convertToFirestoreDoc({
        ...data,
        updatedAt: Timestamp.now()
      });
      
      await updateDoc(docRef, firestoreData);
      
      // Fetch and return updated document
      const updatedDoc = await this.getDocument<T>(collectionName, docId);
      if (!updatedDoc) {
        throw new Error('Document not found after update');
      }
      
      return updatedDoc;
    } catch (error) {
      console.error(`Error updating ${collectionName} document:`, error);
      throw new Error(`Failed to update ${collectionName} document`);
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${collectionName} document:`, error);
      throw new Error(`Failed to delete ${collectionName} document`);
    }
  }

  // Animals
  async getAnimals(): Promise<AdminAnimal[]> {
    return this.getCollection<AdminAnimal>(COLLECTIONS.animals);
  }

  async getAnimal(id: string): Promise<AdminAnimal | null> {
    return this.getDocument<AdminAnimal>(COLLECTIONS.animals, id);
  }

  async createAnimal(data: Partial<AdminAnimal>): Promise<AdminAnimal> {
    return this.addDocument<AdminAnimal>(COLLECTIONS.animals, data);
  }

  async updateAnimal(id: string, data: Partial<AdminAnimal>): Promise<AdminAnimal> {
    return this.updateDocument<AdminAnimal>(COLLECTIONS.animals, id, data);
  }

  async deleteAnimal(id: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.animals, id);
  }

  // Events
  async getEvents(): Promise<AdminEvent[]> {
    return this.getCollection<AdminEvent>(COLLECTIONS.events);
  }

  async getEvent(id: string): Promise<AdminEvent | null> {
    return this.getDocument<AdminEvent>(COLLECTIONS.events, id);
  }

  async createEvent(data: Partial<AdminEvent>): Promise<AdminEvent> {
    return this.addDocument<AdminEvent>(COLLECTIONS.events, data);
  }

  async updateEvent(id: string, data: Partial<AdminEvent>): Promise<AdminEvent> {
    return this.updateDocument<AdminEvent>(COLLECTIONS.events, id, data);
  }

  async deleteEvent(id: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.events, id);
  }

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    return this.getCollection<AdminNotification>(COLLECTIONS.notifications);
  }

  async createNotification(data: Partial<AdminNotification>): Promise<AdminNotification> {
    return this.addDocument<AdminNotification>(COLLECTIONS.notifications, data);
  }

  // Health Reports
  async getHealthReports(): Promise<AdminHealthReport[]> {
    return this.getCollection<AdminHealthReport>(COLLECTIONS.healthReports);
  }

  async getHealthReportsByAnimal(animalId: string): Promise<AdminHealthReport[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.healthReports),
        where('animalId', '==', animalId),
        orderBy('checkupDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFromFirestoreDoc(doc.data())
      })) as AdminHealthReport[];
    } catch (error) {
      console.error('Error fetching health reports by animal:', error);
      throw new Error('Failed to fetch health reports');
    }
  }

  async createHealthReport(data: Partial<AdminHealthReport>): Promise<AdminHealthReport> {
    return this.addDocument<AdminHealthReport>(COLLECTIONS.healthReports, data);
  }

  // Users/Staff
  async getUsers(): Promise<AdminStaff[]> {
    return this.getCollection<AdminStaff>(COLLECTIONS.users);
  }

  async getUser(id: string): Promise<AdminStaff | null> {
    return this.getDocument<AdminStaff>(COLLECTIONS.users, id);
  }

  // Image uploads
  async uploadAnimalImage(animalId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const imageRef = ref(storage, `animals/${animalId}/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);
      
      // For now, use the same URL for thumbnail
      // In production, you'd generate a thumbnail
      return {
        imageUrl,
        thumbnailUrl: imageUrl
      };
    } catch (error) {
      console.error('Error uploading animal image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async uploadEventImage(eventId: string, imageFile: File): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    try {
      const imageRef = ref(storage, `events/${eventId}/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);
      
      return {
        imageUrl,
        thumbnailUrl: imageUrl
      };
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // System settings
  async getSystemSettings(): Promise<AdminSystemSettings> {
    try {
      const settings = await this.getDocument<AdminSystemSettings>(COLLECTIONS.systemSettings, 'main');
      return settings || {
        enableNotifications: true,
        lastBackupDate: new Date().toISOString(),
        theme: "system"
      } as AdminSystemSettings;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw new Error('Failed to fetch system settings');
    }
  }

  async updateSystemSettings(settings: Partial<AdminSystemSettings>): Promise<AdminSystemSettings> {
    try {
      // Ensure we have the main settings document
      const docRef = doc(db, COLLECTIONS.systemSettings, 'main');
      const firestoreData = convertToFirestoreDoc({
        ...settings,
        updatedAt: Timestamp.now()
      });
      
      await updateDoc(docRef, firestoreData);
      return this.getSystemSettings();
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  // Statistics
  async getStatistics() {
    try {
      const [animals, events, users, healthReports] = await Promise.all([
        this.getAnimals(),
        this.getEvents(),
        this.getUsers(),
        this.getHealthReports()
      ]);

      return {
        totalAnimals: animals.length,
        totalEvents: events.length,
        totalUsers: users.length,
        totalHealthReports: healthReports.length,
        animalsInTreatment: animals.filter(a => a.status === 'Treatment required').length,
        upcomingEvents: events.filter(e => e.status === 'Scheduled').length,
        recentHealthReports: healthReports.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  // User favorites (for logged-in users)
  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const favDoc = await this.getDocument<{ favorites: string[] }>(COLLECTIONS.userFavorites, userId);
      return favDoc?.favorites || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  async addToFavorites(userId: string, animalId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.userFavorites, userId);
      const favorites = await this.getUserFavorites(userId);
      
      if (!favorites.includes(animalId)) {
        await updateDoc(docRef, {
          favorites: [...favorites, animalId],
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Failed to add to favorites');
    }
  }

  async removeFromFavorites(userId: string, animalId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.userFavorites, userId);
      const favorites = await this.getUserFavorites(userId);
      
      await updateDoc(docRef, {
        favorites: favorites.filter(id => id !== animalId),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Failed to remove from favorites');
    }
  }

  // Real-time subscriptions
  subscribeToCollection<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertFromFirestoreDoc(doc.data())
        })) as T[];
        callback(data);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        if (errorCallback) errorCallback(error);
      }
    );
  }
}

// Create and export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
