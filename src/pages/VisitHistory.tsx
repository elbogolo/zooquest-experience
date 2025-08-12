import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import BottomNavbar from "@/components/BottomNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userService } from "@/services/userService";
import { VisitRecord } from "@/types/user";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Eye,
  Heart,
  LogIn,
  Camera
} from "lucide-react";

const VisitHistory = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadVisitHistory = async () => {
      try {
        setLoading(true);
        const currentUser = userService.getCurrentUser();
        setIsLoggedIn(!!currentUser);

        if (currentUser) {
          const visitHistory = await userService.getVisitHistory();
          setVisits(visitHistory);
        }
      } catch (error) {
        console.error("Error loading visit history:", error);
        toast.error("Failed to load visit history");
      } finally {
        setLoading(false);
      }
    };

    loadVisitHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Quick visit';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getVisitStats = () => {
    const totalVisits = visits.length;
    const uniqueAnimals = new Set(visits.map(v => v.animalId)).size;
    const totalTime = visits.reduce((sum, v) => sum + (v.duration || 0), 0);
    const averageTime = totalVisits > 0 ? Math.round(totalTime / totalVisits) : 0;

    return {
      totalVisits,
      uniqueAnimals,
      totalTime,
      averageTime
    };
  };

  const handleVisitAnimal = (animalId: string) => {
    navigate(`/animal/${animalId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BackButton />
        <div className="container mx-auto px-4 py-6">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Please sign in to view your visit history</span>
                <Button size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const stats = getVisitStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Visit History</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            View Profile
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalVisits}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                Total Visits
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.uniqueAnimals}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Heart className="h-3 w-3" />
                Animals Visited
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.totalTime / 60)}h
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Total Time
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.averageTime}m
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Avg. Visit
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visit History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visits.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No visits recorded yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start exploring animals to build your visit history
                </p>
                <Button onClick={() => navigate('/search')}>
                  Explore Animals
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleVisitAnimal(visit.animalId)}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Eye className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {visit.animalName}
                        </h3>
                        {visit.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{visit.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(visit.visitDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(visit.duration)}
                        </span>
                        <span className="text-gray-500">{visit.animalSpecies}</span>
                      </div>
                      {visit.notes && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {visit.notes}
                        </p>
                      )}
                    </div>

                    {visit.photos && visit.photos.length > 0 && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Camera className="h-4 w-4" />
                        <span className="text-xs">{visit.photos.length}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default VisitHistory;
