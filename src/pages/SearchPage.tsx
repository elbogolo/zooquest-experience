
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import AnimalCard from "../components/AnimalCard";
import BottomNavbar from "../components/BottomNavbar";
import { toast } from "sonner";
import { adminService } from "../services/adminService";
import { AdminAnimal } from "../types/admin";

// We'll fetch animals from adminService instead of using hardcoded data

const SearchPage = () => {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [animals, setAnimals] = useState<AdminAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get initial search term from URL if available and fetch animals
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

    // Fetch all animals from adminService
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const animalData = await adminService.getItems<AdminAnimal>("animals");
        setAnimals(animalData);
      } catch (error) {
        console.error("Error fetching animals:", error);
        toast.error("Failed to load animals");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [location.search]);
  
  // Filter animals based on search term
  const filteredAnimals = animals.filter(animal => 
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
      
      <div className="pt-24 px-5">
        <SearchBar 
          placeholder="Search animals, events, or places" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={handleSearch}
          className="mb-8"
          autoFocus={true}
        />
        
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="w-full h-32 animate-pulse bg-muted rounded-xl"></div>
            ))
          ) : (
            <>
              {filteredAnimals.map((animal) => (
                <div key={animal.id} className="w-full h-32">
                  <AnimalCard
                    id={animal.id}
                    name={animal.name}
                    image={animal.imageUrl}
                    compact
                    isFavorite={!!favorites[animal.id]}
                    onToggleFavorite={(isFavorite) => handleToggleFavorite(animal.id, isFavorite)}
                  />
                </div>
              ))}
              
              {filteredAnimals.length === 0 && !loading && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No animals found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default SearchPage;
