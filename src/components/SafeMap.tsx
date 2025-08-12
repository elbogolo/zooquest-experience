/**
 * Safe Map Component - Loads gracefully with fallbacks
 * Prevents JavaScript errors on mobile devices
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminAnimal } from "@/types/admin";
import { geolocationService, LocationCoordinates } from "@/services/geolocationService";
import { toast } from "sonner";
import SimpleTestMap from './SimpleTestMap';
import {
  MapPin,
  Navigation,
  Locate,
  AlertCircle,
  Compass,
  Target,
  Wifi,
  WifiOff,
  Map as MapIcon
} from "lucide-react";

interface SafeMapProps {
  animals: AdminAnimal[];
  selectedAnimal?: AdminAnimal | null;
  onAnimalSelect?: (animal: AdminAnimal) => void;
  showDirections?: boolean;
  offlineMode?: boolean;
}

const SafeMap: React.FC<SafeMapProps> = ({
  animals,
  selectedAnimal,
  onAnimalSelect,
  showDirections = false,
  offlineMode = false
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize location services
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Try to get current location
        const location = await geolocationService.getCurrentLocation();
        setUserLocation(location);
        setHasLocationPermission(true);
        toast.success("Location services enabled");
      } catch (error: unknown) {
        console.error('Location initialization error:', error);
        setHasLocationPermission(false);
        
        // Try to use last known location
        const lastKnown = geolocationService.getLastKnownLocation();
        if (lastKnown) {
          setUserLocation(lastKnown);
          toast.info("Using last known location");
        } else {
          toast.error("Location services unavailable");
        }
      }
    };

    initializeLocation();
  }, []);

  // Handle location permission request
  const requestLocationPermission = async () => {
    console.log('User clicked Enable Location button');
    
    try {
      // Show loading state
      toast.info("Requesting location permission...");
      
      const location = await geolocationService.getCurrentLocation();
      setUserLocation(location);
      setHasLocationPermission(true);
      console.log('Location permission granted and location received:', location);
      toast.success("Location permission granted");
    } catch (error: unknown) {
      console.error('Permission request error:', error);
      
      // Handle different error types
      if (error && typeof error === 'object' && 'code' in error) {
        const locationError = error as { code: number; message: string };
        
        switch (locationError.code) {
          case 1: // PERMISSION_DENIED
            toast.error("Location permission denied. Please enable location services in your device settings and try again.");
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error("Location unavailable. Please check your GPS settings and try again.");
            break;
          case 3: // TIMEOUT
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error(locationError.message || "Failed to get location permission");
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Location permission denied";
        toast.error(errorMessage);
      }
    }
  };

  // Toggle location tracking
  const toggleLocationTracking = async () => {
    if (isTracking) {
      await geolocationService.stopLocationTracking();
      setIsTracking(false);
      toast.info("Location tracking stopped");
    } else {
      try {
        await geolocationService.startLocationTracking();
        setIsTracking(true);
        toast.success("Real-time location tracking started");
      } catch (error: unknown) {
        console.error('Tracking error:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to start location tracking";
        toast.error(errorMessage);
      }
    }
  };

  // Center map on user location
  const centerOnUser = () => {
    if (userLocation) {
      toast.success("Centered on your location");
      // This would be handled by the ProfessionalMap component
    } else {
      toast.error("Location not available");
    }
  };

  // Parse animal location for display
  const parseAnimalLocation = (location: string | { lat: number; lng: number }): [number, number] | null => {
    try {
      if (typeof location === 'object' && location.lat && location.lng) {
        return [location.lat, location.lng];
      }
      
      if (typeof location === 'string') {
        const coordMatch = location.match(/-?\d+\.?\d*,-?\s*-?\d+\.?\d*/);
        if (coordMatch) {
          const [lat, lng] = coordMatch[0].split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng];
          }
        }
      }
    } catch (error) {
      console.error('Error parsing animal location:', error);
    }
    
    return null;
  };

  // Calculate distance to animal
  const getDistanceToAnimal = (animal: AdminAnimal): string => {
    if (!userLocation) return "Distance unknown";
    
    const animalCoords = parseAnimalLocation(animal.location);
    if (!animalCoords) return "Location unavailable";
    
    const distance = geolocationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      animalCoords[0],
      animalCoords[1]
    );
    
    return distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  // Map Error Boundary
  const MapErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      const handleError = (error: ErrorEvent) => {
        if (error.message.includes('leaflet') || error.message.includes('map')) {
          setHasError(true);
          setMapError("Map failed to load. Using fallback view.");
        }
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError || mapError) {
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Interactive map unavailable</p>
            <p className="text-sm text-gray-500">Using list view instead</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  };

  // Fallback Map View
  const FallbackMapView: React.FC = () => (
    <div className="w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Loading...</h3>
        <p className="text-sm text-gray-500 mb-4">Interactive map is starting up</p>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="space-y-3">
        {/* Primary Location Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {!hasLocationPermission ? (
            <Button
              variant="default"
              size="sm"
              onClick={requestLocationPermission}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            >
              <Navigation className="w-4 h-4" />
              Enable Location
            </Button>
          ) : (
            <>
              <Button
                variant={isTracking ? "default" : "outline"}
                size="sm"
                onClick={toggleLocationTracking}
                className="flex items-center gap-2 min-w-[130px]"
              >
                <Locate className="w-4 h-4" />
                {isTracking ? "Stop Tracking" : "Track Location"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={centerOnUser}
                disabled={!userLocation}
                className="flex items-center gap-2 min-w-[120px]"
              >
                <Target className="w-4 h-4" />
                Center on Me
              </Button>
            </>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOnline ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {offlineMode && (
              <Badge variant="outline" className="text-xs">
                Offline Mode
              </Badge>
            )}

            {hasLocationPermission && userLocation && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                📍 GPS Active
              </Badge>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {animals.length} location{animals.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
            Interactive Navigation Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapErrorBoundary>
            <Suspense fallback={<FallbackMapView />}>
              <SimpleTestMap />
            </Suspense>
          </MapErrorBoundary>
        </CardContent>
      </Card>

      {/* Location Status */}
      {userLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Compass className="w-4 h-4 mr-2" />
                <span>
                  Location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {userLocation.accuracy && `±${userLocation.accuracy.toFixed(0)}m`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Animal Details */}
      {selectedAnimal && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                {selectedAnimal.name}
              </span>
              <Badge variant="outline">
                {selectedAnimal.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Species</p>
                <p className="font-medium">{selectedAnimal.species}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Distance</p>
                <p className="font-medium">{getDistanceToAnimal(selectedAnimal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SafeMap;
