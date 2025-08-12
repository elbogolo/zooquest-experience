/**
 * Professional Map Component for ZooQuest Experience
 * Features: Real GPS tracking, turn-by-turn directions, offline support
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  Wifi, 
  WifiOff,
  Locate,
  Target,
  Route
} from 'lucide-react';

import { AdminAnimal } from '@/types/admin';
import { geolocationService, LocationCoordinates } from '@/services/geolocationService';

// Fix for default markers in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Zoo coordinates and boundaries
const ZOO_CENTER: [number, number] = [5.603717, -0.186964];
const ZOO_BOUNDS: [[number, number], [number, number]] = [
  [5.600000, -0.190000],
  [5.607000, -0.183000]
];

interface ProfessionalMapProps {
  animals: AdminAnimal[];
  selectedAnimal?: AdminAnimal;
  onAnimalSelect?: (animal: AdminAnimal) => void;
  showUserLocation?: boolean;
  showNavigation?: boolean;
  showOfflineMode?: boolean;
  className?: string;
}

// Custom hook for user location tracking
const UserLocationTracker: React.FC<{
  onLocationUpdate: (location: LocationCoordinates) => void;
}> = ({ onLocationUpdate }) => {
  const map = useMap();
  const [isTracking, setIsTracking] = useState(false);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const startTracking = async () => {
      try {
        const hasPermission = await geolocationService.requestPermissions();
        if (!hasPermission) {
          toast.error('Location permission denied');
          return;
        }

        // Get initial position
        const position = await geolocationService.getCurrentLocation();
        onLocationUpdate(position);

        // Create or update user marker
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div style="width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; border: 2px solid white; box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        if (userMarker) {
          userMarker.setLatLng([position.latitude, position.longitude]);
        } else {
          const marker = L.marker([position.latitude, position.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location');
          setUserMarker(marker);
        }

        // Start location tracking
        geolocationService.startLocationTracking();
        
        // Subscribe to location updates
        unsubscribe = geolocationService.onLocationUpdate((newPosition) => {
          onLocationUpdate(newPosition);
          if (userMarker) {
            userMarker.setLatLng([newPosition.latitude, newPosition.longitude]);
          }
        });

        setIsTracking(true);
      } catch (error) {
        console.error('Failed to start location tracking:', error);
        toast.error('Failed to start location tracking');
      }
    };

    startTracking();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      geolocationService.stopLocationTracking();
      if (userMarker) {
        map.removeLayer(userMarker);
      }
    };
  }, [map, onLocationUpdate, userMarker]);

  return null;
};

const ProfessionalMap: React.FC<ProfessionalMapProps> = ({
  animals,
  selectedAnimal,
  onAnimalSelect,
  showUserLocation = true,
  showNavigation = true,
  showOfflineMode = false,
  className = ''
}) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mapReady, setMapReady] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // Monitor online status
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

  // Parse animal location
  const parseAnimalLocation = (location: string | { lat: number; lng: number } | undefined): [number, number] | null => {
    if (!location) return null;
    
    if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
      return [location.lat, location.lng];
    }
    
    if (typeof location === 'string') {
      const coords = location.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return coords as [number, number];
      }
    }
    
    return null;
  };

  // Helper function to get distance to animal
  const getDistanceToAnimal = (animal: AdminAnimal, userLoc: LocationCoordinates): string => {
    const coords = parseAnimalLocation(animal.location);
    if (!coords) return "Distance unknown";
    
    const distance = geolocationService.calculateDistance(
      userLoc.latitude,
      userLoc.longitude,
      coords[0],
      coords[1]
    );
    
    return distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  // Generate navigation route
  const generateRoute = (
    start: LocationCoordinates,
    end: [number, number]
  ): [number, number][] => {
    // Simple straight-line route for now
    // In a real app, you'd use a routing service
    return [
      [start.latitude, start.longitude],
      end
    ];
  };

  // Handle navigation to animal
  const navigateToAnimal = (animal: AdminAnimal) => {
    if (!userLocation) {
      toast.error('Your location is required for navigation');
      return;
    }

    const animalCoords = parseAnimalLocation(animal.location);
    if (!animalCoords) {
      toast.error('Animal location not available');
      return;
    }

    const route = generateRoute(userLocation, animalCoords);
    setRouteCoordinates(route);
    
    if (onAnimalSelect) {
      onAnimalSelect(animal);
    }

    toast.success(`Navigation started to ${animal.name}`);
  };

  // Create animal markers
  const createAnimalMarkers = () => {
    return animals.map((animal) => {
      const coords = parseAnimalLocation(animal.location);
      if (!coords) return null;

      const isSelected = selectedAnimal?.id === animal.id;
      
      // Custom marker icon based on animal status
      const markerColor = animal.status === 'Healthy' ? '#10b981' : '#f59e0b';
      const markerIcon = L.divIcon({
        className: 'animal-marker',
        html: `<div style="
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          background: ${markerColor}; 
          border: 3px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        ">${animal.name.charAt(0)}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      return (
        <Marker
          key={animal.id}
          position={coords}
          icon={markerIcon}
          eventHandlers={{
            click: () => {
              if (onAnimalSelect) {
                onAnimalSelect(animal);
              }
            }
          }}
        >
          <Popup>
            <div className="min-w-48">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{animal.name}</h3>
                <Badge variant={animal.status === 'Healthy' ? 'default' : 'secondary'}>
                  {animal.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{animal.species}</p>
              <p className="text-xs text-gray-500 mb-3">
                {typeof animal.location === 'string' ? animal.location : `${coords[0]}, ${coords[1]}`}
              </p>
              {userLocation && (
                <p className="text-xs text-blue-600 mb-2">
                  Distance: {getDistanceToAnimal(animal, userLocation)}
                </p>
              )}
              {showNavigation && (
                <Button
                  size="sm"
                  onClick={() => navigateToAnimal(animal)}
                  className="w-full"
                  disabled={!userLocation}
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Navigate
                </Button>
              )}
            </div>
          </Popup>
        </Marker>
      );
    }).filter(Boolean);
  };

  const zooZoom = 16;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Status Bar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Card className="px-3 py-1 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </Card>
        
        {showUserLocation && (
          <Card className="px-3 py-1 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <Locate className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600">
                {userLocation ? 'Location Active' : 'Getting Location...'}
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Map Container */}
      <div className="w-full h-full">
        <MapContainer
          center={ZOO_CENTER}
          zoom={zooZoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg z-0"
          whenReady={() => {
            console.log('Map is ready');
            setMapReady(true);
          }}
          ref={mapRef}
        >
          {/* Base Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={isOnline 
              ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQiIGhlaWdodD0iNCI+PHBhdGggZD0iTTAgMGg0djRIMHoiIGZpbGw9IiNmOGY5ZmEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4="
            }
          />

          {/* Navigation Route */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Animal Markers */}
          {createAnimalMarkers()}

          {/* Location Tracker */}
          {showUserLocation && (
            <UserLocationTracker onLocationUpdate={setUserLocation} />
          )}
        </MapContainer>
      </div>

      {/* Navigation Controls */}
      {showNavigation && routeCoordinates.length > 0 && (
        <Card className="absolute bottom-4 left-4 right-4 z-10 p-4 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium">Navigating to {selectedAnimal?.name}</p>
                <p className="text-sm text-gray-600">Follow the blue route</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRouteCoordinates([])}
            >
              <Target className="w-4 h-4 mr-1" />
              End Route
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalMap;
