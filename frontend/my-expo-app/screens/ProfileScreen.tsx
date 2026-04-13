import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Settings, ChevronRight, Edit3, LogOut, Heart, Moon, Calendar, Users, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as sleepService from '../services/sleepService';
import * as moodService from '../services/moodService';

interface ProfileScreenProps {
  onNavigateBack?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToEditProfile?: () => void;
  onNavigateToMoodTracking?: () => void;
  onNavigateToSleepTracking?: () => void;
  onNavigateToPartnerSharing?: () => void;
}

interface UserData {
  name: string;
  email: string;
  createdAt?: string;
}

const PROFILE_IMAGE_KEY = 'profile_image';

const ProfileMenuItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
  bgColor?: string;
  iconBgColor?: string;
  subtitleColor?: string;
}> = ({ icon, title, subtitle, onPress, showArrow = true, color, bgColor, iconBgColor, subtitleColor }) => (
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: bgColor,
      padding: 16,
      borderRadius: 14,
      marginBottom: 10,
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: iconBgColor, justifyContent: 'center', alignItems: 'center' }}>
      {icon}
    </View>
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 12, color: subtitleColor, marginTop: 2 }}>{subtitle}</Text>}
    </View>
    {showArrow && <ChevronRight size={20} color={subtitleColor} />}
  </TouchableOpacity>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateBack,
  onNavigateToSettings,
  onNavigateToEditProfile,
  onNavigateToMoodTracking,
  onNavigateToSleepTracking,
  onNavigateToPartnerSharing,
}) => {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode, colors: themeColors } = useTheme();
  const [userData, setUserData] = useState<UserData>({ name: 'User', email: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [moodLogCount, setMoodLogCount] = useState<number>(0);
  const [sleepLogCount, setSleepLogCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadProfileImage();
      loadLogCounts();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      setProfileImage(savedImage);
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const loadLogCounts = async () => {
    try {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      const startDate = monthAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      // Load mood logs count from API
      try {
        const moodEntries = await moodService.getMoodEntries(startDate, endDate);
        setMoodLogCount(moodEntries?.length || 0);
      } catch (e) {
        console.log('Could not fetch mood count');
      }

      // Load sleep logs count from API
      try {
        const sleepEntries = await sleepService.getSleepEntries(startDate, endDate);
        setSleepLogCount(sleepEntries?.length || 0);
      } catch (e) {
        console.log('Could not fetch sleep count');
      }
    } catch (error) {
      console.error('Error loading log counts:', error);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Member';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColors.background }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 80, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          {onNavigateBack && (
            <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 20, fontWeight: '600', color: 'white' }}>My Profile</Text>
        </View>

        {/* Profile Info */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' }}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: 100, height: 100, borderRadius: 50 }} resizeMode="cover" />
            ) : (
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                <User size={45} color="#EC4899" strokeWidth={1.5} />
              </View>
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', marginTop: 16 }}>{userData.name}</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{userData.email}</Text>
          
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 }}
            onPress={onNavigateToEditProfile}
          >
            <Edit3 size={14} color="white" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: 'white', marginLeft: 6 }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={{ paddingHorizontal: 20, marginTop: -40 }}>
        <View style={{ backgroundColor: themeColors.card, borderRadius: 20, padding: 16, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
          <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: themeColors.borderLight }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Calendar size={20} color="#EC4899" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: themeColors.textPrimary }}>{formatDate(userData.createdAt)}</Text>
            <Text style={{ fontSize: 11, color: themeColors.textSecondary, marginTop: 2 }}>Member for</Text>
          </View>
          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: themeColors.borderLight }}
            onPress={onNavigateToMoodTracking}
            activeOpacity={0.7}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Heart size={20} color="#F59E0B" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: themeColors.textPrimary }}>{moodLogCount}</Text>
            <Text style={{ fontSize: 11, color: themeColors.textSecondary, marginTop: 2 }}>Mood logs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center' }}
            onPress={onNavigateToSleepTracking}
            activeOpacity={0.7}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Moon size={20} color="#6366F1" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: themeColors.textPrimary }}>{sleepLogCount}</Text>
            <Text style={{ fontSize: 11, color: themeColors.textSecondary, marginTop: 2 }}>Sleep logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Section */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: themeColors.textSecondary, marginBottom: 12, marginLeft: 4 }}>ACCOUNT</Text>
        
        <ProfileMenuItem
          icon={<Settings size={20} color={themeColors.textSecondary} />}
          title="Settings"
          subtitle="App preferences & notifications"
          onPress={() => onNavigateToSettings?.()}
          color={themeColors.textPrimary}
          bgColor={themeColors.card}
          iconBgColor={themeColors.borderLight}
          subtitleColor={themeColors.textSecondary}
        />

        <ProfileMenuItem
          icon={<Users size={20} color="#EC4899" />}
          title="Partner Mode"
          subtitle="Share cycle info with loved ones"
          onPress={() => onNavigateToPartnerSharing?.()}
          color={themeColors.textPrimary}
          bgColor={themeColors.card}
          iconBgColor={themeColors.borderLight}
          subtitleColor={themeColors.textSecondary}
        />

        {/* Dark Mode Toggle */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: themeColors.card,
            padding: 16,
            borderRadius: 14,
            marginBottom: 10,
          }}
          onPress={toggleDarkMode}
          activeOpacity={0.7}
        >
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: themeColors.borderLight, justifyContent: 'center', alignItems: 'center' }}>
            <Moon size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: themeColors.textPrimary }}>Dark Mode</Text>
            <Text style={{ fontSize: 12, color: themeColors.textSecondary, marginTop: 2 }}>Switch to dark theme</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#E5E7EB', true: '#EC4899' }}
            thumbColor={isDarkMode ? '#FFFFFF' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </TouchableOpacity>

        <View style={{ marginTop: 10 }}>
          <ProfileMenuItem
            icon={<LogOut size={20} color="#EF4444" />}
            title="Log Out"
            onPress={handleLogout}
            showArrow={false}
            color="#EF4444"
            bgColor={themeColors.card}
            iconBgColor={themeColors.borderLight}
            subtitleColor={themeColors.textSecondary}
          />
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};
