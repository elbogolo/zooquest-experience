
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

interface UseRoutePathProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  isLoaded: boolean;
  selectedLocation: string | null;
  userLocation: [number, number];
  locations: Record<string, { coordinates: [number, number], name: string }>;
}

interface UseRoutePathReturn {
  directions: string[];
  isRouteFetching: boolean;
  distance: string | null;
  duration: string | null;
}

export const useRoutePath = ({
  map,
  isLoaded,
  selectedLocation,
  userLocation,
  locations
}: UseRoutePathProps): UseRoutePathReturn => {
  const [directions, setDirections] = useState<string[]>([]);
  const [isRouteFetching, setIsRouteFetching] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  // Draw path and get directions between user and selected location
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

      setIsRouteFetching(true);
      
      // Call the Mapbox Directions API
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[0]},${userLocation[1]};${destination.coordinates[0]},${destination.coordinates[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.code === 'Ok') {
            // Get route data
            const route = data.routes[0];
            const routeGeometry = route.geometry;
            
            // Add route to map
            if (map.current) {
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: routeGeometry
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
                  'line-dasharray': [0.5, 1.5]
                }
              });
              
              // Move camera to show the route
              const bounds = new mapboxgl.LngLatBounds()
                .extend(userLocation)
                .extend(destination.coordinates);
              
              map.current.fitBounds(bounds, {
                padding: 100,
                duration: 1000
              });
            }
            
            // Format and store directions
            const stepDirections = route.legs[0].steps.map((step: any) => {
              return step.maneuver.instruction;
            });
            
            setDirections(stepDirections);
            
            // Calculate and format distance
            const distanceInKm = route.distance / 1000;
            setDistance(distanceInKm < 1 
              ? `${Math.round(route.distance)} meters` 
              : `${distanceInKm.toFixed(1)} km`);
            
            // Calculate and format duration
            const durationInMin = Math.ceil(route.duration / 60);
            setDuration(`${durationInMin} min`);
          } else {
            toast.error("Could not find a route to this location");
            setDirections([]);
            setDistance(null);
            setDuration(null);
          }
          setIsRouteFetching(false);
        })
        .catch(error => {
          console.error("Error fetching directions:", error);
          toast.error("Error getting directions");
          setIsRouteFetching(false);
          setDirections([]);
          setDistance(null);
          setDuration(null);
        });
    } else {
      setDirections([]);
      setDistance(null);
      setDuration(null);
    }

    return () => {
      // Clean up route on unmount
      if (map.current) {
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
      }
    };
  }, [selectedLocation, isLoaded, userLocation, locations, map]);

  return {
    directions,
    isRouteFetching,
    distance,
    duration
  };
};
