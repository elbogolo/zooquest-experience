import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification as sendEmailVerificationFirebase,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile
} from 'firebase/auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { auth } from '@/lib/firebase';
import { User, AuthContextType } from "@/types/auth";
import { AuthContext } from "./auth-context";

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Convert Firebase user to app user
  const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    // Define admin email addresses - you can customize this list
    const adminEmails = [
      'admin@zooquest.com',
      'admin@example.com',
      'test@admin.com',
      'admin@gmail.com',
      'admin@test.com',
      'test@test.com',
      'elbogolo@gmail.com', // Add your email here
      // Add more admin emails as needed
    ];
    
    const userEmail = firebaseUser.email || '';
    const isAdmin = adminEmails.includes(userEmail.toLowerCase());
    
    // Check if user signed in with Google - Google users have verified emails
    const isGoogleUser = firebaseUser.providerData.some(
      provider => provider.providerId === 'google.com'
    );
    
    // Debug logging to help identify admin status
    console.log('Firebase User Email:', userEmail);
    console.log('Is Admin:', isAdmin);
    console.log('Is Google User:', isGoogleUser);
    console.log('Admin Emails List:', adminEmails);
    
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: userEmail,
      isAdmin: isAdmin,
      emailVerified: firebaseUser.emailVerified || isGoogleUser, // Google users are considered verified
      avatar: firebaseUser.photoURL || undefined,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
    };
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    setIsLoading(true);
    
    const initializeGoogleAuth = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleAuth.initialize({
            clientId: '664605890086-uvs7ek71o7d0lpf0m613qjb59ss9tl8d.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
        } catch (error) {
          console.error('Failed to initialize GoogleAuth:', error);
        }
      }
    };

    initializeGoogleAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser = convertFirebaseUser(firebaseUser);
        setUser(appUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const appUser = convertFirebaseUser(result.user);
      return appUser;
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    try {
      setIsLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, {
        displayName: name
      });
      
      // Send email verification
      await sendEmailVerificationFirebase(result.user);
      
      const appUser = convertFirebaseUser(result.user);
      return appUser;
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      setIsLoading(true);
      
      // Check if we're running on a mobile device (Capacitor)
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Google Auth for mobile
        const googleUser = await GoogleAuth.signIn();
        
        // Create Firebase credential from Google Auth response
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        const result = await signInWithCredential(auth, credential);
        
        const appUser = convertFirebaseUser(result.user);
        return appUser;
      } else {
        // Use Firebase popup for web
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const appUser = convertFirebaseUser(result.user);
        return appUser;
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Navigate to auth page after successful logout
      window.location.href = '/auth';
    } catch (error: unknown) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      throw new Error(errorMessage);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const sendEmailVerificationMethod = async (): Promise<void> => {
    try {
      if (auth.currentUser) {
        await sendEmailVerificationFirebase(auth.currentUser);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error: unknown) {
      console.error('Email verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      throw new Error(errorMessage);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signUp,
    logout,
    updateUser,
    resetPassword,
    loginWithGoogle,
    sendEmailVerification: sendEmailVerificationMethod,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
