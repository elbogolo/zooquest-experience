
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxib2dvbG8iLCJhIjoiY204cDBsZXk2MDVicjJwczg4djRoMDN5NCJ9.RwQh6G5BjnLVt8sYZBGYDw';

type MapLocation = {
  id: string;
  name: string;
  image: string;
  distance: string;
  coordinates: [number, number]; // [longitude, latitude]
  directions: string[];
  type: 'animal' | 'event' | 'facility';
};

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
  initialCenter = [-73.980, 40.730], // Default center (can be updated to zoo coordinates)
  initialZoom = 15,
  locations
}: UseMapboxProps): UseMapboxReturn => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Record<string, mapboxgl.Marker>>({});
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'animal' | 'event' | 'facility'>('all');
  
  // User location (simulated for demo)
  const [userLocation, setUserLocation] = useState<[number, number]>([initialCenter[0] - 0.003, initialCenter[1] - 0.002]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter,
      zoom: initialZoom,
      pitch: 30,
    });

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Handle map load
    newMap.on('load', () => {
      map.current = newMap;
      setIsLoaded(true);

      // Add user marker
      const userElement = document.createElement('div');
      userElement.className = 'user-marker';
      userElement.innerHTML = `
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation text-white"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-600"></div>
      `;
      
      userMarker.current = new mapboxgl.Marker({ element: userElement })
        .setLngLat(userLocation)
        .addTo(newMap);

      // Add location markers
      addMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Function to add location markers to the map
  const addMarkers = () => {
    if (!map.current) return;

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
        .setLngLat(coordinates as [number, number])
        .setPopup(popup)
        .addTo(map.current);
      
      markers.current[id] = marker;
      
      // Add click event
      el.addEventListener('click', () => {
        selectLocation(id);
      });
    });
  };

  // Update markers when filter changes
  useEffect(() => {
    if (isLoaded) {
      addMarkers();
    }
  }, [currentFilter, isLoaded, selectedLocation]);

  // Draw path between user and selected location
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove previous path if it exists
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    if (selectedLocation) {
      const destination = locations[selectedLocation];
      if (!destination) return;

      // Add path to map
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              userLocation,
              destination.coordinates as [number, number]
            ]
          }
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#4FD1C5',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });

      // Move camera to show both points
      const bounds = new mapboxgl.LngLatBounds()
        .extend(userLocation)
        .extend(destination.coordinates as [number, number]);

      map.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
    }
  }, [selectedLocation, isLoaded, userLocation]);

  // Function to select a location
  const selectLocation = (locationId: string | null) => {
    setSelectedLocation(locationId);
  };

  // Function to reset the map view
  const resetView = () => {
    if (!map.current) return;
    
    // Clear selected location
    setSelectedLocation(null);
    
    // Reset map view
    map.current.flyTo({
      center: initialCenter,
      zoom: initialZoom,
      pitch: 30,
      duration: 1000
    });
  };

  // Function to update user location (simulated)
  const updateUserLocation = () => {
    if (!map.current || !userMarker.current) return;
    
    // Generate a slightly randomized location
    const newLocation: [number, number] = [
      userLocation[0] + (Math.random() * 0.001 - 0.0005),
      userLocation[1] + (Math.random() * 0.001 - 0.0005)
    ];
    
    setUserLocation(newLocation);
    userMarker.current.setLngLat(newLocation);

    // Update path if a location is selected
    if (selectedLocation && map.current.getSource('route')) {
      const destination = locations[selectedLocation];
      (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            newLocation,
            destination.coordinates as [number, number]
          ]
        }
      });
    }
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
