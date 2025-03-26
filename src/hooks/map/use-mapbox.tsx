
import { useState } from 'react';
import { useMapInitialization } from './use-map-initialization';
import { useUserMarker } from './use-user-marker';
import { useLocationMarkers, MapLocation } from './use-location-markers';
import { useRoutePath } from './use-route-path';
import { useMapControls } from './use-map-controls';

interface UseMapboxProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  locations: Record<string, MapLocation>;
}

interface UseMapboxReturn {
  mapContainer: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  selectLocation: (locationId: string | null) => void;
  selectedLocation: string | null;
  resetView: () => void;
  updateUserLocation: () => void;
  filterLocations: (type: 'all' | 'animal' | 'event' | 'facility') => void;
}

export const useMapbox = ({
  initialCenter = [-73.980, 40.730],
  initialZoom = 15,
  locations
}: UseMapboxProps): UseMapboxReturn => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'animal' | 'event' | 'facility'>('all');
  
  // Initialize the map
  const { mapContainer, map, isLoaded } = useMapInitialization({
    initialCenter,
    initialZoom
  });

  // Initialize user location (simulated for demo)
  const userInitialLocation: [number, number] = [initialCenter[0] - 0.003, initialCenter[1] - 0.002];
  
  // Handle user marker
  const { userLocation, updateUserLocation } = useUserMarker({
    map,
    isLoaded,
    initialUserLocation: userInitialLocation
  });

  // Handle location markers
  useLocationMarkers({
    map,
    isLoaded,
    locations,
    currentFilter,
    selectedLocation,
    onLocationSelect: (locationId) => setSelectedLocation(locationId)
  });

  // Handle route path drawing
  useRoutePath({
    map,
    isLoaded,
    selectedLocation,
    userLocation,
    locations
  });

  // Map controls
  const { resetView } = useMapControls({
    map,
    initialCenter,
    initialZoom
  });

  // Function to select a location
  const selectLocation = (locationId: string | null) => {
    setSelectedLocation(locationId);
  };

  // Function to filter locations by type
  const filterLocations = (type: 'all' | 'animal' | 'event' | 'facility') => {
    setCurrentFilter(type);
  };

  return {
    mapContainer,
    isLoaded,
    selectLocation,
    selectedLocation,
    resetView,
    updateUserLocation,
    filterLocations
  };
};

// Re-export the MapLocation type for use in other components
export type { MapLocation } from './use-location-markers';
