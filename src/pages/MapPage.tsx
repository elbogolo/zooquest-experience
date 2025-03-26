
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Navigation, MapPin, Compass, X, RotateCcw, Search, AlertCircle, Route } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import SearchBar from "../components/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMapbox } from "@/hooks/use-mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

// Enhanced zoo locations data with more details and proper coordinates
const zooLocations = {
  lion: {
    id: "lion",
    name: "Lion Enclosure",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    distance: "10 Min",
    coordinates: [-73.975, 40.733] as [number, number], // Fixed with tuple type
    directions: ["Head north from the main entrance", "Turn right at the food court", "The lion enclosure will be on your left"],
    type: "animal" as const
  },
  tiger: {
    id: "tiger",
    name: "Tiger Territory",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    distance: "15 Min",
    coordinates: [-73.977, 40.731] as [number, number], // Fixed with tuple type
    directions: ["Head east from the main entrance", "Follow the path past the elephant enclosure", "Tiger Territory is ahead on the right"],
    type: "animal" as const
  },
  gorilla: {
    id: "gorilla",
    name: "Gorilla Habitat",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    distance: "20 Min",
    coordinates: [-73.981, 40.734] as [number, number], // Fixed with tuple type
    directions: ["Head west from the main entrance", "Take the jungle trail", "Follow signs to the Great Ape House"],
    type: "animal" as const
  },
  peacock: {
    id: "peacock",
    name: "Peacock Area",
    image: "public/lovable-uploads/d65de9b2-e507-4511-a47c-4962de992a26.png",
    distance: "5 Min",
    coordinates: [-73.979, 40.729] as [number, number], // Fixed with tuple type
    directions: ["Head straight from the main entrance", "Look for the open garden area", "Peacocks roam freely in this area"],
    type: "animal" as const
  },
  crocodile: {
    id: "crocodile",
    name: "Crocodile Pond",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    distance: "12 Min",
    coordinates: [-73.973, 40.732] as [number, number], // Fixed with tuple type
    directions: ["Head southeast from the main entrance", "Follow the water trail", "The crocodile pond will be visible on your right"],
    type: "animal" as const
  },
  tortoise: {
    id: "tortoise",
    name: "Tortoise Enclosure",
    image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
    distance: "8 Min",
    coordinates: [-73.976, 40.735] as [number, number], // Fixed with tuple type
    directions: ["Head northeast from the main entrance", "Pass by the gift shop", "The tortoise enclosure is beyond the small hill"],
    type: "animal" as const
  },
  zebra: {
    id: "zebra",
    name: "Zebra Grasslands",
    image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
    distance: "18 Min",
    coordinates: [-73.982, 40.730] as [number, number], // Fixed with tuple type
    directions: ["Head northwest from the main entrance", "Follow the safari path", "The zebra grasslands will be on your left"],
    type: "animal" as const
  },
  shop: {
    id: "shop",
    name: "Gift Shop",
    image: "public/lovable-uploads/e75bf6ec-5927-4fae-9fff-7807edd185ad.png",
    distance: "5 Min",
    coordinates: [-73.978, 40.728] as [number, number], // Fixed with tuple type
    directions: ["Head east from the main entrance", "It's the large building with the green roof", "The gift shop is near the food court"],
    type: "facility" as const
  },
  event1: {
    id: "event1",
    name: "Elephant Show",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    distance: "7 Min",
    coordinates: [-73.974, 40.736] as [number, number], // Fixed with tuple type
    directions: ["Head northeast from the main entrance", "Pass the giraffe enclosure", "The elephant arena will be ahead on your right"],
    type: "event" as const
  },
  event2: {
    id: "event2",
    name: "Penguin Feeding",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    distance: "12 Min",
    coordinates: [-73.980, 40.733] as [number, number], // Fixed with tuple type
    directions: ["Head west from the main entrance", "Follow signs to the Aquatic Zone", "The penguin habitat is located inside the building"],
    type: "event" as const
  }
};

type LocationKey = keyof typeof zooLocations;

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const destinationId = searchParams.get('destination');
  const eventLocation = location.state?.eventLocation;
  
  const [search, setSearch] = useState("");
  const [showDirections, setShowDirections] = useState(!!destinationId);
  const [activeDirection, setActiveDirection] = useState(0);
  const [searchResults, setSearchResults] = useState<LocationKey[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "animal" | "event" | "facility">("all");
  
  // Initialize mapbox hook
  const {
    mapContainer,
    isLoaded,
    selectLocation,
    selectedLocation,
    resetView,
    updateUserLocation,
    filterLocations
  } = useMapbox({
    initialCenter: [-73.979, 40.732], // Default center for the zoo map
    initialZoom: 15.5,
    locations: zooLocations
  });

  const destination = selectedLocation ? zooLocations[selectedLocation as LocationKey] : null;

  // Effect to handle destination from URL params
  useEffect(() => {
    if (destinationId && zooLocations[destinationId as LocationKey]) {
      selectLocation(destinationId as string);
      setShowDirections(true);
      toast.success(`Directions to ${zooLocations[destinationId as LocationKey]?.name || 'destination'} loaded`);
    }
  }, [destinationId, isLoaded]);

  // Effect to handle event location from state
  useEffect(() => {
    if (eventLocation && isLoaded) {
      // Find the event by name (in a real app, this would be by ID)
      const eventKey = Object.keys(zooLocations).find(
        key => zooLocations[key as LocationKey].name.toLowerCase() === eventLocation.toLowerCase()
      ) as LocationKey | undefined;
      
      if (eventKey) {
        selectLocation(eventKey);
        setShowDirections(true);
        toast.success(`Directions to ${zooLocations[eventKey].name} loaded`);
      } else {
        toast.error("Event location not found on map");
      }
    }
  }, [eventLocation, isLoaded]);

  // Effect for search functionality
  useEffect(() => {
    if (search.length > 1) {
      const results = Object.keys(zooLocations).filter((key) => 
        zooLocations[key as LocationKey].name.toLowerCase().includes(search.toLowerCase())
      ) as LocationKey[];
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setShowSearchResults(false);
    }
  }, [search]);

  // Function to handle navigation to a selected location
  const handleNavigateToLocation = (locationKey: LocationKey) => {
    setShowSearchResults(false);
    setSearch("");
    selectLocation(locationKey);
    setShowDirections(true);
    setActiveDirection(0);
    
    toast.success(`Navigating to ${zooLocations[locationKey].name}`);
  };

  // Function to handle getting user's current location
  const handleGetCurrentLocation = () => {
    toast.info("Getting your current location...");
    
    // Update user location with our custom hook function
    updateUserLocation();
    
    setTimeout(() => {
      toast.success("Location updated");
    }, 1000);
  };

  // Function to reset user's view on the map
  const handleResetView = () => {
    resetView();
    setShowDirections(false);
    toast.info("Map view reset");
  };

  // Apply filter both to local state and mapbox hook
  const handleFilterChange = (type: "all" | "animal" | "event" | "facility") => {
    setFilterType(type);
    filterLocations(type);
  };

  // Functions to navigate through directions
  const nextDirection = () => {
    if (destination && activeDirection < destination.directions.length - 1) {
      setActiveDirection(activeDirection + 1);
    } else {
      toast.success("You have reached your destination!");
    }
  };

  const prevDirection = () => {
    if (activeDirection > 0) {
      setActiveDirection(activeDirection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Zoo Map" showBackButton showThemeToggle showUserAvatar />
      
      <div className="h-screen w-full relative pt-16">
        {/* Map container */}
        <div 
          ref={mapContainer} 
          className="absolute inset-0 pt-16"
          style={{ marginTop: '0' }}
        />
        
        {/* Filter buttons */}
        <div className="absolute top-20 left-4 right-4 z-10 flex items-center justify-between space-x-2">
          <button 
            onClick={() => handleFilterChange("all")}
            className={cn(
              "py-1 px-3 text-xs rounded-full",
              filterType === "all" 
                ? "bg-zoo-primary text-white" 
                : "bg-white/80 text-gray-700"
            )}
          >
            All
          </button>
          <button 
            onClick={() => handleFilterChange("animal")}
            className={cn(
              "py-1 px-3 text-xs rounded-full",
              filterType === "animal" 
                ? "bg-zoo-primary text-white" 
                : "bg-white/80 text-gray-700"
            )}
          >
            Animals
          </button>
          <button 
            onClick={() => handleFilterChange("event")}
            className={cn(
              "py-1 px-3 text-xs rounded-full",
              filterType === "event" 
                ? "bg-orange-500 text-white" 
                : "bg-white/80 text-gray-700"
            )}
          >
            Events
          </button>
          <button 
            onClick={() => handleFilterChange("facility")}
            className={cn(
              "py-1 px-3 text-xs rounded-full",
              filterType === "facility" 
                ? "bg-blue-500 text-white" 
                : "bg-white/80 text-gray-700"
            )}
          >
            Facilities
          </button>
        </div>
        
        <div className="absolute top-28 left-0 right-0 px-4 z-10">
          <SearchBar 
            placeholder="Find locations, animals, events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {showSearchResults && (
            <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((key) => (
                <button
                  key={key}
                  onClick={() => handleNavigateToLocation(key)}
                  className="w-full px-4 py-3 flex items-center border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                    <img src={zooLocations[key].image} alt={zooLocations[key].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{zooLocations[key].name}</p>
                    <p className="text-xs text-gray-500">{zooLocations[key].distance} walk</p>
                  </div>
                  <MapPin className="w-5 h-5 text-zoo-primary ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Map control buttons */}
        <div className="absolute bottom-32 right-4 flex flex-col gap-2">
          <button 
            onClick={handleGetCurrentLocation}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
            aria-label="Get current location"
          >
            <Compass className="w-5 h-5 text-zoo-primary" />
          </button>
          <button 
            onClick={handleResetView}
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
            aria-label="Reset view"
          >
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
            aria-label="Report issue"
          >
            <AlertCircle className="w-5 h-5 text-zoo-primary" />
          </button>
        </div>
        
        {/* Directions panel */}
        {showDirections && destination && (
          <div className="absolute bottom-20 left-0 right-0 p-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center p-3 border-b border-gray-100">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-16 h-12 object-cover rounded-lg mr-3"
                />
                <div>
                  <h3 className="font-semibold">{destination.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Route className="w-3 h-3 mr-1" />
                    {destination.distance} to destination
                  </p>
                </div>
              </div>
              
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Step {activeDirection + 1} of {destination.directions.length}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={prevDirection}
                      disabled={activeDirection === 0}
                      className="h-6 px-2"
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={nextDirection}
                      className="h-6 px-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <p className="font-medium text-gray-800">
                  {destination.directions[activeDirection]}
                </p>
              </div>
              
              <div className="flex justify-between p-2">
                <button 
                  onClick={handleGetCurrentLocation}
                  className="w-10 h-10 rounded-full text-zoo-primary hover:bg-zoo-secondary flex items-center justify-center"
                >
                  <Compass className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full text-zoo-primary hover:bg-zoo-secondary flex items-center justify-center">
                  <Route className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setShowDirections(false);
                    selectLocation(null);
                  }}
                  className="w-10 h-10 rounded-full bg-zoo-primary text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default MapPage;
