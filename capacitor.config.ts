import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d86b7ae12aab484581780140b755e651',
  appName: 'Accra Zoo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '664605890086-uvs7ek71o7d0lpf0m613qjb59ss9tl8d.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
