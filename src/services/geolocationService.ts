/**
 * Geolocation Service for ZooQuest Experience
 * Handles GPS tracking, location updates, and offline capabilities
 * Enhanced for Capacitor mobile apps
 */

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class GeolocationService {
  private watchId: string | number | null = null;
  private lastKnownLocation: LocationCoordinates | null = null;
  private locationCallbacks: ((location: LocationCoordinates) => void)[] = [];
  private errorCallbacks: ((error: LocationError) => void)[] = [];
  private isCapacitor = Capacitor.isNativePlatform();

  /**
   * Request location permissions (for mobile)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.isCapacitor) {
        // First check current permission status
        console.log('Checking current permission status...');
        const currentPermission = await Geolocation.checkPermissions();
        console.log('Current permission status:', currentPermission);
        
        // If already granted, return true
        if (currentPermission.location === 'granted') {
          console.log('Location permission already granted');
          return true;
        }
        
        // If denied, try requesting permission
        if (currentPermission.location === 'denied' || currentPermission.location === 'prompt') {
          console.log('Requesting location permission...');
          const permission = await Geolocation.requestPermissions();
          console.log('Permission request result:', permission);
          
          const isGranted = permission.location === 'granted';
          console.log('Permission granted:', isGranted);
          return isGranted;
        }
        
        console.log('Permission in unknown state:', currentPermission.location);
        return false;
      }
      
      // Web browsers handle permissions automatically
      console.log('Running on web platform, permissions handled automatically');
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Get current user location
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    try {
      // Request permissions first on mobile
      if (this.isCapacitor) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          throw {
            code: 1,
            message: 'Location permission denied. Please enable location services in app settings.'
          };
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });

        const location: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        this.lastKnownLocation = location;
        this.saveLocationToStorage(location);
        return location;
      } else {
        // Web browser geolocation
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject({
              code: 0,
              message: 'Geolocation is not supported by this browser.'
            });
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location: LocationCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy || undefined,
                timestamp: Date.now()
              };
              
              this.lastKnownLocation = location;
              this.saveLocationToStorage(location);
              resolve(location);
            },
            (error) => {
              const locationError: LocationError = {
                code: error.code,
                message: this.getErrorMessage(error.code)
              };
              reject(locationError);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 60000
            }
          );
        });
      }
    } catch (error: unknown) {
      console.error('getCurrentLocation error:', error);
      
      // Type guard for error objects with code property
      const getErrorCode = (err: unknown): number => {
        if (err && typeof err === 'object' && 'code' in err) {
          const code = (err as { code: unknown }).code;
          return typeof code === 'number' ? code : 0;
        }
        return 0;
      };
      
      throw {
        code: getErrorCode(error),
        message: error instanceof Error ? error.message : 'Failed to get current location'
      };
    }
  }

  /**
   * Start watching user location for real-time tracking
   */
  async startLocationTracking(): Promise<void> {
    try {
      if (this.isCapacitor) {
        // Request permissions first on mobile
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          this.notifyError({
            code: 1,
            message: 'Location permission denied. Please enable location services in app settings.'
          });
          return;
        }

        this.watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          },
          (position, err) => {
            if (err) {
              console.error('Watch position error:', err);
              this.notifyError({
                code: err.code || 0,
                message: err.message || 'Location tracking error'
              });
              return;
            }

            if (position) {
              const location: LocationCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
              };
              
              this.lastKnownLocation = location;
              this.saveLocationToStorage(location);
              this.notifyLocationUpdate(location);
            }
          }
        );
      } else {
        // Web browser geolocation
        if (!navigator.geolocation) {
          this.notifyError({
            code: 0,
            message: 'Geolocation is not supported by this browser.'
          });
          return;
        }

        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location: LocationCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || undefined,
              timestamp: Date.now()
            };
            
            this.lastKnownLocation = location;
            this.saveLocationToStorage(location);
            this.notifyLocationUpdate(location);
          },
          (error) => {
            const locationError: LocationError = {
              code: error.code,
              message: this.getErrorMessage(error.code)
            };
            this.notifyError(locationError);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
      }
    } catch (error: unknown) {
      console.error('startLocationTracking error:', error);
      
      // Type guard for error objects with code property
      const getErrorCode = (err: unknown): number => {
        if (err && typeof err === 'object' && 'code' in err) {
          const code = (err as { code: unknown }).code;
          return typeof code === 'number' ? code : 0;
        }
        return 0;
      };
      
      this.notifyError({
        code: getErrorCode(error),
        message: error instanceof Error ? error.message : 'Failed to start location tracking'
      });
    }
  }

  /**
   * Stop location tracking
   */
  async stopLocationTracking(): Promise<void> {
    if (this.watchId !== null) {
      try {
        if (this.isCapacitor) {
          await Geolocation.clearWatch({ id: this.watchId as string });
        } else {
          navigator.geolocation.clearWatch(this.watchId as number);
        }
        this.watchId = null;
      } catch (error) {
        console.error('Error stopping location tracking:', error);
      }
    }
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: (location: LocationCoordinates) => void): () => void {
    this.locationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.locationCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to location errors
   */
  onLocationError(callback: (error: LocationError) => void): () => void {
    this.errorCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get last known location (useful for offline scenarios)
   */
  getLastKnownLocation(): LocationCoordinates | null {
    if (this.lastKnownLocation) {
      return this.lastKnownLocation;
    }

    // Try to get from storage
    const stored = localStorage.getItem('zooquest_last_location');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }

    return null;
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Calculate bearing from one point to another
   */
  calculateBearing(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  }

  /**
   * Check if location is within zoo bounds (configurable)
   */
  isWithinZooBounds(location: LocationCoordinates): boolean {
    // Example zoo bounds - replace with actual zoo coordinates
    const zooBounds = {
      north: 40.7589,
      south: 40.7489,
      east: -73.9741,
      west: -73.9841
    };

    return (
      location.latitude >= zooBounds.south &&
      location.latitude <= zooBounds.north &&
      location.longitude >= zooBounds.west &&
      location.longitude <= zooBounds.east
    );
  }

  private notifyLocationUpdate(location: LocationCoordinates): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  private notifyError(error: LocationError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }

  private saveLocationToStorage(location: LocationCoordinates): void {
    try {
      localStorage.setItem('zooquest_last_location', JSON.stringify(location));
    } catch (error) {
      console.error('Error saving location to storage:', error);
    }
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location permission denied. Please enable location services in app settings.';
      case 2:
        return 'Position unavailable. Unable to determine your location.';
      case 3:
        return 'Location request timeout. Please try again.';
      default:
        return 'An unknown error occurred while getting your location.';
    }
  }
}

export const geolocationService = new GeolocationService();
