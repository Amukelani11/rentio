import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { View, Image, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, ThemedText, Stack } from '../components';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

type WelcomeNav = StackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={styles.topLogoWrap}>
          <Image source={require('../../assets/rentiologo.png')} style={styles.topLogo} />
        </View>

        <View style={styles.heroCenter}>
          <Image source={require('../../assets/welcomeimg.png')} style={styles.welcomeImg} />

          <ThemedText variant="title" weight="bold" style={[styles.title, { color: '#0B1220', marginTop: 18 }]}> 
            Why buy? Rent it nearby.
          </ThemedText>

          <ThemedText variant="body" style={[styles.subtitle, { color: '#374151', marginTop: 8, paddingHorizontal: 24 }]}> 
            Earn with your stuff. Rent what you need. Simple. Safe. Secure.
          </ThemedText>

          <View style={styles.ctasColumn}>
            <View style={styles.primaryCtaFull}>
              <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
            </View>
            <View style={styles.secondaryCtaFull}>
              <Button
                title="Sign In"
                variant="ghost"
                style={{ backgroundColor: '#F3F4F6' }}
                onPress={() => navigation.navigate('Login')}
              />
            </View>
          </View>

          <ThemedText variant="caption" style={{ color: '#6B7280', textAlign: 'center', marginTop: 12 }}>
            Secure payments • Deposits protected • Trusted renters
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  heroWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  logo: {
    width: 96,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  ctaRowWrapper: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
  },
  ctaRow: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  primaryCta: {
    flex: 1,
    marginRight: 8,
  },
  ghostCta: {
    flex: 1,
    marginLeft: 8,
  },
  topLogoWrap: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 6,
  },
  topLogo: {
    width: 140,
    height: 40,
    resizeMode: 'contain',
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  welcomeImg: {
    width: 460,
    height: 320,
    resizeMode: 'contain',
  },
  ctasColumn: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  primaryCtaFull: {
    width: '100%',
    backgroundColor: '#E94A4A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  secondaryCtaFull: {
    width: '100%',
    marginTop: 12,
  },
});
