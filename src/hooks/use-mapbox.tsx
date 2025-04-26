
import { useState, useEffect, useRef, useCallback } from 'react';
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

// Type for a step in the directions
type DirectionStep = {
  instruction: string;
  distance: number;
  duration: number;
};

interface UseMapboxReturn {
  mapContainer: React.RefObject<HTMLDivElement>;
  isLoaded: boolean;
  selectLocation: (locationId: string | null) => void;
  selectedLocation: string | null;
  resetView: () => void;
  updateUserLocation: () => void;
  filterLocations: (type: 'all' | 'animal' | 'event' | 'facility') => void;
  isLocating: boolean;
  directions: DirectionStep[];
  isRouteFetching: boolean;
  routeDistance: string;
  routeDuration: string;
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
  const [isLocating, setIsLocating] = useState(false);
  const [directions, setDirections] = useState<DirectionStep[]>([]);
  const [isRouteFetching, setIsRouteFetching] = useState(false);
  const [routeDistance, setRouteDistance] = useState('0 m');
  const [routeDuration, setRouteDuration] = useState('0 min');
  
  // User location (simulated for demo)
  const [userLocation, setUserLocation] = useState<[number, number]>([initialCenter[0] - 0.003, initialCenter[1] - 0.002]);

  // Function to select a location
  const selectLocation = useCallback((locationId: string | null) => {
    setSelectedLocation(locationId);
  }, []);

  // Mock function to fetch directions from Mapbox directions API
  const fetchDirections = useCallback(async (start: [number, number], end: [number, number]) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate intermediate points for a more realistic path
    const pointCount = Math.floor(Math.random() * 3) + 2;
    const points: [number, number][] = [start];
    
    for (let i = 1; i <= pointCount; i++) {
      const fraction = i / (pointCount + 1);
      const lat = start[1] + (end[1] - start[1]) * fraction;
      const lng = start[0] + (end[0] - start[0]) * fraction;
      
      // Add some randomness
      const jitter = 0.0008 * (Math.random() - 0.5);
      points.push([lng + jitter, lat + jitter]);
    }
    
    points.push(end);
    
    // Create direction steps
    const steps: DirectionStep[] = [];
    const directions = [
      'Head northwest on Zoo Main Path',
      'Turn right at the gift shop',
      'Continue past the food court',
      'At the fountain, turn left',
      'Follow signs for the animal exhibit',
      'Turn right at the information booth',
      'Continue straight ahead'
    ];
    
    // Generate 3-5 random steps
    const stepCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < stepCount; i++) {
      steps.push({
        instruction: directions[Math.floor(Math.random() * directions.length)],
        distance: Math.floor(100 + Math.random() * 300),
        duration: Math.floor(2 + Math.random() * 5)
      });
    }
    
    // Calculate total distance and duration
    const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0);
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    
    return {
      geometry: {
        type: 'LineString' as const,
        coordinates: points
      },
      steps,
      distance: `${totalDistance} m`,
      duration: `${totalDuration} min`
    };
  }, []);

  // Function to add location markers to the map
  const addMarkers = useCallback(() => {
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
  }, [map, locations, currentFilter, selectedLocation, selectLocation]);

  // Update markers when filter changes
  useEffect(() => {
    if (isLoaded) {
      addMarkers();
    }
  }, [isLoaded, addMarkers]);

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

      // Fetch directions from Mapbox API (simulation for demo)
      setIsRouteFetching(true);
      fetchDirections(userLocation, destination.coordinates as [number, number])
        .then(routeData => {
          if (!map.current) return;

          // Add route to map
          if (routeData.geometry) {
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeData.geometry
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
                'line-dasharray': [0.5, 1]
              }
            });

            // Set directions, distance and duration
            setDirections(routeData.steps);
            setRouteDistance(routeData.distance);
            setRouteDuration(routeData.duration);
          } else {
            // Fallback to simple route if directions API fails
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

            // Generate simulated directions
            setDirections([
              ...destination.directions.map((instruction, i) => ({
                instruction,
                distance: Math.floor(100 + Math.random() * 300),
                duration: Math.floor(2 + Math.random() * 5)
              }))
            ]);
            setRouteDistance(`${Math.floor(Math.random() * 500 + 200)} m`);
            setRouteDuration(`${Math.floor(Math.random() * 10 + 5)} min`);
          }

          // Move camera to show both points
          const bounds = new mapboxgl.LngLatBounds()
            .extend(userLocation)
            .extend(destination.coordinates as [number, number]);

          map.current.fitBounds(bounds, {
            padding: 100,
            duration: 1000
          });

          setIsRouteFetching(false);
        })
        .catch(error => {
          console.error('Error fetching directions:', error);
          setIsRouteFetching(false);
        });
    } else {
      // Clear directions when no location is selected
      setDirections([]);
      setRouteDistance('0 m');
      setRouteDuration('0 min');
    }
  }, [selectedLocation, isLoaded, userLocation, locations, map, fetchDirections]);

  // Function to reset the map view
  const resetView = useCallback(() => {
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
  }, [map, initialCenter, initialZoom]);



  // Function to update user location (simulated)
  const updateUserLocation = useCallback(() => {
    if (!map.current || !userMarker.current) return;
    
    setIsLocating(true);
    
    // Simulate geolocation delay
    setTimeout(() => {
      // Generate a slightly randomized location
      const newLocation: [number, number] = [
        userLocation[0] + (Math.random() * 0.001 - 0.0005),
        userLocation[1] + (Math.random() * 0.001 - 0.0005)
      ];
      
      setUserLocation(newLocation);
      userMarker.current?.setLngLat(newLocation);
      
      // Fly to the user's location
      map.current?.flyTo({
        center: newLocation,
        zoom: 17,
        duration: 1000
      });
      
      // Update route if a location is selected
      if (selectedLocation) {
        // Trigger the effect to recalculate the route
        const currentSelected = selectedLocation;
        setSelectedLocation(null);
        setTimeout(() => setSelectedLocation(currentSelected), 50);
      }
      
      setIsLocating(false);
    }, 1500);
  }, [map, userMarker, userLocation, selectedLocation, setSelectedLocation]);

  // Function to filter locations by type
  const filterLocations = useCallback((type: 'all' | 'animal' | 'event' | 'facility') => {
    setCurrentFilter(type);
  }, [setCurrentFilter]);

  return {
    mapContainer,
    isLoaded,
    selectLocation,
    selectedLocation,
    resetView,
    updateUserLocation,
    filterLocations,
    isLocating,
    directions,
    isRouteFetching,
    routeDistance,
    routeDuration
  };
};
