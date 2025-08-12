/**
 * Firebase Authentication Debug Utility
 * Test Firebase auth configuration and connection
 */

import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export const testFirebaseAuth = async () => {
  console.log('🔧 Testing Firebase Authentication...');
  
  // Test Firebase config
  console.log('Firebase Auth instance:', auth);
  console.log('Firebase Auth app:', auth.app);
  console.log('Firebase Auth settings:', auth.config);
  
  // Test with a sample email/password
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  
  try {
    console.log('🧪 Testing user creation...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created successfully:', userCredential.user);
    
    // Clean up - delete the test user
    if (userCredential.user) {
      await userCredential.user.delete();
      console.log('🧹 Test user cleaned up');
    }
    
    return { success: true, message: 'Firebase Authentication is working' };
  } catch (error: unknown) {
    console.error('❌ Firebase Auth test failed:', error);
    
    // Type guard for Firebase auth errors
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const firebaseError = error as { code: string; message: string };
      console.error('Error code:', firebaseError.code);
      console.error('Error message:', firebaseError.message);
      
      // Common Firebase auth errors
      if (firebaseError.code === 'auth/operation-not-allowed') {
        return { 
          success: false, 
          message: 'Email/Password authentication is not enabled in Firebase Console' 
        };
      } else if (firebaseError.code === 'auth/weak-password') {
        return { 
          success: false, 
          message: 'Password should be at least 6 characters' 
        };
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        return { 
          success: true, 
          message: '✅ Firebase Authentication is working! (Test email already exists)' 
        };
      } else if (firebaseError.code === 'auth/invalid-email') {
        return { 
          success: false, 
          message: 'Invalid email format' 
        };
      }
      
      return { 
        success: false, 
        message: `Firebase Auth Error: ${firebaseError.message}` 
      };
    }
    
    return { 
      success: false, 
      message: `Unknown error: ${String(error)}` 
    };
  }
};

// Check if Firebase is properly initialized
export const checkFirebaseInit = () => {
  console.log('🔍 Checking Firebase initialization...');
  
  if (!auth) {
    console.error('❌ Firebase Auth not initialized');
    return false;
  }
  
  if (!auth.app) {
    console.error('❌ Firebase App not found');
    return false;
  }
  
  console.log('✅ Firebase properly initialized');
  console.log('Project ID:', auth.app.options.projectId);
  console.log('Auth Domain:', auth.app.options.authDomain);
  
  return true;
};
