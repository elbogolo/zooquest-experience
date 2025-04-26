import { useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types/auth";
import { AuthContext } from "./auth-context";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  UserCredential } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";

// List of admin emails for easier management
const ADMIN_EMAILS = [
  "admin@example.com",
  "admin@zooquest.com",
  "director@zooquest.com",
  "manager@zooquest.com"
];

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          // Check if user is admin using the admin email list
          const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
          
          // Create our app's user object
          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.email || '').split('@')[0] || 'User',
            email: firebaseUser.email || '',
            isAdmin: isAdmin,
            avatar: firebaseUser.photoURL || undefined
          };
          
          setUser(appUser);
          setIsAuthenticated(true);
          
          // Store minimal user info in localStorage for UI purposes
          localStorage.setItem("userName", appUser.name);
          localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("userName");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function using Firebase Authentication
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Check if the user is an admin using admin email list
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: email,
        isAdmin: isAdmin,
        avatar: firebaseUser.photoURL || undefined
      };
      
      // Cache admin status in localStorage for UI decisions
      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      // Handle specific Firebase errors for better UX
      if (error instanceof FirebaseError) {
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          throw new Error("Invalid email or password");
        } else if (error.code === "auth/too-many-requests") {
          throw new Error("Too many login attempts. Please try again later.");
        } else {
          throw new Error("Failed to sign in. Please try again.");
        }
      } else {
        throw new Error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function using Firebase Authentication
  const signup = async (email: string, password: string, name: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Check against the admin emails list
      // In a real app, this would be set by an existing admin via custom claims or a database entry
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      const user: User = {
        id: firebaseUser.uid,
        name: name || email.split('@')[0],
        email: email,
        isAdmin: isAdmin,
        avatar: undefined
      };
      
      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      
      return user;
    } catch (error) {
      console.error("Sign up error:", error);
      // Handle specific Firebase errors for better UX
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          throw new Error("Email is already in use. Try logging in instead.");
        } else if (error.code === "auth/weak-password") {
          throw new Error("Password is too weak. Please use a stronger password.");
        } else {
          throw new Error("Failed to create account. Please try again.");
        }
      } else {
        throw new Error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google login function using Firebase Authentication
  const googleLogin = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const email = firebaseUser.email || '';
      
      // Check admin status using admin email list
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: email,
        isAdmin: isAdmin,
        avatar: firebaseUser.photoURL || undefined
      };
      
      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      
      return user;
    } catch (error) {
      console.error("Google login error:", error);
      if (error instanceof FirebaseError) {
        if (error.code === "auth/popup-closed-by-user") {
          throw new Error("Sign in was cancelled");
        } else {
          throw new Error("Failed to sign in with Google. Please try again.");
        }
      } else {
        throw new Error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function using Firebase Authentication
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear any additional localStorage items
      localStorage.removeItem("isAdmin");
      
      // Redirect to splash screen
      window.location.href = "/splash";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("zooquest_user", JSON.stringify(updatedUser));
      
      // Update name for HomePage greeting if it changed
      if (userData.name) {
        localStorage.setItem("userName", userData.name);
      }
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof FirebaseError) {
        if (error.code === "auth/user-not-found") {
          throw new Error("No account found with this email address");
        } else {
          throw new Error("Failed to send reset email. Please try again.");
        }
      } else {
        throw new Error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signUp: signup,
        loginWithGoogle: googleLogin,
        logout,
        updateUser,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


