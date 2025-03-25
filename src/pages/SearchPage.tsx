
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import AnimalCard from "../components/AnimalCard";
import BottomNavbar from "../components/BottomNavbar";
import { toast } from "sonner";

// Sample animal data for search results
const allAnimals = [
  {
    id: "crocodile",
    name: "Crocodile",
    image: "public/lovable-uploads/913b61a8-cf4c-4183-9809-0c617218d36c.png",
  },
  {
    id: "tortoise",
    name: "Tortoise",
    image: "public/lovable-uploads/009a33ba-77b2-49a3-86ae-0586197bf4ab.png",
  },
  {
    id: "peacock",
    name: "Peacock",
    image: "public/lovable-uploads/d65de9b2-e507-4511-a47c-4962de992a26.png",
  },
  {
    id: "gorilla",
    name: "Gorilla",
    image: "public/lovable-uploads/4fe1f1a1-c3d6-477b-b486-5590bda76085.png",
  },
  {
    id: "lion",
    name: "Lion",
    image: "public/lovable-uploads/8076e47b-b1f8-4f4e-8ada-fa1407b76ede.png",
  },
  {
    id: "tiger",
    name: "Tiger",
    image: "public/lovable-uploads/385ec9d1-9804-48f9-95d9-e88ad31bedb7.png",
  },
  {
    id: "zebra",
    name: "Zebra",
    image: "public/lovable-uploads/c0779203-cebe-4f61-be65-f8939ee46040.png",
  },
];

const SearchPage = () => {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Get initial search term from URL if available
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    if (query) {
      setSearch(query);
    }
    
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, [location.search]);
  
  // Filter animals based on search term
  const filteredAnimals = allAnimals.filter(animal => 
    animal.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    // Update favorites state
    const newFavorites = { ...favorites, [id]: isFavorite };
    setFavorites(newFavorites);
    
    // Store in localStorage
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    
    toast.success(`${isFavorite ? 'Added to' : 'Removed from'} favorites`);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader showBackButton showSettings showUserAvatar />
      
      <div className="pt-16 px-5">
        <SearchBar 
          placeholder="Search animals, events, or places" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={handleSearch}
          className="mb-6"
          autoFocus={true}
        />
        
        <div className="space-y-4">
          {filteredAnimals.map((animal) => (
            <div key={animal.id} className="w-full h-32">
              <AnimalCard
                id={animal.id}
                name={animal.name}
                image={animal.image}
                compact
                isFavorite={!!favorites[animal.id]}
                onToggleFavorite={(isFavorite) => handleToggleFavorite(animal.id, isFavorite)}
              />
            </div>
          ))}
          
          {filteredAnimals.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No animals found</p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default SearchPage;
