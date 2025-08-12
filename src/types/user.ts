export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  preferences: UserPreferences;
  favorites: string[]; // Array of animal IDs
  visitHistory: VisitRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  language: string;
  timezone: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  eventReminders: boolean;
  animalUpdates: boolean;
  zooNews: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareVisitHistory: boolean;
  shareStatistics: boolean;
  allowAnalytics: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

export interface VisitRecord {
  id: string;
  userId: string;
  animalId: string;
  animalName: string;
  animalSpecies: string;
  visitDate: string;
  duration?: number; // in minutes
  rating?: number; // 1-5 stars
  notes?: string;
  photos?: string[];
}

export interface UserStats {
  totalVisits: number;
  uniqueAnimalsVisited: number;
  favoriteSpecies: string;
  totalTimeSpent: number; // in minutes
  visitStreak: number; // consecutive days
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'visits' | 'favorites' | 'social' | 'exploration';
}

export interface UserSession {
  user: UserProfile;
  token: string;
  expiresAt: string;
}
