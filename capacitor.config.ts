import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d86b7ae12aab484581780140b755e651',
  appName: 'zooquest-experience',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
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
