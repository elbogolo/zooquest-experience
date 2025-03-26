
import { useState, useEffect, useRef, MutableRefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxib2dvbG8iLCJhIjoiY204cDBsZXk2MDVicjJwczg4djRoMDN5NCJ9.RwQh6G5BjnLVt8sYZBGYDw';

interface UseMapInitializationProps {
  initialCenter: [number, number];
  initialZoom: number;
}

interface UseMapInitializationReturn {
  mapContainer: React.RefObject<HTMLDivElement>;
  map: MutableRefObject<mapboxgl.Map | null>;
  isLoaded: boolean;
}

export const useMapInitialization = ({
  initialCenter,
  initialZoom
}: UseMapInitializationProps): UseMapInitializationReturn => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  return { mapContainer, map, isLoaded };
};
