#!/bin/bash

echo "🚀 Starting Rentio Mobile App with Debug Logging"
echo "=================================================="

# Set environment variables for better debugging
export EXPO_DEBUG=true
export RCT_METRO_PORT=8081
export RCT_NO_LAUNCH_PACKAGER=0

# Clear any existing processes
echo "🧹 Clearing any existing processes..."
pkill -f "expo.*start" 2>/dev/null || true
pkill -f "metro.*bundler" 2>/dev/null || true

# Clear cache
echo "🗑️  Clearing cache..."
npx expo start --clear 2>&1 | tee expo-debug.log

echo ""
echo "📱 Expo Debug Log saved to: expo-debug.log"
echo "🌐 Metro Bundler: http://localhost:8081"
echo ""
echo "💡 Tips:"
echo "  - Check the console for emoji-marked errors (🔥, ❌, ⚠️)"
echo "  - Open http://localhost:8081 in browser for Metro logs"
echo "  - Press 'd' in terminal to open Dev Menu"
echo "  - Press 'r' to reload the app"
echo "  - Press 'q' to quit"