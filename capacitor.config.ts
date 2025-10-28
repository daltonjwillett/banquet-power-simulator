import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wildmethod.powersim',
  appName: 'Banquet Power Simulator',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow cleartext for localhost during dev
    cleartext: true,
  },
  android: {
    // Force hardware acceleration
    webContentsDebuggingEnabled: true,
    // Use modern web features
    useLegacyBridge: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;