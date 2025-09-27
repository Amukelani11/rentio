import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/ui/button';

const onboardingSteps = [
  {
    title: 'Complete Your Profile',
    description: 'Add your photo, location, and verification details to build trust.',
  },
  {
    title: 'Set Up Payment Methods',
    description: 'Add your payment information for secure transactions.',
  },
  {
    title: 'Explore the Platform',
    description: 'Browse available items or list your first rental.',
  },
];

const OnboardingScreen: React.FC = ({ route, navigation }: any) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { roles } = route.params || { roles: ['CUSTOMER'] };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF5A5F20', '#FFFFFF']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentStep(index)}
              style={styles.progressStep}
            >
              {index <= currentStep ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#E53237"
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color="#D1D5DB"
                />
              )}
              <Text
                style={[
                  styles.progressText,
                  { color: index <= currentStep ? '#E53237' : '#9CA3AF' },
                ]}
              >
                Step {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            {onboardingSteps[currentStep].title}
          </Text>
          <Text style={styles.description}>
            {onboardingSteps[currentStep].description}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            style={styles.button}
          />
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip onboarding</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#6B7280',
    lineHeight: 26,
  },
  actions: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  skip: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingScreen;