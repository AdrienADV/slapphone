import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slapphone.app',
  appName: 'Slap Phone',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      launchFadeOutDuration: 500,
      backgroundColor: '#95A176',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#ffffffff'
    },
    CapacitorUpdater: {
      version: '0.0.0',
      appId: 'com.slapphone.app',
      autoUpdate: true,
      directUpdate: 'always',
      autoSplashscreen: true
    }
  }
};

export default config;
