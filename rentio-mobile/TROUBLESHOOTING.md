# Rentio Mobile - Troubleshooting Guide

## Getting Detailed Error Logs

### 1. **Quick Start with Debug Logging**
```bash
# On Windows (double-click this file)
debug-start.bat

# Or manually in terminal:
cd C:\Users\i5\Downloads\rentio\rentio-mobile
set EXPO_DEBUG=true
npx expo start --clear
```

### 2. **Common Error Types & Solutions**

#### Java/Casting Errors (String to Double)
```bash
# Clear all caches
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Clean install (if needed)
rm -rf node_modules package-lock.json
npm install
```

#### Metro Bundler Issues
```bash
# Check Metro logs at:
http://localhost:8081

# Reset Metro completely
npx expo start --reset-cache

# Check port conflicts
netstat -ano | findstr :8081
```

#### React Native Specific Errors
```bash
# Check React Native version compatibility
npx expo doctor

# Update to compatible versions
npx expo install --fix

# Check for specific package issues
npm ls react react-native
```

### 3. **Debug Commands**

#### Basic Commands
```bash
# Start with verbose logging
EXPO_DEBUG=true npm start

# Start on specific platform
npm run android    # or ios, web

# Check diagnostics
npx expo diagnostics

# Health check
npx expo doctor
```

#### Cache Clearing
```bash
# Clear Expo cache
npx expo start --clear

# Clear Metro cache
npx expo start --reset-cache

# Clear all app data (in simulator/device)
# Shake device > Dev Menu > "Clear cache" or "Debug"
```

### 4. **Where to Find Logs**

#### Terminal Logs
- Look for emojis: 🔥, ❌, ⚠️, ✅
- Red text = errors
- Yellow text = warnings
- Green text = success

#### Metro Bundler Logs
- Open: http://localhost:8081
- Shows bundle loading errors
- Shows import/export issues
- Shows module resolution problems

#### Device Logs
**Android:**
```bash
adb logcat | grep -i rentio
adb logcat | grep -i react
```

**iOS Simulator:**
- Open Simulator > Debug > Open System Log
- Search for "Rentio" or errors

#### Expo Dev Menu
- Shake device or press Ctrl+M (Android) / Cmd+D (iOS)
- Shows performance monitor
- Shows element inspector
- Shows network requests

### 5. **Common Java String/Double Issues**

This error typically occurs in these scenarios:

#### 1. **Package Version Conflicts**
```json
// In package.json, ensure compatible versions:
"react": "18.2.0",
"react-native": "0.72.6",
"expo": "~49.0.0"
```

#### 2. **Build Configuration Issues**
```json
// In app.json, ensure proper types:
"buildNumber": "1",  // Not "1.0.0"
"versionCode": 1,
```

#### 3. **Plugin Configuration**
```json
// Ensure plugins are properly configured:
"plugins": [
  "expo-secure-store",
  ["expo-image-picker", {...}],
  ["expo-location", {...}]
]
```

### 6. **Getting Help**

#### If you see Java errors:
1. Use `debug-start.bat` for detailed logging
2. Check Metro bundler at http://localhost:8081
3. Run `npx expo doctor` for compatibility issues
4. Clear all caches and restart

#### If you see React Native errors:
1. Check console for red box errors
2. Look for import/export mismatches
3. Check component props and state
4. Verify navigation setup

### 7. **Quick Fix Checklist**

✅ Delete node_modules and package-lock.json
✅ Run `npm install`
✅ Run `npx expo start --clear`
✅ Check Metro bundler logs
✅ Verify app.json configuration
✅ Run `npx expo doctor`
✅ Check device console logs

### 8. **Error Log Examples**

**Good logs to look for:**
```
🚀 Starting Rentio Mobile App
📱 Platform: android
✅ App registered successfully
📱 App component mounted
```

**Error patterns to watch for:**
```
🔥 Unhandled Error: Cannot read property 'map' of undefined
❌ Failed to register app: TypeError: string is not a function
⚠️ Warning: Each child in a list should have a unique "key" prop
```