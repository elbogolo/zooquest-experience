
import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import SearchBar from "../components/SearchBar";
import BottomNavbar from "../components/BottomNavbar";

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

const HomePage = () => {
  const [greeting, setGreeting] = useState("");
  const [name, setName] = useState("Guest");
  const [search, setSearch] = useState("");

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // In a real app, we would fetch the user's name from authentication
    const storedName = localStorage.getItem("userName");
    if (storedName) setName(storedName);
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Hi, {name} <span className="ml-1 text-2xl">👋</span>
          </h1>
          <p className="text-gray-500">Explore the Zoo</p>
        </div>
        <Link to="/settings">
          <Settings className="w-6 h-6 text-gray-700" />
        </Link>
      </header>

      {/* Search */}
      <div className="px-5 mb-6">
        <SearchBar 
          placeholder="Search places" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Popular places</h2>
          <Link to="/all-animals" className="text-sm text-zoo-primary">
            View all
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button className="px-4 py-2 rounded-full bg-zoo-primary text-white whitespace-nowrap">
            Most Visited
          </button>
          <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 whitespace-nowrap">
            Shop
          </button>
          <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 whitespace-nowrap">
            Events
          </button>
          <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 whitespace-nowrap">
            Feeding Times
          </button>
        </div>
      </div>

      {/* Animal Cards */}
      <div className="px-5">
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

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default HomePage;
