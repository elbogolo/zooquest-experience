// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANNi1jKtZ1ZMi8vYF2lYSJshY179Mfoq4",
  authDomain: "zooapp-f5766.firebaseapp.com",
  projectId: "zooapp-f5766",
  storageBucket: "zooapp-f5766.firebasestorage.app",
  messagingSenderId: "664605890086",
  appId: "1:664605890086:web:3cc42376390d24d76378e7",
  measurementId: "G-MRFJXEKT3K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Analytics - only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };
