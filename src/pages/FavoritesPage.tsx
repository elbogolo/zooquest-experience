import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimalCard from "@/components/AnimalCard";
import PageHeader from "@/components/PageHeader";
import BottomNavbar from "@/components/BottomNavbar";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [animals, setAnimals] = useState<Array<any>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    // In a real app, fetch only favorited animals
    // For now, we'll use the sample data and filter
    const allAnimals = [
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
      // ... other animals
    ];

    const favoritedAnimals = allAnimals.filter(animal => favorites[animal.id]);
    setAnimals(favoritedAnimals);
  }, []);

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    const newFavorites = { ...favorites, [id]: isFavorite };
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    
    if (!isFavorite) {
      setAnimals(animals.filter(animal => animal.id !== id));
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Favorites" showBackButton />
      
      <div className="pt-16 px-5">
        {animals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                image={animal.image}
                isFavorite={!!favorites[animal.id]}
                onClick={() => navigate(`/animals/${animal.id}`)}
                onToggleFavorite={(isFavorite) => handleToggleFavorite(animal.id, isFavorite)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No favorite animals yet</p>
          </div>
        )}
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default FavoritesPage;
