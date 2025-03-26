
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface UseRoutePathProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  isLoaded: boolean;
  selectedLocation: string | null;
  userLocation: [number, number];
  locations: Record<string, { coordinates: [number, number] }>;
}

export const useRoutePath = ({
  map,
  isLoaded,
  selectedLocation,
  userLocation,
  locations
}: UseRoutePathProps) => {
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
              destination.coordinates
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
        .extend(destination.coordinates);

      map.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
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
};
