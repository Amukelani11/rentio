import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/ui/button';
import Card from '../../components/ui/card';

interface RoleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roles: RoleCard[] = [
  {
    id: 'CUSTOMER',
    title: 'Customer',
    description: 'Rent items from others',
    icon: <Ionicons name="person" size={24} color="#E53237" />,
    color: '#FF5A5F20',
  },
  {
    id: 'INDIVIDUAL_LISTER',
    title: 'Individual Lister',
    description: 'Rent out your personal items',
    icon: <Ionicons name="briefcase" size={24} color="#E53237" />,
    color: '#10B98120',
  },
  {
    id: 'BUSINESS_LISTER',
    title: 'Business Lister',
    description: 'Manage business inventory',
    icon: <Ionicons name="business" size={24} color="#E53237" />,
    color: '#3B82F620',
  },
  {
    id: 'ADMIN',
    title: 'Administrator',
    description: 'Platform management',
    icon: <Ionicons name="shield-checkmark" size={24} color="#E53237" />,
    color: '#F59E0B20',
  },
];

const RoleSelectionScreen: React.FC = ({ navigation }: any) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedRoles.length === 0) {
      alert('Please select at least one role');
      return;
    }
    navigation.navigate('Onboarding', { roles: selectedRoles });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF5A5F20', '#FFFFFF']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use Rentio (you can choose multiple)
          </Text>
        </View>

        <ScrollView style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => toggleRole(role.id)}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.roleCard,
                  { backgroundColor: selectedRoles.includes(role.id) ? role.color : '#FFFFFF' },
                ]}
              >
                <View style={styles.roleContent}>
                  {role.icon}
                  <View style={styles.roleText}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    { borderColor: selectedRoles.includes(role.id) ? '#E53237' : '#D1D5DB' }
                  ]}>
                    {selectedRoles.includes(role.id) && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={selectedRoles.length === 0}
          style={styles.button}
        />

        <View style={styles.footer}>
          <Text
            style={styles.skipLink}
            onPress={() => navigation.navigate('Main')}
          >
            Skip for now
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  rolesContainer: {
    flex: 1,
    marginBottom: 24,
  },
  roleCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  roleText: {
    flex: 1,
    marginLeft: 16,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E53237',
  },
  button: {
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
  },
  skipLink: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RoleSelectionScreen;