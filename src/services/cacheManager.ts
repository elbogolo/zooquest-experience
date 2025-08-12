/**
 * Cache Manager for ZooQuest Experience
 * Handles data caching, invalidation, and automatic refresh
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  refreshCallback?: () => Promise<T>;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private refreshCallbacks = new Map<string, (() => Promise<unknown>)[]>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL, refreshCallback?: () => Promise<T>): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      refreshCallback
    };
    this.cache.set(key, entry);
  }

  /**
   * Get data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.triggerRefresh(key);
  }

  /**
   * Invalidate multiple cache entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.triggerRefresh(key);
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Register a refresh callback for automatic data updates
   */
  registerRefreshCallback<T>(key: string, callback: () => Promise<T>): void {
    if (!this.refreshCallbacks.has(key)) {
      this.refreshCallbacks.set(key, []);
    }
    this.refreshCallbacks.get(key)!.push(callback as () => Promise<unknown>);
  }

  /**
   * Trigger refresh callbacks for a specific key
   */
  private async triggerRefresh(key: string): Promise<void> {
    const callbacks = this.refreshCallbacks.get(key);
    if (callbacks) {
      await Promise.all(callbacks.map(callback => callback().catch(console.error)));
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; expired: number; valid: number } {
    let expired = 0;
    let valid = 0;

    this.cache.forEach((entry) => {
      if (Date.now() > entry.expiry) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      size: this.cache.size,
      expired,
      valid
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Setup automatic cleanup every 5 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);
