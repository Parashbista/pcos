import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, ChevronRight, User, Mail, Calendar, Edit3, LogOut } from 'lucide-react-native';
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

  useEffect(() => {
    loadUserData();
  }, []);

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
      .slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onNavigateBack && (
            <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4, marginRight: 12 }}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>Profile</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#EC4899', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: 'white' }}>{getInitials(userData.name)}</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#1F2937' }}>{userData.name}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{userData.email}</Text>
          
          {onNavigateToEditProfile && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF2F8', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginTop: 16 }}
              onPress={onNavigateToEditProfile}
            >
              <Edit3 size={16} color="#EC4899" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#EC4899', marginLeft: 6 }}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Info */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 10, marginLeft: 4 }}>ACCOUNT INFO</Text>
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 4, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
              <User size={18} color="#6366F1" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Name</Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#1F2937' }}>{userData.name}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 14 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' }}>
              <Mail size={18} color="#F59E0B" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Email</Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#1F2937' }}>{userData.email}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 14 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' }}>
              <Calendar size={18} color="#22C55E" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Member Since</Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#1F2937' }}>{formatDate(userData.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 10, marginLeft: 4 }}>PREFERENCES</Text>
        
        <ProfileMenuItem
          icon={<Settings size={20} color="#6B7280" />}
          title="Settings"
          subtitle="App preferences & account"
          onPress={() => onNavigateToSettings?.()}
        />

        <ProfileMenuItem
          icon={<LogOut size={20} color="#EF4444" />}
          title="Log Out"
          onPress={handleLogout}
          showArrow={false}
          color="#EF4444"
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
