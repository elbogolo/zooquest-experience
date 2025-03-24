
import { useState, useEffect } from "react";
import { Settings, Map as MapIcon, Calendar, Camera, Users, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import SearchBar from "../components/SearchBar";
import BottomNavbar from "../components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Sample data for animals
const popularAnimals = [
  {
    id: "lion",
    name: "Lion",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
    isFavorite: true,
  },
  {
    id: "tiger",
    name: "Tiger",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
    isFavorite: false,
  },
  {
    id: "gorilla",
    name: "Gorilla",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
    isFavorite: false,
  },
  {
    id: "crocodile",
    name: "Crocodile",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
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
  const [greeting, setGreeting] = useState("");
  const [name, setName] = useState("Guest");
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // In a real app, we would fetch the user's name from authentication
    const storedName = localStorage.getItem("userName");
    if (storedName) setName(storedName);
    
    // Check if user is admin (for demo purposes)
    const adminStatus = localStorage.getItem("isAdmin");
    setIsAdmin(adminStatus === "true");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      toast.info(`Searching for "${search}"`);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {greeting}, {name} <span className="ml-1 text-2xl">👋</span>
          </h1>
          <p className="text-gray-500">Explore the Zoo</p>
        </div>
        <Link to="/settings">
          <Settings className="w-6 h-6 text-gray-700" />
        </Link>
      </header>

      {/* Search */}
      <div className="px-5 mb-6">
        <form onSubmit={handleSearch}>
          <SearchBar 
            placeholder="Search animals, events, or places" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Quick Access */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-4 gap-3">
          <Link to="/map" className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
              <MapIcon className="w-7 h-7 text-zoo-primary" />
            </div>
            <span className="text-xs text-center">Map</span>
          </Link>
          <Link to="/events" className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
              <Calendar className="w-7 h-7 text-zoo-primary" />
            </div>
            <span className="text-xs text-center">Events</span>
          </Link>
          <Link to="/ar" className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
              <Camera className="w-7 h-7 text-zoo-primary" />
            </div>
            <span className="text-xs text-center">AR View</span>
          </Link>
          {isAdmin ? (
            <Link to="/admin" className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                <Users className="w-7 h-7 text-zoo-primary" />
              </div>
              <span className="text-xs text-center">Admin</span>
            </Link>
          ) : (
            <Link to="/visit-list" className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zoo-secondary flex items-center justify-center mb-1">
                <Bookmark className="w-7 h-7 text-zoo-primary" />
              </div>
              <span className="text-xs text-center">Visit List</span>
            </Link>
          )}
        </div>
      </div>

      {/* Popular places */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Popular animals</h2>
          <Link to="/search" className="text-sm text-zoo-primary">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {popularAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              id={animal.id}
              name={animal.name}
              image={animal.image}
              isFavorite={animal.isFavorite}
            />
          ))}
        </div>
      </div>
      
      {/* Today's Events */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Today's Events</h2>
          <Link to="/events" className="text-sm text-zoo-primary">
            All events
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {todayEvents.map((event, idx) => (
            <div 
              key={event.id} 
              className={`p-3 flex justify-between items-center ${
                idx < todayEvents.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.time} • {event.location}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/events">Details</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default HomePage;
