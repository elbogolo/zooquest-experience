
import { useState, useEffect } from "react";
import { Map as MapIcon, Calendar, Camera, Users, Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import SearchBar from "../components/SearchBar";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";

// Sample data for animals
const popularAnimals = [
  {
    id: "lion",
    name: "Lion",
    image: "lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    isFavorite: true,
  },
  {
    id: "tiger",
    name: "Tiger",
    image: "lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    isFavorite: true,
  },
  {
    id: "gorilla",
    name: "Gorilla",
    image: "lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    isFavorite: false,
  },
  {
    id: "crocodile",
    name: "Crocodile",
    image: "lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
    isFavorite: false,
  },
];

// All animals for search
const allAnimals = [
  ...popularAnimals,
  {
    id: "tortoise",
    name: "Tortoise",
    image: "lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
    isFavorite: false,
  },
  {
    id: "peacock",
    name: "Peacock",
    image: "lovable-uploads/d65de9b2-e507-4511-a47c-4962de992a26.png",
    isFavorite: false,
  },
  {
    id: "zebra",
    name: "Zebra",
    image: "lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
    isFavorite: false,
  },
];

// Sample events for today
const todayEvents = [
  { id: "event1", title: "Lion Feeding", time: "10:00 AM", location: "Lion Enclosure" },
  { id: "event2", title: "Tiger Talk", time: "11:30 AM", location: "Tiger Territory" },
  { id: "event3", title: "Gorilla Encounter", time: "2:00 PM", location: "Gorilla Habitat" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<typeof allAnimals>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    
    // Initialize favorites from localStorage or from the popularAnimals array
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    } else {
      const initialFavorites: Record<string, boolean> = {};
      popularAnimals.forEach(animal => {
        if (animal.isFavorite) {
          initialFavorites[animal.id] = true;
        }
      });
      setFavorites(initialFavorites);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      const results = allAnimals.filter(animal => 
        animal.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(true);
      toast.info(`Found ${results.length} results for "${searchTerm}"`);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleAnimalCardClick = (id: string) => {
    navigate(`/animals/${id}`);
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    // Update favorites state
    setFavorites(prev => ({
      ...prev,
      [id]: isFavorite
    }));
    
    toast.success(`${isFavorite ? 'Added to' : 'Removed from'} favorites`);
  };

  // Determine which animals to display
  const displayAnimals = isSearching ? searchResults : popularAnimals;

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <AppHeader 
        greeting={greeting}
        subtitle="Explore the Zoo"
      />

      {/* Search */}
      <div className="px-5 mb-6">
        <SearchBar 
          placeholder="Search animals, events, or places" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={handleSearch}
        />
      </div>

      {/* Show clear search button when searching */}
      {isSearching && (
        <div className="px-5 mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            Search Results ({searchResults.length})
          </h2>
          <Button variant="outline" size="sm" onClick={clearSearch}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Quick Access - only show if not searching */}
      {!isSearching && (
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Quick Access</h2>
          <div className="grid grid-cols-4 gap-3">
            <Link to="/map" className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                <MapIcon className="w-7 h-7 text-zoo-primary" />
              </div>
              <span className="text-xs text-center text-foreground">Map</span>
            </Link>
            <Link to="/events" className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                <Calendar className="w-7 h-7 text-zoo-primary" />
              </div>
              <span className="text-xs text-center text-foreground">Events</span>
            </Link>
            <Link to="/ar" className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                <Camera className="w-7 h-7 text-zoo-primary" />
              </div>
              <span className="text-xs text-center text-foreground">AR View</span>
            </Link>
            {user?.isAdmin ? (
              <Link to="/admin" className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                  <Users className="w-7 h-7 text-zoo-primary" />
                </div>
                <span className="text-xs text-center text-foreground">Admin</span>
              </Link>
            ) : (
              <Link to="/visit-list" className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                  <Bookmark className="w-7 h-7 text-zoo-primary" />
                </div>
                <span className="text-xs text-center text-foreground">Visit List</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Animals Section */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {isSearching ? "Search Results" : "Popular animals"}
          </h2>
          {!isSearching && (
            <Link to="/search" className="text-sm text-zoo-primary">
              View all
            </Link>
          )}
        </div>
        
        {displayAnimals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {displayAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                image={animal.image}
                isFavorite={!!favorites[animal.id]}
                onClick={() => handleAnimalCardClick(animal.id)}
                onToggleFavorite={(isFavorite) => handleToggleFavorite(animal.id, isFavorite)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No animals found</p>
          </div>
        )}
      </div>
      
      {/* Today's Events - only show if not searching */}
      {!isSearching && (
        <div className="px-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-foreground">Today's Events</h2>
            <Link to="/events" className="text-sm text-zoo-primary">
              All events
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {todayEvents.map((event, idx) => (
              <div 
                key={event.id} 
                className={`p-3 flex justify-between items-center ${
                  idx < todayEvents.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <h3 className="font-medium text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.time} • {event.location}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/events/${event.id}`}>Details</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default HomePage;
