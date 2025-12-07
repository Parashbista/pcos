import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Settings, ChevronRight, Edit3, LogOut, Bell, Shield, HelpCircle, Heart, Moon, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
  onNavigateBack?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToEditProfile?: () => void;
}

interface UserData {
  name: string;
  email: string;
  createdAt?: string;
}

const ProfileMenuItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
}> = ({ icon, title, subtitle, onPress, showArrow = true, color = '#1F2937' }) => (
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 14,
      marginBottom: 10,
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
      {icon}
    </View>
    <View style={{ flex: 1, marginLeft: 14 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>}
    </View>
    {showArrow && <ChevronRight size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateBack,
  onNavigateToSettings,
  onNavigateToEditProfile,
}) => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState<UserData>({ name: 'User', email: '' });

  useFocusEffect(
    useCallback(() => {
      loadUserData();
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
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }} showsVerticalScrollIndicator={false}>
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
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}>
            <Text style={{ fontSize: 36, fontWeight: '700', color: 'white' }}>{getInitials(userData.name)}</Text>
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
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
          <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F3F4F6' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Calendar size={20} color="#EC4899" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>{formatDate(userData.createdAt)}</Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Member for</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F3F4F6' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Heart size={20} color="#F59E0B" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>--</Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Mood logs</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Moon size={20} color="#6366F1" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>--</Text>
            <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Sleep logs</Text>
          </View>
        </View>
      </View>

      {/* Menu Section */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 12, marginLeft: 4 }}>ACCOUNT</Text>
        
        <ProfileMenuItem
          icon={<Settings size={20} color="#6B7280" />}
          title="Settings"
          subtitle="App preferences & notifications"
          onPress={() => onNavigateToSettings?.()}
        />

        <ProfileMenuItem
          icon={<Bell size={20} color="#F59E0B" />}
          title="Notifications"
          subtitle="Manage your alerts"
          onPress={() => onNavigateToSettings?.()}
        />

        <ProfileMenuItem
          icon={<Shield size={20} color="#22C55E" />}
          title="Privacy"
          subtitle="Data & security settings"
          onPress={() => onNavigateToSettings?.()}
        />

        <ProfileMenuItem
          icon={<HelpCircle size={20} color="#3B82F6" />}
          title="Help & Support"
          subtitle="FAQs and contact us"
          onPress={() => onNavigateToSettings?.()}
        />

        <View style={{ marginTop: 10 }}>
          <ProfileMenuItem
            icon={<LogOut size={20} color="#EF4444" />}
            title="Log Out"
            onPress={handleLogout}
            showArrow={false}
            color="#EF4444"
          />
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};
