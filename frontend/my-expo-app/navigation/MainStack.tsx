import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SleepTrackingScreen } from '../screens/SleepTrackingScreen';
import { SleepHistoryScreen } from '../screens/SleepHistoryScreen';
import { MoodTrackingScreen } from '../screens/MoodTrackingScreen';
import { MoodHistoryScreen } from '../screens/MoodHistoryScreen';
import { PeriodTrackingScreen } from '../screens/PeriodTrackingScreen';
import { PeriodHistoryScreen } from '../screens/PeriodHistoryScreen';
import { ReminderScreen } from '../screens/ReminderScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { ExportDataScreen } from '../screens/ExportDataScreen';
import { AppearanceScreen } from '../screens/AppearanceScreen';
import { HelpFAQScreen } from '../screens/HelpFAQScreen';
import { ContactSupportScreen } from '../screens/ContactSupportScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

// Main Stack Navigator
export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen
            onNavigateToProfile={() => navigation.navigate('Profile')}
            onNavigateToSettings={() => navigation.navigate('Settings')}
            onNavigateToPeriodTracking={() => navigation.navigate('PeriodTracking')}
            onNavigateToMoodTracking={() => navigation.navigate('MoodTracking')}
            onNavigateToSleepTracking={() => navigation.navigate('SleepTracking')}
            onNavigateToReminders={() => navigation.navigate('Reminders')}
            onNavigateToInsights={() => navigation.navigate('Insights')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen
            onNavigateBack={() => navigation.goBack()}
            onNavigateToSettings={() => navigation.navigate('Settings')}
            onNavigateToEditProfile={() => navigation.navigate('EditProfile')}
            onNavigateToMoodTracking={() => navigation.navigate('MoodTracking')}
            onNavigateToSleepTracking={() => navigation.navigate('SleepTracking')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="EditProfile">
        {({ navigation }) => (
          <EditProfileScreen
            onNavigateBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Insights">
        {({ navigation }) => (
          <InsightsScreen
            onNavigateBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <SettingsScreen
              onNavigateBack={() => navigation.goBack()}
              onNavigateToChangePassword={() => navigation.navigate('ChangePassword')}
              onNavigateToNotifications={() => navigation.navigate('NotificationSettings')}
              onNavigateToExportData={() => navigation.navigate('ExportData')}
              onNavigateToAppearance={() => navigation.navigate('Appearance')}
              onNavigateToHelpFAQ={() => navigation.navigate('HelpFAQ')}
              onNavigateToContactSupport={() => navigation.navigate('ContactSupport')}
              onNavigateToPrivacyPolicy={() => navigation.navigate('PrivacyPolicy')}
              onNavigateToAbout={() => navigation.navigate('About')}
            />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="ChangePassword">
        {({ navigation }) => (
          <ChangePasswordScreen
            onNavigateBack={() => navigation.goBack()}
            onChangePasswordSuccess={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SleepTracking">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <SleepTrackingScreen
              onNavigateBack={() => navigation.goBack()}
              onNavigateToHistory={() => navigation.navigate('SleepHistory')}
            />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="SleepHistory">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <SleepHistoryScreen onNavigateBack={() => navigation.goBack()} />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="MoodTracking">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <MoodTrackingScreen
              onNavigateBack={() => navigation.goBack()}
              onNavigateToHistory={() => navigation.navigate('MoodHistory')}
            />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="MoodHistory">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <MoodHistoryScreen onNavigateBack={() => navigation.goBack()} />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="PeriodTracking">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <PeriodTrackingScreen
              onNavigateBack={() => navigation.goBack()}
              onNavigateToHistory={() => navigation.navigate('PeriodHistory')}
            />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="PeriodHistory">
        {({ navigation }) => (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <PeriodHistoryScreen onNavigateBack={() => navigation.goBack()} />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="Reminders">
        {({ navigation }) => (
          <ReminderScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="NotificationSettings">
        {({ navigation }) => (
          <NotificationSettingsScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="ExportData">
        {({ navigation }) => (
          <ExportDataScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Appearance">
        {({ navigation }) => (
          <AppearanceScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="HelpFAQ">
        {({ navigation }) => (
          <HelpFAQScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="ContactSupport">
        {({ navigation }) => (
          <ContactSupportScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="PrivacyPolicy">
        {({ navigation }) => (
          <PrivacyPolicyScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
      <Stack.Screen name="About">
        {({ navigation }) => (
          <AboutScreen onNavigateBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
