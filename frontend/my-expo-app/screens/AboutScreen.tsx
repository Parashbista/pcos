import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Star, Github, Globe, Mail } from 'lucide-react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface AboutScreenProps {
  onNavigateBack?: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigateBack }) => {
  const { colors } = useThemedStyles();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background, borderBottomWidth: 0 }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginLeft: 12 }}>About</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* App Logo & Name */}
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
          <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Heart size={40} color={colors.textPrimary} fill={colors.textPrimary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>PCOS Tracker</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22, textAlign: 'center' }}>
            PCOS Tracker is designed to help women manage Polycystic Ovary Syndrome by tracking periods, mood, sleep, and symptoms. Our goal is to empower you with insights about your health.
          </Text>
        </View>

        {/* Credits */}
        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>Credits</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
            Developed as a Final Year Project{'\n'}
            Built with React Native & Expo{'\n'}
            Backend powered by Node.js & MongoDB
          </Text>
        </View>

        {/* Links */}
        <View style={{ backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
            onPress={() => Linking.openURL('mailto:support@pcostracker.com')}
          >
            <Mail size={20} color={colors.textSecondary} />
            <Text style={{ fontSize: 15, color: colors.textPrimary, marginLeft: 12 }}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            onPress={() => Linking.openURL('https://pcostracker.com')}
          >
            <Globe size={20} color={colors.textSecondary} />
            <Text style={{ fontSize: 15, color: colors.textPrimary, marginLeft: 12 }}>Visit Website</Text>
          </TouchableOpacity>
        </View>

        {/* Made with love */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>Made with </Text>
            <Heart size={14} color={colors.textPrimary} fill={colors.textPrimary} />
            <Text style={{ fontSize: 13, color: colors.textMuted }}> for women's health</Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>© 2025 PCOS Tracker. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
