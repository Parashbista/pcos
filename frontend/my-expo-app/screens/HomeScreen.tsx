import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Calendar,
  Moon,
  Heart,
  ChevronRight,
  Lightbulb,
  Bell,
  User,
  Sparkles,
  TrendingUp,
  Activity,
  Smile,
  Meh,
  Frown,
  Flame,
  Star,
} from 'lucide-react-native';

interface HomeScreenProps {
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPeriodTracking: () => void;
  onNavigateToMoodTracking: () => void;
  onNavigateToSleepTracking: () => void;
  onNavigateToReminders: () => void;
  onNavigateToInsights: () => void;
}

interface HealthSummary {
  lastMood: { level: number; label: string; date: string } | null;
  lastSleep: { hours: number; quality: string; date: string } | null;
  periodStatus: { daysUntil: number; phase: string } | null;
  streaks: { mood: number; sleep: number };
}

const PROFILE_IMAGE_KEY = 'profile_image';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToProfile,
  onNavigateToPeriodTracking,
  onNavigateToMoodTracking,
  onNavigateToSleepTracking,
  onNavigateToReminders,
  onNavigateToInsights,
}) => {
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [healthSummary, setHealthSummary] = useState<HealthSummary>({
    lastMood: null,
    lastSleep: null,
    periodStatus: null,
    streaks: { mood: 0, sleep: 0 },
  });
  const [dailyTip, setDailyTip] = useState('');

  const tips = [
    'Consistent sleep helps regulate hormones. Try to maintain a regular schedule.',
    'Tracking your mood can help identify patterns related to your cycle.',
    'Stay hydrated! Water helps manage PCOS symptoms.',
    'Regular exercise can help balance hormones naturally.',
    'Stress management is key for PCOS. Try deep breathing exercises.',
    'A balanced diet low in processed foods can help manage symptoms.',
    'Getting enough sleep is crucial for hormone regulation.',
  ];

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadHealthSummary();
      setDailyTip(tips[new Date().getDay()]);
    }, [])
  );

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(userData.name || '');
      }
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      setProfileImage(savedImage);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadHealthSummary = async () => {
    try {
      // Load mood data
      const moodData = await AsyncStorage.getItem('moodHistory');
      let lastMood = null;
      let moodStreak = 0;
      if (moodData) {
        const moodHistory = JSON.parse(moodData);
        if (Array.isArray(moodHistory) && moodHistory.length > 0) {
          const sorted = moodHistory.sort((a: any, b: any) => 
            new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
          );
          const latest = sorted[0];
          const moodLevel = typeof latest.mood === 'number' ? latest.mood : getMoodLevel(latest.mood || latest.moodLevel);
          lastMood = {
            level: moodLevel,
            label: getMoodLabel(moodLevel),
            date: latest.date || latest.createdAt,
          };
          moodStreak = calculateStreak(sorted.map((m: any) => m.date || m.createdAt));
        }
      }

      // Load sleep data
      const sleepData = await AsyncStorage.getItem('sleepHistory');
      let lastSleep = null;
      let sleepStreak = 0;
      if (sleepData) {
        const sleepHistory = JSON.parse(sleepData);
        if (Array.isArray(sleepHistory) && sleepHistory.length > 0) {
          const sorted = sleepHistory.sort((a: any, b: any) => 
            new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
          );
          const latest = sorted[0];
          lastSleep = {
            hours: latest.duration || latest.hours || 0,
            quality: latest.quality || getQualityLabel(latest.qualityRating),
            date: latest.date || latest.createdAt,
          };
          sleepStreak = calculateStreak(sorted.map((s: any) => s.date || s.createdAt));
        }
      }

      setHealthSummary({
        lastMood,
        lastSleep,
        periodStatus: null,
        streaks: { mood: moodStreak, sleep: sleepStreak },
      });
    } catch (error) {
      console.error('Error loading health summary:', error);
    }
  };

  const getMoodLevel = (mood: string | number): number => {
    if (typeof mood === 'number') return mood;
    const moodLevels: { [key: string]: number } = {
      'great': 5, 'good': 4, 'okay': 3, 'bad': 2, 'terrible': 1,
      'happy': 5, 'calm': 4, 'anxious': 2, 'sad': 1, 'angry': 2,
    };
    return moodLevels[mood.toLowerCase()] || 3;
  };

  const getMoodLabel = (level: number): string => {
    const labels = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
    return labels[Math.min(level - 1, 4)] || 'Okay';
  };

  const getMoodIcon = (level: number) => {
    const color = level >= 4 ? '#10B981' : level === 3 ? '#F59E0B' : '#EF4444';
    if (level >= 4) return <Smile size={32} color={color} />;
    if (level === 3) return <Meh size={32} color={color} />;
    return <Frown size={32} color={color} />;
  };

  const getMoodColor = (level: number): string => {
    if (level >= 4) return '#166534';
    if (level === 3) return '#92400E';
    return '#991B1B';
  };

  const getQualityLabel = (rating: number): string => {
    if (rating >= 4) return 'Great';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  const calculateStreak = (dates: string[]): number => {
    if (!dates.length) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const sortedDates = dates
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasEntry = sortedDates.some(d => d.toISOString().split('T')[0] === dateStr);
      if (hasEntry) streak++;
      else break;
    }
    return streak;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFirstName = () => {
    return userName.split(' ')[0] || 'there';
  };

  const formatRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{getGreeting()}</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', marginTop: 2 }}>
                {userName ? `Hi, ${getFirstName()}! 👋` : 'PCOS Tracker'}
              </Text>
            </View>
            <TouchableOpacity
              style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
              onPress={onNavigateToProfile}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: 46, height: 46, borderRadius: 23 }} />
              ) : userName ? (
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>{getInitials(userName)}</Text>
              ) : (
                <User size={22} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Daily Tip */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, marginTop: 18, flexDirection: 'row', alignItems: 'center' }}>
            <Lightbulb size={18} color="rgba(255,255,255,0.9)" />
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginLeft: 10, flex: 1, lineHeight: 18 }}>
              {dailyTip}
            </Text>
          </View>
        </View>

        {/* Today's Summary Card */}
        <View style={{ paddingHorizontal: 20, marginTop: -18 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Activity size={18} color="#EC4899" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>Today's Summary</Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Mood Summary */}
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: healthSummary.lastMood ? (healthSummary.lastMood.level >= 4 ? '#F0FDF4' : healthSummary.lastMood.level === 3 ? '#FEF3C7' : '#FEF2F2') : '#F3F4F6', borderRadius: 14, padding: 14, alignItems: 'center' }}
                onPress={onNavigateToMoodTracking}
              >
                {healthSummary.lastMood ? getMoodIcon(healthSummary.lastMood.level) : <Meh size={32} color="#9CA3AF" />}
                <Text style={{ fontSize: 13, fontWeight: '600', color: healthSummary.lastMood ? getMoodColor(healthSummary.lastMood.level) : '#6B7280', marginTop: 6 }}>
                  {healthSummary.lastMood?.label || 'No mood'}
                </Text>
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                  {healthSummary.lastMood ? formatRelativeDate(healthSummary.lastMood.date) : 'Log mood'}
                </Text>
              </TouchableOpacity>

              {/* Sleep Summary */}
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14, alignItems: 'center' }}
                onPress={onNavigateToSleepTracking}
              >
                <Moon size={32} color="#6366F1" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#3730A3', marginTop: 6 }}>
                  {healthSummary.lastSleep ? `${healthSummary.lastSleep.hours}h` : 'No sleep'}
                </Text>
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                  {healthSummary.lastSleep ? healthSummary.lastSleep.quality : 'Log sleep'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Streaks */}
            {(healthSummary.streaks.mood > 0 || healthSummary.streaks.sleep > 0) && (
              <View style={{ flexDirection: 'row', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Flame size={16} color="#F97316" />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>
                    {healthSummary.streaks.mood} day mood streak
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Star size={16} color="#F59E0B" />
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>
                    {healthSummary.streaks.sleep} day sleep streak
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 12, flexDirection: 'row', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', padding: 12 }} onPress={onNavigateToPeriodTracking}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Calendar size={22} color="#EC4899" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}>Period</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', padding: 12 }} onPress={onNavigateToMoodTracking}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Heart size={22} color="#10B981" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}>Mood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', padding: 12 }} onPress={onNavigateToSleepTracking}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Moon size={22} color="#3B82F6" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}>Sleep</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Health Trackers */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#1F2937', marginBottom: 14 }}>Health Trackers</Text>

          {/* Period Tracker Card */}
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
            onPress={onNavigateToPeriodTracking}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center' }}>
              <Calendar size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Period Tracker</Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Track cycles & predictions</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Moodboard Card */}
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
            onPress={onNavigateToMoodTracking}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' }}>
              <Heart size={24} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Moodboard</Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Log mood & reflections</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Sleep Tracker Card */}
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
            onPress={onNavigateToSleepTracking}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
              <Moon size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Sleep Tracker</Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Track sleep quality</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Reminders Card */}
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
            onPress={onNavigateToReminders}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' }}>
              <Bell size={24} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Reminders</Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Food & supplement reminders</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Smart Insights Card */}
          <TouchableOpacity
            style={{ backgroundColor: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#FCD34D' }}
            onPress={onNavigateToInsights}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' }}>
              <Sparkles size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#92400E' }}>Smart Cycle Alert</Text>
              <Text style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>Personalized health insights</Text>
            </View>
            <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: 'white' }}>AI</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Correlation Insight */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <View style={{ backgroundColor: '#FDF2F8', borderRadius: 16, padding: 18, borderLeftWidth: 4, borderLeftColor: '#EC4899' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TrendingUp size={16} color="#BE185D" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#9D174D', marginLeft: 8 }}>Health Insight</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#BE185D', lineHeight: 20 }}>
              Track your mood and sleep consistently to discover patterns related to your cycle. The more data you log, the better insights you'll get!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
