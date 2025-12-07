import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppearanceScreenProps {
  onNavigateBack?: () => void;
}

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_KEY = 'app_theme';

export const AppearanceScreen: React.FC<AppearanceScreenProps> = ({ onNavigateBack }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored) setSelectedTheme(stored as ThemeOption);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const selectTheme = async (theme: ThemeOption) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      setSelectedTheme(theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const ThemeCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    value: ThemeOption;
    colors: { bg: string; card: string; text: string };
  }> = ({ icon, title, subtitle, value, colors }) => (
    <TouchableOpacity
      onPress={() => selectTheme(value)}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: selectedTheme === value ? '#EC4899' : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
          {icon}
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{title}</Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>
        </View>
        {selectedTheme === value && (
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#EC4899', justifyContent: 'center', alignItems: 'center' }}>
            <Check size={14} color="white" />
          </View>
        )}
      </View>
      {/* Preview */}
      <View style={{ marginTop: 12, backgroundColor: colors.bg, borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: 10 }}>
          <View style={{ width: 40, height: 6, backgroundColor: colors.text, borderRadius: 3, opacity: 0.7 }} />
          <View style={{ width: 60, height: 4, backgroundColor: colors.text, borderRadius: 2, marginTop: 6, opacity: 0.4 }} />
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: 10 }}>
          <View style={{ width: 40, height: 6, backgroundColor: colors.text, borderRadius: 3, opacity: 0.7 }} />
          <View style={{ width: 60, height: 4, backgroundColor: colors.text, borderRadius: 2, marginTop: 6, opacity: 0.4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Appearance</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>Choose Theme</Text>

        <ThemeCard
          icon={<Sun size={24} color="#F59E0B" />}
          title="Light"
          subtitle="Classic light appearance"
          value="light"
          colors={{ bg: '#F3F4F6', card: '#FFFFFF', text: '#1F2937' }}
        />

        <ThemeCard
          icon={<Moon size={24} color="#6366F1" />}
          title="Dark"
          subtitle="Easy on the eyes"
          value="dark"
          colors={{ bg: '#1F2937', card: '#374151', text: '#F9FAFB' }}
        />

        <ThemeCard
          icon={<Smartphone size={24} color="#8B5CF6" />}
          title="System"
          subtitle="Match device settings"
          value="system"
          colors={{ bg: '#E5E7EB', card: '#9CA3AF', text: '#4B5563' }}
        />

        <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>
            💡 Dark mode support is coming soon! Currently the app uses light theme.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
