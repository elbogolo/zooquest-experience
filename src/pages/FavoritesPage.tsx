import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimalCard from "@/components/AnimalCard";
import PageHeader from "@/components/PageHeader";
import BottomNavbar from "@/components/BottomNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, LogIn, Filter, Grid, List } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import { userService } from "@/services/userService";
import { AdminAnimal } from "@/types/admin";

const FavoritesPage = () => {
  const [favoriteAnimals, setFavoriteAnimals] = useState<AdminAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'species' | 'dateAdded'>('name');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const currentUser = userService.getCurrentUser();
        setIsLoggedIn(!!currentUser);
        
        if (currentUser) {
          // User is logged in - get favorites from user service
          const favoritesIds = await userService.getFavorites();
          
          if (favoritesIds.length > 0) {
            // Fetch all animals from backend
            const animalData = await adminService.getItems("animals") as AdminAnimal[];
            
            // Filter to only show favorited animals
            const favoritedAnimals = animalData.filter(animal => favoritesIds.includes(animal.id));
            
            // Sort animals based on selected criteria
            const sortedAnimals = sortAnimals(favoritedAnimals, sortBy);
            setFavoriteAnimals(sortedAnimals);
          }
        } else {
          // Guest user - fallback to localStorage
          const storedFavorites = localStorage.getItem("favorites");
          const favoritesData = storedFavorites ? JSON.parse(storedFavorites) : {};
          const favoriteIds = Object.keys(favoritesData).filter(id => favoritesData[id]);
          
          if (favoriteIds.length > 0) {
            const animalData = await adminService.getItems("animals") as AdminAnimal[];
            const favoritedAnimals = animalData.filter(animal => favoriteIds.includes(animal.id));
            const sortedAnimals = sortAnimals(favoritedAnimals, sortBy);
            setFavoriteAnimals(sortedAnimals);
          }
        }

      } catch (error) {
        console.error("Error loading favorites:", error);
        toast.error("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sortBy]);

  const sortAnimals = (animals: AdminAnimal[], sortBy: 'name' | 'species' | 'dateAdded'): AdminAnimal[] => {
    return [...animals].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'species':
          return (a.species || '').localeCompare(b.species || '');
        case 'dateAdded':
          // Since AdminAnimal doesn't have createdAt, sort by name as fallback
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      if (isLoggedIn) {
        // User is logged in - use user service
        const isFavorite = userService.isFavorite(id);
        if (isFavorite) {
          await userService.removeFromFavorites(id);
          setFavoriteAnimals(prev => prev.filter(animal => animal.id !== id));
          toast.success("Removed from favorites");
        } else {
          await userService.addToFavorites(id);
          toast.success("Added to favorites");
        }
      } else {
        // Guest user - use localStorage
        const storedFavorites = localStorage.getItem("favorites");
        const favorites = storedFavorites ? JSON.parse(storedFavorites) : {};
        
        if (favorites[id]) {
          delete favorites[id];
          setFavoriteAnimals(prev => prev.filter(animal => animal.id !== id));
          toast.success("Removed from favorites");
        } else {
          favorites[id] = true;
          toast.success("Added to favorites");
        }
        
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleAnimalClick = (id: string) => {
    navigate(`/animal/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="My Favorites" />
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full rounded-lg mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="My Favorites" />
      
      <div className="container mx-auto px-4 py-6 pb-24">
        {favoriteAnimals.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {favoriteAnimals.length} favorite{favoriteAnimals.length !== 1 ? 's' : ''}
              </Badge>
              {isLoggedIn && (
                <Badge variant="outline" className="px-3 py-1">
                  Synced across devices
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'species' | 'dateAdded')}
                  className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring"
                >
                  <option value="name">Sort by Name</option>
                  <option value="species">Sort by Species</option>
                  <option value="dateAdded">Recently Added</option>
                </select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex border border-input rounded-md p-1 bg-background">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 px-2"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {favoriteAnimals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No favorites yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Start exploring and add animals to your favorites by tapping the heart icon. 
                Your favorites will be saved {isLoggedIn ? 'and synced across all your devices' : 'locally on this device'}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate('/search')} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Explore Animals
                </Button>
                <Button variant="outline" onClick={() => navigate('/map')}>
                  Visit Zoo Map
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
          }>
            {favoriteAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                image={animal.imageUrl}
                isFavorite={true}
                onClick={() => handleAnimalClick(animal.id)}
                onToggleFavorite={() => handleToggleFavorite(animal.id)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default FavoritesPage;
