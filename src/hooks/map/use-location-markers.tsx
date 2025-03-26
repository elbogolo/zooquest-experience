
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

export type MapLocation = {
  id: string;
  name: string;
  image: string;
  distance: string;
  coordinates: [number, number]; // [longitude, latitude]
  directions: string[];
  type: 'animal' | 'event' | 'facility';
};

interface UseLocationMarkersProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  isLoaded: boolean;
  locations: Record<string, MapLocation>;
  currentFilter: 'all' | 'animal' | 'event' | 'facility';
  selectedLocation: string | null;
  onLocationSelect: (locationId: string) => void;
}

export const useLocationMarkers = ({
  map,
  isLoaded,
  locations,
  currentFilter,
  selectedLocation,
  onLocationSelect
}: UseLocationMarkersProps) => {
  const markers = useRef<Record<string, mapboxgl.Marker>>({});

  // Add and update markers when dependencies change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Filter locations based on current filter
    const filteredLocations = Object.entries(locations).filter(([_, location]) => {
      return currentFilter === 'all' || location.type === currentFilter;
    });

    // Add markers for each location
    filteredLocations.forEach(([id, location]) => {
      const { coordinates, type, name } = location;
      
      // Create custom element for marker
      const el = document.createElement('div');
      el.className = 'location-marker';
      
      // Set marker HTML based on type
      el.innerHTML = `
        <div class="rounded-full flex items-center justify-center shadow-lg w-8 h-8 
          ${type === 'animal' ? 'bg-zoo-primary' : 
          type === 'event' ? 'bg-orange-500' : 'bg-blue-500'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        ${id === selectedLocation ? '<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zoo-primary animate-pulse"></div>' : ''}
      `;
      
      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${name}</h3>
          <p class="text-xs text-gray-500">${location.distance} walk</p>
        </div>
      `);

      // Create and store marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current);
      
      markers.current[id] = marker;
      
      // Add click event
      el.addEventListener('click', () => {
        onLocationSelect(id);
      });
    });

    return () => {
      // Clean up markers on unmount or deps change
      Object.values(markers.current).forEach(marker => marker.remove());
      markers.current = {};
    };
  }, [currentFilter, isLoaded, locations, map, onLocationSelect, selectedLocation]);

  return { markers };
};
