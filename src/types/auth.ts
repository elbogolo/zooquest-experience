// Define user types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt?: string; // Added to distinguish between existing and new users
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
}
