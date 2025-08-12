import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import BackButton from "@/components/BackButton";
import BottomNavbar from "@/components/BottomNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { UserProfile as UserProfileType, UserStats } from "@/types/user";
import { toast } from "sonner";
import {
  User,
  Settings,
  Heart,
  BarChart3,
  Camera,
  Bell,
  Shield,
  Accessibility,
  Globe,
  LogOut,
  Edit,
  Save,
  X
} from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfileType>>({});
  const [favoritesCount, setFavoritesCount] = useState(0);

  const loadFavoritesCount = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const favorites = await userService.getFavorites();
        setFavoritesCount(favorites.length);
      } else {
        // For guest users, check localStorage
        const storedFavorites = localStorage.getItem("favorites");
        const favoritesData = storedFavorites ? JSON.parse(storedFavorites) : {};
        const favoriteIds = Object.keys(favoritesData).filter(id => favoritesData[id]);
        setFavoritesCount(favoriteIds.length);
      }
    } catch (error) {
      console.error('Error loading favorites count:', error);
    }
  }, [isAuthenticated]);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated || !authUser) {
        return;
      }

      // Convert auth user to profile format
      const userProfile: UserProfileType = {
        id: authUser.id,
        firstName: authUser.name.split(' ')[0] || '',
        lastName: authUser.name.split(' ').slice(1).join(' ') || '',
        email: authUser.email,
        profileImage: authUser.avatar || '',
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            sms: false,
            eventReminders: true,
            animalUpdates: true,
            zooNews: true
          },
          privacy: {
            profileVisibility: 'public',
            shareVisitHistory: true,
            shareStatistics: true,
            allowAnalytics: true
          },
          accessibility: {
            fontSize: 'medium',
            highContrast: false,
            reduceMotion: false,
            screenReader: false
          },
          language: 'en',
          timezone: 'UTC'
        },
        favorites: [],
        visitHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setUser(userProfile);
      
      // Load favorites count
      await loadFavoritesCount();

      // Mock stats data
      const mockStats: UserStats = {
        totalVisits: 0,
        uniqueAnimalsVisited: 0,
        favoriteSpecies: 'None',
        totalTimeSpent: 0,
        visitStreak: 0,
        achievements: []
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser, loadFavoritesCount]);

  const loadStats = useCallback(async () => {
    try {
      const userStats: UserStats = {
        totalVisits: 0,
        uniqueAnimalsVisited: 0,
        favoriteSpecies: 'None',
        totalTimeSpent: 0,
        visitStreak: 0,
        achievements: []
      };
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    loadStats();
  }, [loadUserData, loadStats]);

  useEffect(() => {
    const handleFocus = () => {
      loadFavoritesCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadFavoritesCount]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      // Update user profile
      const updatedUser = { ...user, ...editForm };
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload profile image
      const imageUrl = URL.createObjectURL(file);
      setUser(prev => prev ? { ...prev, profileImage: imageUrl } : null);
      setEditForm(prev => ({ ...prev, profileImage: imageUrl }));
      toast.success('Profile image updated');
    } catch (err) {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', err);
    }
  };

  const handlePreferenceChange = async (key: string, value: unknown) => {
    if (!user) return;
    
    try {
      // Update user preferences
      const updatedPreferences = { ...user.preferences, [key]: value };
      const updatedUser = { ...user, preferences: updatedPreferences };
      setUser(updatedUser);
      toast.success('Preferences updated');
    } catch (err) {
      toast.error('Failed to update preferences');
      console.error('Error updating preferences:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto px-4 py-6 pb-24">
          <Alert>
            <AlertDescription>
              {error || 'Please log in to view your profile'}
            </AlertDescription>
          </Alert>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user.profileImage || "/lovable-uploads/default-avatar.jpg"}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                  {isEditing && (
                    <label className="absolute -bottom-1 -right-1 cursor-pointer">
                      <div className="bg-primary text-primary-foreground p-1 rounded-full hover:bg-primary/90">
                        <Camera className="h-3 w-3" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Editable Fields */}
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phoneNumber || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-foreground"><strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
                  <p className="text-foreground"><strong>Address:</strong> {user.address || 'Not provided'}</p>
                  <p className="text-foreground"><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Visit Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVisits}</div>
                    <div className="text-xs text-muted-foreground">Total Visits</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.uniqueAnimalsVisited}</div>
                    <div className="text-xs text-muted-foreground">Animals Visited</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(stats.totalTimeSpent / 60)}h</div>
                    <div className="text-xs text-muted-foreground">Time Spent</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.visitStreak}</div>
                    <div className="text-xs text-muted-foreground">Visit Streak</div>
                  </div>
                </div>
                {stats.favoriteSpecies !== 'None' && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-foreground">{stats.favoriteSpecies}</div>
                    <div className="text-xs text-muted-foreground">Favorite Species</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Favorites Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Favorites ({favoritesCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => navigate('/favorites')}
                className="w-full"
              >
                Manage Favorites
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notifications */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium text-sm text-foreground">Notifications</span>
                </div>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Event Reminders</span>
                    <Switch
                      checked={user.preferences.notifications.eventReminders}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('notifications', {
                          ...user.preferences.notifications,
                          eventReminders: checked
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Animal Updates</span>
                    <Switch
                      checked={user.preferences.notifications.animalUpdates}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('notifications', {
                          ...user.preferences.notifications,
                          animalUpdates: checked
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-sm text-foreground">Privacy</span>
                </div>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Share Visit History</span>
                    <Switch
                      checked={user.preferences.privacy.shareVisitHistory}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('privacy', {
                          ...user.preferences.privacy,
                          shareVisitHistory: checked
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Allow Analytics</span>
                    <Switch
                      checked={user.preferences.privacy.allowAnalytics}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('privacy', {
                          ...user.preferences.privacy,
                          allowAnalytics: checked
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Accessibility className="h-4 w-4" />
                  <span className="font-medium text-sm text-foreground">Accessibility</span>
                </div>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">High Contrast</span>
                    <Switch
                      checked={user.preferences.accessibility.highContrast}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('accessibility', {
                          ...user.preferences.accessibility,
                          highContrast: checked
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reduce Motion</span>
                    <Switch
                      checked={user.preferences.accessibility.reduceMotion}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('accessibility', {
                          ...user.preferences.accessibility,
                          reduceMotion: checked
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default UserProfile;
