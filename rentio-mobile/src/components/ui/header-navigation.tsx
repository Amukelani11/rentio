import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/auth-context';

interface HeaderNavigationProps {
  navigation: any;
  currentRoute?: string;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ navigation, currentRoute }) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navigationButtons = [
    {
      key: 'Dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      route: 'Dashboard',
    },
    {
      key: 'ListItem',
      label: 'List Item',
      icon: 'add-circle-outline',
      route: 'ListingDetail',
    },
    {
      key: 'Browse',
      label: 'Browse',
      icon: 'search-outline',
      route: 'Browse',
    },
  ];

  const handleNavigation = (route: string) => {
    if (route === 'ListingDetail') {
      navigation.navigate('ListingDetail');
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Text style={styles.appName}>Rentio</Text>
        <View style={styles.navigationButtons}>
          {navigationButtons.map((button) => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.navButton,
                currentRoute === button.route && styles.navButtonActive,
              ]}
              onPress={() => handleNavigation(button.route)}
            >
              <Ionicons
                name={button.icon as any}
                size={18}
                color={currentRoute === button.route ? '#E53237' : '#6B7280'}
              />
              <Text
                style={[
                  styles.navButtonText,
                  currentRoute === button.route && styles.navButtonTextActive,
                ]}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 44, // Account for status bar
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53237',
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  navButtonActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#E53237',
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  navButtonTextActive: {
    color: '#E53237',
    fontWeight: '600',
  },
});

export default HeaderNavigation;
