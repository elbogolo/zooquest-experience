
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d86b7ae12aab484581780140b755e651',
  appName: 'zooquest-experience',
  webDir: 'dist',
  server: {
    url: 'https://d86b7ae1-2aab-4845-8178-0140b755e651.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2A7D4E",
      showSpinner: true,
      spinnerColor: "#FFFFFF",
      androidSplashResourceName: "splash"
    }
  }
};

export default config;
