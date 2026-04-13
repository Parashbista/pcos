# Dark Mode Implementation Guide

## Overview
Dark mode has been successfully implemented across your PCOS Tracker app. Users can toggle dark mode from the Profile screen (between Partner Mode and Log Out), and the preference persists across app sessions.

## What Was Implemented

### 1. Theme Context (`contexts/ThemeContext.tsx`)
- Manages dark mode state globally across the entire app
- Persists user preference in AsyncStorage
- Provides `isDarkMode`, `toggleDarkMode`, and `colors` to all components
- Automatically loads saved preference on app start

### 2. Dark Color Palette (`constants/theme.ts`)
- Added complete `darkColors` object with dark theme colors
- Maintains brand consistency (pink primary color stays the same)
- Proper contrast for text readability in dark mode
- All neutral colors inverted for dark backgrounds

### 3. Themed Styles Hook (`hooks/useThemedStyles.ts`)
- Convenient hook that provides themed colors and common styles
- Makes it easy to apply dark mode to any screen
- Includes helper styles for containers, cards, text, inputs, and borders

### 4. Updated Screens
The following screens now fully support dark mode:
- ✅ ProfileScreen - Toggle location and full dark mode support
- ✅ HomeScreen - Main dashboard with all cards and trackers
- ✅ SettingsScreen - Settings menu with all options
- ✅ LoginScreen - Authentication screen

### 5. App Integration (`App.tsx`)
- ThemeProvider wraps the entire app
- All screens have access to theme context

## How Dark Mode Works

1. User toggles the switch in Profile screen
2. ThemeContext updates the `isDarkMode` state
3. Preference is saved to AsyncStorage
4. All screens using `useThemedStyles()` automatically update
5. On next app launch, preference is loaded from storage

## Adding Dark Mode to Other Screens

To add dark mode support to any screen:

### Step 1: Import the hook
```typescript
import { useThemedStyles } from '../hooks/useThemedStyles';
```

### Step 2: Use in your component
```typescript
export const YourScreen = () => {
  const { colors } = useThemedStyles();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Hello</Text>
    </View>
  );
};
```

### Step 3: Replace hardcoded colors
Replace all hardcoded color values with theme colors:

**Before:**
```typescript
<View style={{ backgroundColor: '#F9FAFB' }}>
  <Text style={{ color: '#1F2937' }}>Title</Text>
  <Text style={{ color: '#6B7280' }}>Subtitle</Text>
</View>
```

**After:**
```typescript
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.textPrimary }}>Title</Text>
  <Text style={{ color: colors.textSecondary }}>Subtitle</Text>
</View>
```

## Available Theme Colors

### Background & Surfaces
- `colors.background` - Main screen background
- `colors.card` - Card/container background
- `colors.white` - Alternative surface color
- `colors.border` - Border colors
- `colors.borderLight` - Lighter borders

### Text Colors
- `colors.textPrimary` - Primary text (headings, important text)
- `colors.textSecondary` - Secondary text (subtitles, labels)
- `colors.textMuted` - Muted text (placeholders, hints)
- `colors.textLight` - Very light text

### Brand & Feature Colors
- `colors.primary` - Brand pink (#EC4899) - same in both modes
- `colors.mood` - Mood tracking green
- `colors.sleep` - Sleep tracking blue
- `colors.period` - Period tracking pink
- `colors.reminder` - Reminder purple
- `colors.insights` - Insights orange

### Status Colors
- `colors.success` - Success green
- `colors.warning` - Warning orange
- `colors.error` - Error red

## Remaining Screens to Update

The following screens still need dark mode support:
- RegisterScreen
- ForgotPasswordScreen
- VerifyEmailScreen
- MoodTrackingScreen
- MoodHistoryScreen
- MoodboardScreen
- SleepTrackingScreen
- SleepHistoryScreen
- PeriodTrackingScreen
- PeriodHistoryScreen
- SymptomTrackingScreen
- SupplementTrackingScreen
- ReminderScreen
- InsightsScreen
- ChatbotScreen
- PartnerSharingScreen
- EditProfileScreen
- ExportDataScreen
- ChangePasswordScreen
- NotificationSettingsScreen
- HelpFAQScreen
- PrivacyPolicyScreen
- AboutScreen
- ContactSupportScreen
- AppearanceScreen

## Quick Update Pattern

For each screen, follow this pattern:

1. Add import: `import { useThemedStyles } from '../hooks/useThemedStyles';`
2. Get colors: `const { colors } = useThemedStyles();`
3. Find and replace:
   - `'#F9FAFB'` → `colors.background`
   - `'white'` or `'#FFFFFF'` → `colors.card`
   - `'#1F2937'` → `colors.textPrimary`
   - `'#6B7280'` → `colors.textSecondary`
   - `'#9CA3AF'` → `colors.textMuted`
   - `'#E5E7EB'` → `colors.border`
   - `'#F3F4F6'` → `colors.borderLight`

## Testing Dark Mode

1. Open the app and navigate to Profile screen
2. Toggle the "Dark Mode" switch
3. Navigate through different screens to see the changes
4. Close and reopen the app - dark mode preference should persist
5. Toggle back to light mode to verify both themes work

## Notes

- The pink header sections intentionally stay the same in both modes for brand consistency
- Feature-specific colors (mood green, sleep blue, etc.) remain the same for recognition
- Only neutral colors (backgrounds, text, borders) change between modes
- Dark mode uses proper contrast ratios for accessibility
