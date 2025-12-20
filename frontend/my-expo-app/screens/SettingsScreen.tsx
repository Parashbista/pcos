import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import {
  ArrowLeft,
  Lock,
  Bell,
  HelpCircle,
  Shield,
  Info,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_IMAGE_KEY = 'profile_image';

interface SettingsScreenProps {
  onNavigateBack?: () => void;
  onNavigateToChangePassword?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToHelpFAQ?: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToAbout?: () => void;
}

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress, danger = false }) => (
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: 'white',
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: danger ? '#FEE2E2' : '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {icon}
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ fontSize: 15, fontWeight: '500', color: danger ? '#DC2626' : '#1F2937' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{subtitle}</Text>}
    </View>
    <ChevronRight size={18} color={danger ? '#DC2626' : '#9CA3AF'} />
  </TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
    {title}
  </Text>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onNavigateBack, 
  onNavigateToChangePassword, 
  onNavigateToNotifications, 
  onNavigateToHelpFAQ,
  onNavigateToPrivacyPolicy,
  onNavigateToAbout,
}) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState(user?.name || 'User');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(userData.name || 'User');
        setUserEmail(userData.email || '');
      }
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      setProfileImage(savedImage);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Coming Soon', 'Account deletion will be available soon.') },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onNavigateBack && (
            <TouchableOpacity
              onPress={onNavigateBack}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}
            >
              <ArrowLeft size={22} color="white" />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>Settings</Text>
        </View>
      </View>

      {/* Profile Card */}
      <View style={{ paddingHorizontal: 20, marginTop: -14 }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EC4899', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: 56, height: 56, borderRadius: 28 }} />
            ) : (
              <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>{getInitials(userName)}</Text>
            )}
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#1F2937' }}>{userName}</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{userEmail}</Text>
          </View>
        </View>
      </View>

      {/* All Settings */}
      <View style={{ marginHorizontal: 20, marginTop: 20, borderRadius: 14, overflow: 'hidden', backgroundColor: 'white' }}>
        <SettingItem icon={<Lock size={20} color="#6B7280" />} title="Change Password" subtitle="Update your password" onPress={() => onNavigateToChangePassword?.()} />
        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 68 }} />
        <SettingItem icon={<Bell size={20} color="#6B7280" />} title="Notifications" subtitle="Manage alerts" onPress={() => onNavigateToNotifications?.()} />
        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 68 }} />
        <SettingItem icon={<HelpCircle size={20} color="#6B7280" />} title="Help & FAQ" onPress={() => onNavigateToHelpFAQ?.()} />
        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 68 }} />
        <SettingItem icon={<Shield size={20} color="#6B7280" />} title="Privacy Policy" onPress={() => onNavigateToPrivacyPolicy?.()} />
        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 68 }} />
        <SettingItem icon={<Info size={20} color="#6B7280" />} title="About" onPress={() => onNavigateToAbout?.()} />
      </View>

      {/* Logout */}
      <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 32 }}>
        <TouchableOpacity
          style={{ backgroundColor: 'white', borderRadius: 14, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <ActivityIndicator color="#6B7280" /> : (
            <>
              <LogOut size={20} color="#6B7280" />
              <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={{ alignItems: 'center', paddingBottom: 24 }}>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>PCOS Tracker v1.0.0</Text>
      </View>
    </ScrollView>
  );
};
