import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Calendar, Moon, Heart, Pill } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions, sendTestNotification } from '../services/notificationService';

interface NotificationSettingsScreenProps {
  onNavigateBack?: () => void;
}

interface NotificationSettings {
  periodReminders: boolean;
  moodReminders: boolean;
  sleepReminders: boolean;
  supplementReminders: boolean;
}

const SETTINGS_KEY = 'notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  periodReminders: true,
  moodReminders: true,
  sleepReminders: true,
  supplementReminders: true,
};

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onNavigateBack }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
      return;
    }
    await sendTestNotification();
    Alert.alert('Test Sent', 'Check your notifications!');
  };

  const SettingRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    color: string;
  }> = ({ icon, title, subtitle, value, onToggle, color }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, marginBottom: 1 }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color + '20', justifyContent: 'center', alignItems: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#FBCFE8' }}
        thumbColor={value ? '#EC4899' : '#9CA3AF'}
      />
    </View>
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Notifications</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Permission Status */}
        <View style={{ margin: 20, padding: 16, backgroundColor: hasPermission ? '#F0FDF4' : '#FEF2F2', borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Bell size={20} color={hasPermission ? '#22C55E' : '#EF4444'} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: hasPermission ? '#166534' : '#991B1B', marginLeft: 8 }}>
              {hasPermission ? 'Notifications Enabled' : 'Notifications Disabled'}
            </Text>
          </View>
          {!hasPermission && (
            <Text style={{ fontSize: 13, color: '#991B1B', marginTop: 4 }}>
              Enable notifications in your device settings to receive reminders.
            </Text>
          )}
        </View>

        {/* Notification Types */}
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', paddingHorizontal: 20, paddingBottom: 8, textTransform: 'uppercase' }}>
          Reminder Types
        </Text>
        <View style={{ marginHorizontal: 20, borderRadius: 14, overflow: 'hidden' }}>
          <SettingRow
            icon={<Calendar size={22} color="#EC4899" />}
            title="Period Reminders"
            subtitle="Get notified before your period"
            value={settings.periodReminders}
            onToggle={() => handleToggle('periodReminders')}
            color="#EC4899"
          />
          <SettingRow
            icon={<Heart size={22} color="#F59E0B" />}
            title="Mood Check-ins"
            subtitle="Daily mood tracking reminders"
            value={settings.moodReminders}
            onToggle={() => handleToggle('moodReminders')}
            color="#F59E0B"
          />
          <SettingRow
            icon={<Moon size={22} color="#3B82F6" />}
            title="Sleep Reminders"
            subtitle="Bedtime and wake-up alerts"
            value={settings.sleepReminders}
            onToggle={() => handleToggle('sleepReminders')}
            color="#3B82F6"
          />
          <SettingRow
            icon={<Pill size={22} color="#8B5CF6" />}
            title="Supplement Reminders"
            subtitle="Food & medication alerts"
            value={settings.supplementReminders}
            onToggle={() => handleToggle('supplementReminders')}
            color="#8B5CF6"
          />
        </View>

        {/* Test Notification */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={handleTestNotification}
            style={{ backgroundColor: '#EC4899', borderRadius: 12, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 }}>
            Notifications help you stay on track with your health goals. You can customize which reminders you receive.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
