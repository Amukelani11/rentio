import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View, Image, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Button, TextField, ThemedText, Stack } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { supabase } from '../lib/supabase';

type SignupNav = StackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen() {
  const theme = useTheme();
  const navigation = useNavigation<SignupNav>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Please check your email and click the link to verify your account.',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
            <ThemedText variant="title" weight="bold" style={styles.title}>
              Create your account
            </ThemedText>
            <ThemedText variant="body" style={styles.subtitle}>
              Join Rentio — list items, discover rentals, and earn extra income.
            </ThemedText>
          </View>

          <View style={styles.formSection}>
            <TextField 
              label="Full name" 
              value={name} 
              onChangeText={setName} 
              placeholder="Jordan Smith"
              style={[styles.input, { color: '#000000' }]}
            />
            <TextField
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholder="you@rentio.com"
              style={[styles.input, { color: '#000000' }]}
            />
            <TextField
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              style={[styles.input, { color: '#000000' }]}
            />
          </View>

          <View style={styles.buttonSection}>
            <Button
              title="Sign up"
              onPress={onSignup}
              loading={loading}
              disabled={!name || !email || !password}
              style={styles.signupButton}
            />

            <View style={styles.loginLink}>
              <ThemedText variant="body" style={styles.loginText}>
                Already have an account?
              </ThemedText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <ThemedText style={styles.loginLinkText}>Sign in</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0B1220',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  buttonSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  signupButton: {
    marginBottom: 24,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#374151',
    fontSize: 16,
  },
  loginLinkText: {
    color: '#E94A4A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
