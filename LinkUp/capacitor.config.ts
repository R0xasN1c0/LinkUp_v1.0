
/**
 * LinkUp Mobile Application Configuration
 * 
 * This file configures Capacitor for building the LinkUp mobile application.
 * It specifies app metadata, platform-specific settings, and plugin configurations.
 */
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Unique identifier for the app
  appId: 'com.linkup.linkup',
  
  // Display name shown to users
  appName: 'LinkUp',
  
  // Output directory for web builds
  webDir: 'dist',
  
  // Server configuration for development and testing
  server: {
    androidScheme: 'https',
    cleartext: true // Allows clear text traffic for development
  },
  
  // Plugin configurations
  plugins: {
    // Splash screen settings
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    
    // Cookie handling for authentication
    CapacitorCookies: {
      enabled: true
    },
    
    // HTTP requests configuration
    CapacitorHttp: {
      enabled: true
    },
    
    // Push notification settings
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  
  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    scheme: 'linkup',
    limitsNavigationsToAppBoundDomains: true,
    backgroundColor: "#ffffff"
  },
  
  // Android-specific configuration
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: true // Allows loading resources over HTTP and HTTPS
  }
};

export default config;
