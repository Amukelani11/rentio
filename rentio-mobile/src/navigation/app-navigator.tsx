import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../contexts/auth-context';
import TabNavigator from './tab-navigator';
import AuthNavigator from './auth-navigator';
import LoadingScreen from '../screens/loading';
import ListingDetailScreen from '../screens/listing-detail';
import BookingScreen from '../screens/booking';
import ChatScreen from '../screens/chat';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="ListingDetail"
              component={ListingDetailScreen}
              options={{
                headerShown: true,
                title: 'Listing Details',
              }}
            />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{
                headerShown: true,
                title: 'Book Now',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                title: 'Messages',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;