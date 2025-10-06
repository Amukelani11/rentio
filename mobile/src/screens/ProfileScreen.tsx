import { useLayoutEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ThemedText, ThemedView, Button } from '../components';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<ProfileNav>();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions?.({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" weight="bold" style={styles.title}>
            Profile
          </ThemedText>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.avatar} />
          </View>
          <ThemedText variant="subtitle" weight="semibold" style={styles.name}>
            John Doe
          </ThemedText>
          <ThemedText variant="body" style={styles.email}>
            john@example.com
          </ThemedText>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <ThemedText variant="body" style={styles.menuText}>Personal Information</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={20} color="#6B7280" />
            <ThemedText variant="body" style={styles.menuText}>Payment Methods</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
            <ThemedText variant="body" style={styles.menuText}>Security</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
            <ThemedText variant="body" style={styles.menuText}>Help & Support</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button 
            title="Sign Out" 
            variant="ghost"
            onPress={() => {}} 
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#0B1220',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  name: {
    color: '#0B1220',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    color: '#6B7280',
    fontSize: 14,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    color: '#0B1220',
    fontSize: 16,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoutButton: {
    borderColor: '#EF4444',
  },
});

