import { useState, useEffect } from "react";
import { Map as MapIcon, Calendar, Users, Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import SearchBar from "../components/SearchBar";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { adminService, eventService } from "@/services/adminService";
import { AdminAnimal, AdminEvent } from "@/types/admin";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [animalsLoading, setAnimalsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    // Fetch animals and events from backend
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch animals
        setAnimalsLoading(true);
        const animalData = await adminService.getItems("animals") as AdminAnimal[];
        setAnimals(animalData.slice(0, 4)); // Show only first 4 for popular section
        setAnimalsLoading(false);

        // Fetch events  
        setEventsLoading(true);
        const eventData = await eventService.getAll();
        setEvents(eventData.slice(0, 3)); // Show only first 3 for upcoming section
        setEventsLoading(false);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
        setAnimalsLoading(false);
        setEventsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/search');
    }
  };

  const toggleFavorite = (animalId: string) => {
    const newFavorites = { ...favorites, [animalId]: !favorites[animalId] };
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    
    if (newFavorites[animalId]) {
      toast.success("Added to favorites!");
    } else {
      toast.success("Removed from favorites!");
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <AppHeader />
      
      {/* Hero Section */}
      <div className="px-4 pt-20 pb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to ZooQuest
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover amazing animals and exciting events
          </p>
        </div>
        
        <SearchBar 
          placeholder="Search for animals..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={handleSearch}
          className="mb-6"
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          <Link to="/map" className="flex flex-col items-center p-3 rounded-lg bg-card border hover:bg-accent transition-colors">
            <MapIcon className="h-6 w-6 text-primary mb-1" />
            <span className="text-xs text-foreground font-medium">Map</span>
          </Link>
          <Link to="/events" className="flex flex-col items-center p-3 rounded-lg bg-card border hover:bg-accent transition-colors">
            <Calendar className="h-6 w-6 text-primary mb-1" />
            <span className="text-xs text-foreground font-medium">Events</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-3 rounded-lg bg-card border hover:bg-accent transition-colors">
            <Users className="h-6 w-6 text-primary mb-1" />
            <span className="text-xs text-foreground font-medium">Profile</span>
          </Link>
          <Link to="/favorites" className="flex flex-col items-center p-3 rounded-lg bg-card border hover:bg-accent transition-colors">
            <Bookmark className="h-6 w-6 text-primary mb-1" />
            <span className="text-xs text-foreground font-medium">Favorites</span>
          </Link>
        </div>
      </div>

      {/* Popular Animals Section */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Popular Animals</h2>
          <Link to="/search" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {animalsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <CardContent className="p-0">
                  <Skeleton className="h-32 w-full rounded mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                image={animal.imageUrl || "/placeholder-animal.png"}
                isFavorite={favorites[animal.id] || false}
                onClick={() => navigate(`/animal/${animal.id}`)}
                onToggleFavorite={() => toggleFavorite(animal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          <Link to="/events" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {eventsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <CardContent className="p-0">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="p-4 hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-0">
                  <Link to={`/events/${event.id}`} className="block">
                    <h3 className="text-sm font-medium text-foreground mb-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatEventDate(event.date)} • {event.time}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Today's Highlights */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Today's Highlights</h2>
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-0">
            <h3 className="text-sm font-medium text-foreground mb-2">
              🦁 Lion Feeding Show
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Watch our magnificent lions during their feeding time. Learn about their diet and hunting behaviors.
            </p>
            <Button size="sm" className="h-8 text-xs">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default HomePage;
