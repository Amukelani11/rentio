# Rentio Mobile App

A modern, sleek React Native mobile application for Rentio - a peer-to-peer and business rental marketplace for South Africa. Built with Expo, TypeScript, and Supabase.

## 🚀 Features

### 🏠 Core Functionality
- **Browse & Discover**: Search and filter rental items by category, price, and location
- **Real-time Messaging**: WhatsApp-style chat with real-time message updates
- **Booking Management**: Complete rental workflow from inquiry to completion
- **Secure Payments**: Integrated payment processing with multiple providers
- **User Authentication**: Role-based access control with KYC verification
- **Dashboard**: Personal analytics and activity tracking

### 📱 Mobile-Specific Features
- **Location Services**: GPS-based search and delivery radius settings
- **Push Notifications**: Real-time alerts for messages and booking updates
- **Camera Integration**: Photo uploads for listings and profile pictures
- **Offline Support**: Cached data for seamless offline experience
- **Biometric Auth**: Secure login with fingerprint/Face ID

## 🛠 Technology Stack

### Core Technologies
- **Framework**: Expo SDK ~54.0.10
- **Language**: TypeScript 5.9.2
- **Database**: PostgreSQL with Supabase
- **Navigation**: React Navigation 6.x
- **Styling**: NativeWind (Tailwind CSS for React Native)

### Key Libraries
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Expo Vector Icons
- **Maps**: React Native Maps
- **Payments**: Stripe React Native
- **Real-time**: Supabase Realtime
- **UI Components**: Custom components with CVA

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm package manager
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio/Emulator

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the following variables:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development server**
   ```bash
   # Start Expo development server
   pnpm start

   # Or run on specific platform
   pnpm android    # Android
   pnpm ios        # iOS
   pnpm web        # Web
   ```

## 🏗 Project Structure

```
src/
├── app/                    # App entry point and navigation
│   ├── _layout.tsx        # Root layout with providers
│   ├── (auth)/            # Authentication screens
│   ├── (main)/            # Main app screens with tab navigation
│   └── _sentry.tsx        # Error monitoring setup
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, cards, etc.)
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── screens/               # App screens
│   ├── auth/             # Authentication screens
│   ├── browse.tsx        # Browse listings
│   ├── booking.tsx       # Booking flow
│   ├── messages.tsx      # Messaging
│   ├── dashboard.tsx     # User dashboard
│   └── profile.tsx       # User profile
├── services/              # API and business logic
│   └── api.ts           # Supabase API service
├── contexts/              # React contexts
│   └── auth-context.tsx  # Authentication context
├── lib/                   # Utility libraries
│   ├── supabase.ts      # Supabase client config
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Helper functions
└── hooks/                 # Custom React hooks
```

## 🎨 Design System

### Color Palette
- **Primary**: #E53237 (Coral Red)
- **Secondary**: #1F2937 (Dark Gray)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Neutral**: #F3F4F6, #6B7280 (Light/Dark Gray)

### Typography
- **Headings**: Bold, 24-18px
- **Body**: Regular, 16-12px
- **Captions**: 12-10px
- **Font Family**: System default (San Francisco for iOS, Roboto for Android)

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Consistent border radius and shadow
- **Forms**: Standardized input fields with validation
- **Navigation**: Bottom tab navigation with clear icons

## 🔐 Authentication & Security

### User Roles
- **CUSTOMER**: Can rent items
- **INDIVIDUAL_LISTER**: Can list personal items
- **BUSINESS_LISTER**: Can manage business listings
- **ADMIN**: Full system access

### Security Features
- **JWT Authentication**: Supabase Auth with secure tokens
- **Row Level Security**: Database-level permissions
- **KYC Verification**: Identity verification for users
- **Secure Storage**: Expo Secure Store for sensitive data
- **Rate Limiting**: API protection against abuse

## 📊 Database Integration

### Real-time Features
- **Live Messages**: Real-time chat using Supabase subscriptions
- **Booking Updates**: Live status changes and notifications
- **Presence Tracking**: Online/offline status indicators

### Data Flow
1. **Client** → **Supabase API** → **PostgreSQL Database**
2. **Real-time subscriptions** for live updates
3. **Offline support** with cached queries
4. **Optimistic updates** for responsive UI

## 🚀 Deployment

### Build for Production

```bash
# Build for App Store (iOS)
eas build --platform ios

# Build for Play Store (Android)
eas build --platform android

# Build for all platforms
eas build --platform all
```

### Environment Configuration

Production builds require:
- **App Store Connect** configuration (iOS)
- **Google Play Console** setup (Android)
- **Environment variables** in Expo EAS
- **Push notification certificates**
- **Stripe payment configuration**

## 📱 Platform-Specific Notes

### iOS Development
- Minimum iOS version: 13.0
- Requires Apple Developer account for App Store deployment
- Supports Face ID for authentication
- Push notifications via Apple Push Notification Service (APNs)

### Android Development
- Minimum Android version: 21 (Android 5.0)
- Supports fingerprint authentication
- Push notifications via Firebase Cloud Messaging (FCM)
- Google Play Store deployment requires signed APK/AAB

## 🔧 Development Commands

```bash
# Development
pnpm start              # Start Expo development server
pnpm android            # Start on Android emulator/device
pnpm ios                # Start on iOS simulator/device
pnpm web                # Start web version

# Building
eas build --platform ios     # Build iOS app
eas build --platform android # Build Android app

# Testing
eas device:create            # Create test device
eas submit --platform all   # Submit to app stores

# Utilities
expo doctor                  # Check project health
expo install [package]       # Install Expo package
```

## 🐛 Debugging

### Common Issues
1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Database connection**: Verify Supabase credentials
3. **Build failures**: Check Expo CLI version compatibility
4. **Navigation issues**: Verify route definitions and params

### Debug Tools
- **React Developer Tools**: For component inspection
- **Expo DevTools**: For Metro bundler debugging
- **Sentry**: For error monitoring and crash reporting
- **Flipper**: For advanced debugging (Android)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [Supabase documentation](https://supabase.com/docs)

## 🗺 Roadmap

### Upcoming Features
- [ ] Multi-language support (English, Afrikaans, Zulu)
- [ ] Advanced search with filters and sorting
- [ ] In-app payments and wallet system
- [ ] Rating and review system
- [ ] AR/VR item preview
- [ ] Apple Watch companion app
- [ ] Dark mode support
- [ ] Accessibility improvements

---

Built with ❤️ for the South African rental community