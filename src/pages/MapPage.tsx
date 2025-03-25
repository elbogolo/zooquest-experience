
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Navigation, MapPin, Compass, X, RotateCcw, Search, AlertCircle, Route } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import BottomNavbar from "../components/BottomNavbar";
import SearchBar from "../components/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Enhanced zoo locations data with more details
const zooLocations = {
  lion: {
    name: "Lion Enclosure",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    distance: "10 Min",
    coordinates: { x: 35, y: 25 },
    directions: ["Head north from the main entrance", "Turn right at the food court", "The lion enclosure will be on your left"],
    type: "animal"
  },
  tiger: {
    name: "Tiger Territory",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    distance: "15 Min",
    coordinates: { x: 65, y: 30 },
    directions: ["Head east from the main entrance", "Follow the path past the elephant enclosure", "Tiger Territory is ahead on the right"],
    type: "animal"
  },
  gorilla: {
    name: "Gorilla Habitat",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    distance: "20 Min",
    coordinates: { x: 25, y: 60 },
    directions: ["Head west from the main entrance", "Take the jungle trail", "Follow signs to the Great Ape House"],
    type: "animal"
  },
  peacock: {
    name: "Peacock Area",
    image: "public/lovable-uploads/d65de9b2-e507-4511-a47c-4962de992a26.png",
    distance: "5 Min",
    coordinates: { x: 50, y: 45 },
    directions: ["Head straight from the main entrance", "Look for the open garden area", "Peacocks roam freely in this area"],
    type: "animal"
  },
  crocodile: {
    name: "Crocodile Pond",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    distance: "12 Min",
    coordinates: { x: 70, y: 65 },
    directions: ["Head southeast from the main entrance", "Follow the water trail", "The crocodile pond will be visible on your right"],
    type: "animal"
  },
  tortoise: {
    name: "Tortoise Enclosure",
    image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
    distance: "8 Min",
    coordinates: { x: 45, y: 70 },
    directions: ["Head northeast from the main entrance", "Pass by the gift shop", "The tortoise enclosure is beyond the small hill"],
    type: "animal"
  },
  zebra: {
    name: "Zebra Grasslands",
    image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
    distance: "18 Min",
    coordinates: { x: 20, y: 40 },
    directions: ["Head northwest from the main entrance", "Follow the safari path", "The zebra grasslands will be on your left"],
    type: "animal"
  },
  shop: {
    name: "Gift Shop",
    image: "public/lovable-uploads/e75bf6ec-5927-4fae-9fff-7807edd185ad.png",
    distance: "5 Min",
    coordinates: { x: 55, y: 20 },
    directions: ["Head east from the main entrance", "It's the large building with the green roof", "The gift shop is near the food court"],
    type: "facility"
  },
  // Adding event locations
  event1: {
    name: "Elephant Show",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    distance: "7 Min",
    coordinates: { x: 60, y: 50 },
    directions: ["Head northeast from the main entrance", "Pass the giraffe enclosure", "The elephant arena will be ahead on your right"],
    type: "event"
  },
  event2: {
    name: "Penguin Feeding",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    distance: "12 Min",
    coordinates: { x: 30, y: 35 },
    directions: ["Head west from the main entrance", "Follow signs to the Aquatic Zone", "The penguin habitat is located inside the building"],
    type: "event"
  }
};

type LocationKey = keyof typeof zooLocations;

interface LocationProps {
  id: LocationKey;
  left: string;
  top: string;
  type: "animal" | "event" | "facility";
  active: boolean;
  onClick: () => void;
}

// New component for location pins on the map
const LocationPin = ({ id, left, top, type, active, onClick }: LocationProps) => {
  return (
    <button
      className={cn(
        "absolute transition-all duration-300 transform hover:scale-110 z-10",
        active ? "z-20 scale-125" : ""
      )}
      style={{ left, top }}
      onClick={onClick}
    >
      <div className={cn(
        "rounded-full flex items-center justify-center shadow-lg w-8 h-8",
        type === "animal" ? "bg-zoo-primary" : 
        type === "event" ? "bg-orange-500" : "bg-blue-500"
      )}>
        <MapPin className="w-4 h-4 text-white" />
      </div>
      {active && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-zoo-primary animate-pulse"></div>
      )}
    </button>
  );
};

// User location marker component
const UserLocationMarker = ({ left, top }: { left: string; top: string }) => {
  return (
    <div className="absolute transition-all duration-300" style={{ left, top }}>
      <div className="relative">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Navigation className="w-4 h-4 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-600"></div>
      </div>
    </div>
  );
};

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
  const [selectedLocation, setSelectedLocation] = useState<LocationKey | null>(destinationId as LocationKey || null);
  const [userPosition, setUserPosition] = useState({ x: 45, y: 75 }); // Default user position
  const [filterType, setFilterType] = useState<"all" | "animal" | "event" | "facility">("all");
  
  const destination = selectedLocation ? zooLocations[selectedLocation] : null;

  // Effect to handle destination from URL params
  useEffect(() => {
    if (destinationId) {
      setSelectedLocation(destinationId as LocationKey);
      setShowDirections(true);
      toast.success(`Directions to ${zooLocations[destinationId as LocationKey]?.name || 'destination'} loaded`);
    }
  }, [destinationId]);

  // Effect to handle event location from state
  useEffect(() => {
    if (eventLocation) {
      // Find the event by name (in a real app, this would be by ID)
      const eventKey = Object.keys(zooLocations).find(
        key => zooLocations[key as LocationKey].name.toLowerCase() === eventLocation.toLowerCase()
      ) as LocationKey | undefined;
      
      if (eventKey) {
        setSelectedLocation(eventKey);
        setShowDirections(true);
        toast.success(`Directions to ${zooLocations[eventKey].name} loaded`);
      } else {
        toast.error("Event location not found on map");
      }
    }
  }, [eventLocation]);

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
    setSelectedLocation(locationKey);
    setShowDirections(true);
    setActiveDirection(0);
    
    // In a real app, this would calculate the route from user position to destination
    toast.success(`Navigating to ${zooLocations[locationKey].name}`);
  };

  // Function to handle getting user's current location
  const handleGetCurrentLocation = () => {
    // In a real app, this would use device geolocation
    toast.info("Getting your current location...");
    
    // Simulate location update
    setTimeout(() => {
      // Randomize position slightly to simulate movement
      setUserPosition({
        x: userPosition.x + (Math.random() * 4 - 2),
        y: userPosition.y + (Math.random() * 4 - 2)
      });
      toast.success("Location updated");
    }, 1500);
  };

  // Function to reset user's view on the map
  const handleResetView = () => {
    setSelectedLocation(null);
    setShowDirections(false);
    toast.info("Map view reset");
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

  // Get visible locations based on filter
  const getVisibleLocations = () => {
    return Object.keys(zooLocations).filter(key => {
      if (filterType === "all") return true;
      return zooLocations[key as LocationKey].type === filterType;
    }) as LocationKey[];
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Zoo Map" showBackButton showThemeToggle showUserAvatar />
      
      <div className="h-screen w-full bg-gray-200 relative pt-16">
        <div className="absolute inset-0 pt-16 bg-gray-200">
          <img
            src="public/lovable-uploads/f74294e2-bf7f-442d-ab97-78c98dcc394d.png"
            alt="Zoo Map"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Filter buttons */}
        <div className="absolute top-20 left-4 right-4 z-10 flex items-center justify-between space-x-2">
          <button 
            onClick={() => setFilterType("all")}
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
            onClick={() => setFilterType("animal")}
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
            onClick={() => setFilterType("event")}
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
            onClick={() => setFilterType("facility")}
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

        {/* Draw path between user and destination */}
        {selectedLocation && (
          <div className="absolute inset-0 z-5 pointer-events-none">
            <svg width="100%" height="100%" className="absolute inset-0">
              <path
                d={`M ${userPosition.x}% ${userPosition.y}% Q ${
                  (userPosition.x + zooLocations[selectedLocation].coordinates.x) / 2 + 10
                }% ${
                  (userPosition.y + zooLocations[selectedLocation].coordinates.y) / 2 - 10
                }% ${zooLocations[selectedLocation].coordinates.x}% ${
                  zooLocations[selectedLocation].coordinates.y
                }%`}
                stroke="#4FD1C5"
                strokeWidth="3"
                strokeDasharray="5,5"
                fill="none"
                className="animate-dash"
              />
            </svg>
          </div>
        )}
        
        {/* User location marker */}
        <UserLocationMarker 
          left={`${userPosition.x}%`} 
          top={`${userPosition.y}%`} 
        />
        
        {/* Location pins on the map */}
        {getVisibleLocations().map((key) => (
          <LocationPin
            key={key}
            id={key}
            left={`${zooLocations[key].coordinates.x}%`}
            top={`${zooLocations[key].coordinates.y}%`}
            type={zooLocations[key].type as "animal" | "event" | "facility"}
            active={selectedLocation === key}
            onClick={() => handleNavigateToLocation(key)}
          />
        ))}
        
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
                    setSelectedLocation(null);
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
