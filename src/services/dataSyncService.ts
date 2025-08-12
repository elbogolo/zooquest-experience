/**
 * Data Synchronization Service for ZooQuest Experience
 * Handles real-time data updates, conflict resolution, and cache management
 */

import { cacheManager } from './cacheManager';
import { apiClient } from './apiClient';
import type { DatabaseAnimal, DatabaseEvent, DatabaseNotification } from '../types/api';

export type SyncEvent = 'animal_updated' | 'event_updated' | 'notification_sent' | 'data_refresh';

export interface SyncEventData {
  type: SyncEvent;
  entityId?: string;
  entityType?: 'animal' | 'event' | 'notification';
  timestamp: number;
  userId?: string;
}

class DataSyncService {
  private eventListeners = new Map<SyncEvent, Set<(data: SyncEventData) => void>>();
  private refreshInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private pendingOperations: Array<{ key: string; operation: () => Promise<unknown> }> = [];

  constructor() {
    this.setupNetworkListeners();
    this.startAutoRefresh();
  }

  /**
   * Subscribe to sync events
   */
  subscribe(event: SyncEvent, callback: (data: SyncEventData) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit sync event to all listeners
   */
  private emit(event: SyncEvent, data: Omit<SyncEventData, 'type' | 'timestamp'>): void {
    const eventData: SyncEventData = {
      type: event,
      timestamp: Date.now(),
      ...data
    };

    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(eventData);
      } catch (error) {
        console.error('Error in sync event listener:', error);
      }
    });
  }

  /**
   * Invalidate cache and trigger refresh for specific entity
   */
  invalidateAndRefresh(entityType: 'animal' | 'event' | 'notification', entityId?: string): void {
    if (entityId) {
      cacheManager.invalidate(`${entityType}_${entityId}`);
    }
    cacheManager.invalidatePattern(`${entityType}s_.*`);
    
    this.emit(`${entityType}_updated` as SyncEvent, { entityId, entityType });
  }

  /**
   * Handle data modification with optimistic updates
   */
  async handleDataModification<T>(
    operation: () => Promise<T>,
    entityType: 'animal' | 'event' | 'notification',
    entityId?: string
  ): Promise<T> {
    try {
      const result = await operation();
      this.invalidateAndRefresh(entityType, entityId);
      return result;
    } catch (error) {
      console.error('Data modification failed:', error);
      throw error;
    }
  }

  /**
   * Sync animals data
   */
  async syncAnimals(): Promise<DatabaseAnimal[]> {
    const cacheKey = 'animals_all';
    const cached = cacheManager.get<DatabaseAnimal[]>(cacheKey);
    
    if (cached && this.isOnline) {
      // Return cached data immediately, but refresh in background
      this.refreshAnimalsInBackground();
      return cached;
    }

    try {
      const animals = await apiClient.get<DatabaseAnimal[]>('/animals');
      cacheManager.set(cacheKey, animals, 10 * 60 * 1000); // 10 minutes TTL
      return animals;
    } catch (error) {
      if (cached) {
        console.warn('Using cached animals data due to network error');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Sync events data
   */
  async syncEvents(): Promise<DatabaseEvent[]> {
    const cacheKey = 'events_all';
    const cached = cacheManager.get<DatabaseEvent[]>(cacheKey);
    
    if (cached && this.isOnline) {
      this.refreshEventsInBackground();
      return cached;
    }

    try {
      const events = await apiClient.get<DatabaseEvent[]>('/events');
      cacheManager.set(cacheKey, events, 5 * 60 * 1000); // 5 minutes TTL
      return events;
    } catch (error) {
      if (cached) {
        console.warn('Using cached events data due to network error');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Sync notifications data
   */
  async syncNotifications(): Promise<DatabaseNotification[]> {
    const cacheKey = 'notifications_all';
    const cached = cacheManager.get<DatabaseNotification[]>(cacheKey);
    
    if (cached && this.isOnline) {
      this.refreshNotificationsInBackground();
      return cached;
    }

    try {
      const notifications = await apiClient.get<DatabaseNotification[]>('/admin/notifications');
      cacheManager.set(cacheKey, notifications, 2 * 60 * 1000); // 2 minutes TTL
      return notifications;
    } catch (error) {
      if (cached) {
        console.warn('Using cached notifications data due to network error');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Background refresh methods
   */
  private async refreshAnimalsInBackground(): Promise<void> {
    try {
      const animals = await apiClient.get<DatabaseAnimal[]>('/animals');
      cacheManager.set('animals_all', animals, 10 * 60 * 1000);
      this.emit('data_refresh', { entityType: 'animal' });
    } catch (error) {
      console.error('Background animals refresh failed:', error);
    }
  }

  private async refreshEventsInBackground(): Promise<void> {
    try {
      const events = await apiClient.get<DatabaseEvent[]>('/events');
      cacheManager.set('events_all', events, 5 * 60 * 1000);
      this.emit('data_refresh', { entityType: 'event' });
    } catch (error) {
      console.error('Background events refresh failed:', error);
    }
  }

  private async refreshNotificationsInBackground(): Promise<void> {
    try {
      const notifications = await apiClient.get<DatabaseNotification[]>('/admin/notifications');
      cacheManager.set('notifications_all', notifications, 2 * 60 * 1000);
      this.emit('data_refresh', { entityType: 'notification' });
    } catch (error) {
      console.error('Background notifications refresh failed:', error);
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Start automatic refresh interval
   */
  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.isOnline) {
        this.refreshAnimalsInBackground();
        this.refreshEventsInBackground();
        this.refreshNotificationsInBackground();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Add operation to pending queue when offline
   */
  addPendingOperation(key: string, operation: () => Promise<unknown>): void {
    this.pendingOperations.push({ key, operation });
  }

  /**
   * Process all pending operations when back online
   */
  private async processPendingOperations(): Promise<void> {
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    for (const { operation } of operations) {
      try {
        await operation();
      } catch (error) {
        console.error('Failed to process pending operation:', error);
      }
    }
  }

  /**
   * Force refresh all data
   */
  async forceRefresh(): Promise<void> {
    cacheManager.clear();
    await Promise.all([
      this.refreshAnimalsInBackground(),
      this.refreshEventsInBackground(),
      this.refreshNotificationsInBackground()
    ]);
  }

  /**
   * Get network status
   */
  getNetworkStatus(): { isOnline: boolean; pendingOperations: number } {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.pendingOperations.length
    };
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
