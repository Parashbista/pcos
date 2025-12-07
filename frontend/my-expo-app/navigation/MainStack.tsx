import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  Calendar,
  Moon,
  Heart,
  ChevronRight,
  Lightbulb,
  Bell,
  User,
} from 'lucide-react-native';
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
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

// Feature Card Component
const FeatureCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}> = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity
    style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: color + '15',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {icon}
    </View>
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{title}</Text>
      <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>
    </View>
    <ChevronRight size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

// Quick Action Button
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    style={{
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: color + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      {icon}
    </View>
    <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}>{label}</Text>
  </TouchableOpacity>
);

// Home Screen
const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{getGreeting()}</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', marginTop: 2 }}>PCOS Tracker</Text>
            </View>
            <TouchableOpacity
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => navigation.navigate('Profile')}
            >
              <User size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Tip Card */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, marginTop: 18, flexDirection: 'row', alignItems: 'center' }}>
            <Lightbulb size={18} color="rgba(255,255,255,0.9)" />
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginLeft: 10, flex: 1, lineHeight: 18 }}>
              Consistent sleep helps regulate hormones. Try to maintain a regular schedule.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginTop: -18 }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 18,
              padding: 12,
              flexDirection: 'row',
              gap: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <QuickAction
              icon={<Calendar size={22} color="#EC4899" />}
              label="Period"
              color="#EC4899"
              onPress={() => navigation.navigate('PeriodTracking')}
            />
            <QuickAction
              icon={<Heart size={22} color="#F59E0B" />}
              label="Mood"
              color="#F59E0B"
              onPress={() => navigation.navigate('MoodTracking')}
            />
            <QuickAction
              icon={<Moon size={22} color="#3B82F6" />}
              label="Sleep"
              color="#3B82F6"
              onPress={() => navigation.navigate('SleepTracking')}
            />
          </View>
        </View>

        {/* Health Trackers */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#1F2937', marginBottom: 14 }}>Health Trackers</Text>

          <FeatureCard
            title="Period Tracker"
            subtitle="Track cycles & predictions"
            icon={<Calendar size={24} color="#EC4899" />}
            color="#EC4899"
            onPress={() => navigation.navigate('PeriodTracking')}
          />
          <FeatureCard
            title="Moodboard"
            subtitle="Log mood & reflections"
            icon={<Heart size={24} color="#F59E0B" />}
            color="#F59E0B"
            onPress={() => navigation.navigate('MoodTracking')}
          />
          <FeatureCard
            title="Sleep Tracker"
            subtitle="Track sleep quality"
            icon={<Moon size={24} color="#3B82F6" />}
            color="#3B82F6"
            onPress={() => navigation.navigate('SleepTracking')}
          />
          <FeatureCard
            title="Reminders"
            subtitle="Food & supplement reminders"
            icon={<Bell size={24} color="#8B5CF6" />}
            color="#8B5CF6"
            onPress={() => navigation.navigate('Reminders')}
          />
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

// Main Stack Navigator
export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen
            onNavigateBack={() => navigation.goBack()}
            onNavigateToSettings={() => navigation.navigate('Settings')}
            onNavigateToEditProfile={() => navigation.navigate('EditProfile')}
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
