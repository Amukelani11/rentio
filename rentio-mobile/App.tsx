import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/auth-context';
import AppNavigator from './src/navigation/app-navigator';

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log('📱 App component mounted');

      // Log any unhandled errors
      const handleError = (error: Error) => {
        console.error('🔥 Unhandled Error:', error);
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('🔥 Unhandled Promise Rejection:', event.reason);
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
