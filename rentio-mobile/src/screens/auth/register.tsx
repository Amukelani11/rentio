import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Input from '../../components/ui/input';
import Button from '../../components/ui/button';
import { useAuth } from '../../contexts/auth-context';

const RegisterScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign up');
      } else {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF5A5F20', '#FFFFFF']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Rentio community</Text>
        </View>

        <View style={styles.form}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Full name"
          />
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
            >
              Sign in
            </Text>
          </View>
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
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  link: {
    color: '#E53237',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;