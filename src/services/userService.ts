import { UserProfile, UserPreferences, VisitRecord, UserStats, UserSession } from '@/types/user';

// Mock user database - in production this would connect to a real backend
const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    email: 'demo@zooquest.com',
    firstName: 'Demo',
    lastName: 'User',
    profileImage: '/lovable-uploads/profile-demo.jpg',
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        sms: false,
        eventReminders: true,
        animalUpdates: true,
        zooNews: false,
      },
      privacy: {
        profileVisibility: 'public',
        shareVisitHistory: true,
        shareStatistics: true,
        allowAnalytics: true,
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        screenReader: false,
      },
      language: 'en',
      timezone: 'America/New_York',
    },
    favorites: [],
    visitHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class UserService {
  private currentUser: UserProfile | null = null;
  private userKey = 'zooquest_user';
  private sessionKey = 'zooquest_session';

  constructor() {
    this.loadUserFromStorage();
  }

  // Authentication
  async login(email: string, password: string): Promise<UserSession> {
    // Mock authentication - in production this would validate against backend
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const session: UserSession = {
      user,
      token: this.generateMockToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    this.currentUser = user;
    this.saveUserToStorage(session);
    return session;
  }

  async register(userData: Partial<UserProfile>, password: string): Promise<UserSession> {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      profileImage: userData.profileImage,
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          sms: false,
          eventReminders: true,
          animalUpdates: true,
          zooNews: false,
        },
        privacy: {
          profileVisibility: 'public',
          shareVisitHistory: true,
          shareStatistics: true,
          allowAnalytics: true,
        },
        accessibility: {
          fontSize: 'medium',
          highContrast: false,
          reduceMotion: false,
          screenReader: false,
        },
        language: 'en',
        timezone: 'America/New_York',
      },
      favorites: [],
      visitHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    
    const session: UserSession = {
      user: newUser,
      token: this.generateMockToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    this.currentUser = newUser;
    this.saveUserToStorage(session);
    return session;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.userKey);
  }

  // User Profile Management
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser = {
      ...this.currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update in mock database
    const userIndex = mockUsers.findIndex(u => u.id === this.currentUser!.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }

    this.currentUser = updatedUser;
    this.updateUserInStorage(updatedUser);
    return updatedUser;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const updatedPreferences = {
      ...this.currentUser.preferences,
      ...preferences,
    };

    return this.updateProfile({ preferences: updatedPreferences });
  }

  async uploadProfileImage(file: File): Promise<string> {
    // Mock image upload - in production this would upload to cloud storage
    const imageUrl = URL.createObjectURL(file);
    await this.updateProfile({ profileImage: imageUrl });
    return imageUrl;
  }

  // Favorites Management
  async addToFavorites(animalId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    if (!this.currentUser.favorites.includes(animalId)) {
      const updatedFavorites = [...this.currentUser.favorites, animalId];
      await this.updateProfile({ favorites: updatedFavorites });
    }
  }

  async removeFromFavorites(animalId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const updatedFavorites = this.currentUser.favorites.filter(id => id !== animalId);
    await this.updateProfile({ favorites: updatedFavorites });
  }

  async getFavorites(): Promise<string[]> {
    if (!this.currentUser) {
      return [];
    }
    return this.currentUser.favorites;
  }

  isFavorite(animalId: string): boolean {
    if (!this.currentUser) {
      return false;
    }
    return this.currentUser.favorites.includes(animalId);
  }

  // Visit Tracking
  async recordVisit(animalId: string, animalName: string, animalSpecies: string, duration?: number): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const visitRecord: VisitRecord = {
      id: `visit-${Date.now()}`,
      userId: this.currentUser.id,
      animalId,
      animalName,
      animalSpecies,
      visitDate: new Date().toISOString(),
      duration,
    };

    const updatedHistory = [...this.currentUser.visitHistory, visitRecord];
    await this.updateProfile({ visitHistory: updatedHistory });
  }

  async getVisitHistory(): Promise<VisitRecord[]> {
    if (!this.currentUser) {
      return [];
    }
    return this.currentUser.visitHistory.sort((a, b) => 
      new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    );
  }

  async getUserStats(): Promise<UserStats> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const visits = this.currentUser.visitHistory;
    const uniqueAnimals = new Set(visits.map(v => v.animalId));
    const totalTime = visits.reduce((sum, v) => sum + (v.duration || 0), 0);
    
    // Calculate species frequency
    const speciesCount = visits.reduce((acc, v) => {
      acc[v.animalSpecies] = (acc[v.animalSpecies] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteSpecies = Object.entries(speciesCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
      totalVisits: visits.length,
      uniqueAnimalsVisited: uniqueAnimals.size,
      favoriteSpecies,
      totalTimeSpent: totalTime,
      visitStreak: this.calculateVisitStreak(),
      achievements: [], // TODO: Implement achievements
    };
  }

  async clearAllFavorites(): Promise<void> {
    if (this.currentUser) {
      await this.updateProfile({ favorites: [] });
    }
    // Also clear localStorage favorites for guest users
    localStorage.removeItem("favorites");
  }

  // Private helper methods
  private generateMockToken(): string {
    return btoa(JSON.stringify({
      userId: this.currentUser?.id,
      timestamp: Date.now(),
      random: Math.random(),
    }));
  }

  private calculateVisitStreak(): number {
    if (!this.currentUser || this.currentUser.visitHistory.length === 0) {
      return 0;
    }

    const visits = this.currentUser.visitHistory
      .map(v => new Date(v.visitDate).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = [...new Set(visits)];
    let streak = 0;
    const today = new Date().toDateString();
    const checkDate = new Date();

    for (const visitDate of uniqueDates) {
      if (visitDate === checkDate.toDateString()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private saveUserToStorage(session: UserSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.setItem(this.userKey, JSON.stringify(session.user));
  }

  private updateUserInStorage(user: UserProfile): void {
    const sessionData = localStorage.getItem(this.sessionKey);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.user = user;
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const sessionData = localStorage.getItem(this.sessionKey);
    const userData = localStorage.getItem(this.userKey);
    
    if (sessionData && userData) {
      try {
        const session = JSON.parse(sessionData);
        const user = JSON.parse(userData);
        
        // Check if session is still valid
        if (new Date(session.expiresAt) > new Date()) {
          // Clear any fake favorites from mock data
          user.favorites = [];
          this.currentUser = user;
          // Update storage with cleaned data
          this.updateUserInStorage(user);
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.logout();
      }
    }
  }
}

export const userService = new UserService();
export default userService;
