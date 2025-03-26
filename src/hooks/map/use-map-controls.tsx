
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface UseMapControlsProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  initialCenter: [number, number];
  initialZoom: number;
}

interface UseMapControlsReturn {
  resetView: () => void;
}

export const useMapControls = ({
  map,
  initialCenter,
  initialZoom
}: UseMapControlsProps): UseMapControlsReturn => {
  // Function to reset the map view
  const resetView = useCallback(() => {
    if (!map.current) return;
    
    // Reset map view
    map.current.flyTo({
      center: initialCenter,
      zoom: initialZoom,
      pitch: 30,
      duration: 1000
    });
  }, [initialCenter, initialZoom, map]);

  return {
    resetView
  };
};
