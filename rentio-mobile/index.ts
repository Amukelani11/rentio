import { registerRootComponent } from 'expo';

import App from './App';

// Enable better error logging
if (__DEV__) {
  console.log('🚀 Starting Rentio Mobile App');
  console.log('📱 Platform:', process.env.EXPO_OS || 'unknown');
  console.log('🔧 Debug mode enabled');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
try {
  registerRootComponent(App);
  console.log('✅ App registered successfully');
} catch (error) {
  console.error('❌ Failed to register app:', error);
}
