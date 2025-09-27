import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';
import { formatPrice, formatDate } from '../lib/utils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  memberSince: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAdmin: boolean;
  roles: string[];
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

const mockProfile: UserProfile = {
  id: '1',
  name: 'Alex Thompson',
  email: 'alex.thompson@email.com',
  phone: '+27 83 123 4567',
  avatar: 'https://via.placeholder.com/100/FF5A5F/FFFFFF?text=AT',
  location: 'Cape Town, Western Cape',
  memberSince: '2023',
  rating: 4.8,
  reviewCount: 23,
  isVerified: true,
  isAdmin: false,
  roles: ['CUSTOMER', 'INDIVIDUAL_LISTER'],
};

const menuItems: MenuItem[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    subtitle: 'Update your profile details',
    icon: <Ionicons name="person" size={20} color="#1F2937" />,
    action: () => console.log('Personal info'),
  },
  {
    id: 'payment-methods',
    title: 'Payment Methods',
    subtitle: 'Manage your payment options',
    icon: <Ionicons name="card" size={20} color="#1F2937" />,
    action: () => console.log('Payment methods'),
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Configure your alerts',
    icon: <Ionicons name="notifications" size={20} color="#1F2937" />,
    badge: '3',
    action: () => console.log('Notifications'),
  },
  {
    id: 'verification',
    title: 'Verification',
    subtitle: 'Complete KYC verification',
    icon: <Ionicons name="shield-checkmark" size={20} color="#1F2937" />,
    action: () => console.log('Verification'),
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences and privacy',
    icon: <Ionicons name="settings" size={20} color="#1F2937" />,
    action: () => console.log('Settings'),
  },
  {
    id: 'help',
    title: 'Help & Support',
    subtitle: 'Get help and contact support',
    icon: <Ionicons name="help-circle" size={20} color="#1F2937" />,
    action: () => console.log('Help'),
  },
];

const ProfileScreen: React.FC = ({ navigation }: any) => {
  const [profile, setProfile] = useState(mockProfile);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => {
            // Handle sign out logic
            navigation.navigate('Auth');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderHeader = () => (
    <Card style={styles.headerCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{profile.avatar}</Text>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FCD34D" />
              <Text style={styles.statText}>{profile.rating}</Text>
            </View>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>{profile.reviewCount} reviews</Text>
            {profile.isVerified && (
              <>
                <Text style={styles.statDivider}>•</Text>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{profile.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{profile.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Member since {profile.memberSince}</Text>
        </View>
      </View>

      <View style={styles.rolesContainer}>
        <Text style={styles.rolesTitle}>Your Roles</Text>
        <View style={styles.rolesList}>
          {profile.roles.map((role) => (
            <Badge
              key={role}
              text={role.replace('_', ' ')}
              variant="default"
              style={styles.roleBadge}
            />
          ))}
        </View>
      </View>
    </Card>
  );

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValueLarge}>12</Text>
          <Text style={styles.statLabelLarge}>Active Listings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueLarge}>45</Text>
          <Text style={styles.statLabelLarge}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValueLarge}>R28,450</Text>
          <Text style={styles.statLabelLarge}>Total Earned</Text>
        </View>
      </View>
    </Card>
  );

  const renderMenuItems = () => (
    <Card style={styles.menuCard}>
      {menuItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
          <View style={styles.menuItemLeft}>
            {item.icon}
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          <View style={styles.menuItemRight}>
            {item.badge && (
              <Badge text={item.badge} variant="error" style={styles.menuBadge} />
            )}
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      ))}
    </Card>
  );

  const renderSignOut = () => (
    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
      <Ionicons name="log-out" size={20} color="#EF4444" />
      <Text style={styles.signOutText}>Sign Out</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderStats()}
        {renderMenuItems()}
        {renderSignOut()}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    fontSize: 64,
    width: 80,
    height: 80,
    borderRadius: 40,
    textAlign: 'center',
    lineHeight: 80,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E53237',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  statDivider: {
    fontSize: 14,
    color: '#D1D5DB',
    marginHorizontal: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  profileDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  rolesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  rolesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  rolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    marginBottom: 0,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabelLarge: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
});

export default ProfileScreen;