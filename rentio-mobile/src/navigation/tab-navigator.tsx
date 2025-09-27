import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import HomeScreen from '../screens/home';
import BrowseScreen from '../screens/browse';
import MessagesScreen from '../screens/messages';
import DashboardScreen from '../screens/dashboard';
import ProfileScreen from '../screens/profile';
import HeaderNavigation from '../components/ui/header-navigation';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#E53237',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: true,
        tabBarLabelStyle: styles.tabBarLabel,
        header: () => (
          <HeaderNavigation 
            navigation={navigation} 
            currentRoute={route.name}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          tabBarLabel: 'Browse',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          tabBarLabel: 'Messages',
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingBottom: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TabNavigator;