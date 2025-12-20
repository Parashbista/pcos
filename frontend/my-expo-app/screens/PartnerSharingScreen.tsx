import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Moon,
  Smile,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../constants/theme';

interface PartnerSharingScreenProps {
  onNavigateBack?: () => void;
}

interface SharingSettings {
  isEnabled: boolean;
  shareCode: string;
  sharePeriod: boolean;
  shareMood: boolean;
  shareSleep: boolean;
  partnerName?: string;
  createdAt: string;
}

const SHARING_KEY = 'partner_sharing_settings';

const generateShareCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const PartnerSharingScreen: React.FC<PartnerSharingScreenProps> = ({
  onNavigateBack,
}) => {
  const [settings, setSettings] = useState<SharingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerCode, setPartnerCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SHARING_KEY);
      if (data) {
        setSettings(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading sharing settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: SharingSettings) => {
    try {
      await AsyncStorage.setItem(SHARING_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving sharing settings:', error);
    }
  };

  const enableSharing = async () => {
    const newSettings: SharingSettings = {
      isEnabled: true,
      shareCode: generateShareCode(),
      sharePeriod: true,
      shareMood: false,
      shareSleep: false,
      createdAt: new Date().toISOString(),
    };
    await saveSettings(newSettings);
    Alert.alert('Sharing Enabled! 💕', 'Share your code with your partner so they can see your cycle info.');
  };

  const disableSharing = async () => {
    Alert.alert(
      'Disable Sharing?',
      'Your partner will no longer be able to see your cycle information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(SHARING_KEY);
            setSettings(null);
          },
        },
      ]
    );
  };

  const regenerateCode = async () => {
    if (!settings) return;
    Alert.alert(
      'Generate New Code?',
      'Your partner will need the new code to reconnect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            const newSettings = { ...settings, shareCode: generateShareCode() };
            await saveSettings(newSettings);
            Alert.alert('New Code Generated! 🔄', 'Share the new code with your partner.');
          },
        },
      ]
    );
  };

  const toggleSetting = async (key: 'sharePeriod' | 'shareMood' | 'shareSleep') => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: !settings[key] };
    await saveSettings(newSettings);
  };

  const copyCode = async () => {
    if (!settings?.shareCode) return;
    await Clipboard.setStringAsync(settings.shareCode);
    Alert.alert('Copied! 📋', 'Share code copied to clipboard.');
  };

  const shareWithPartner = async () => {
    if (!settings?.shareCode) return;
    try {
      await Share.share({
        message: `💕 I want to share my cycle info with you!\n\nDownload PCOS Tracker and use this code to connect:\n\n🔑 ${settings.shareCode}\n\nThis way you'll know when my period is coming and can be more supportive! 💜`,
        title: 'Share Cycle Info',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const connectToPartner = async () => {
    if (partnerCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character code.');
      return;
    }
    
    setIsConnecting(true);
    // Simulate connection (in real app, this would verify with backend)
    setTimeout(() => {
      setIsConnecting(false);
      Alert.alert('Connected! 💕', 'You are now connected to your partner\'s cycle info.');
      setPartnerCode('');
    }, 1500);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onNavigateBack && (
              <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }}>
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={{ fontSize: fontSize.title, fontWeight: fontWeight.bold, color: 'white' }}>Partner Mode</Text>
              <Text style={{ fontSize: fontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Share your cycle with loved ones</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center' }}>
            <Heart size={24} color="white" fill="white" />
            <Text style={{ fontSize: fontSize.md, color: 'rgba(255,255,255,0.9)', marginLeft: spacing.md, flex: 1, lineHeight: 20 }}>
              Let your partner know when your period is coming so they can be more supportive 💕
            </Text>
          </View>
        </View>

        <View style={{ padding: spacing.xl, marginTop: -spacing.lg }}>
          {!settings?.isEnabled ? (
            <>
              {/* Enable Sharing Card */}
              <View style={{ backgroundColor: colors.white, borderRadius: borderRadius.xxl, padding: spacing.xl, marginBottom: spacing.xl, ...shadows.lg }}>
                <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg }}>
                    <Share2 size={36} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' }}>
                    Share with Partner
                  </Text>
                  <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }}>
                    Enable partner mode to share your cycle information with your significant other
                  </Text>
                </View>

                <TouchableOpacity
                  style={{ backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center' }}
                  onPress={enableSharing}
                >
                  <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: 'white' }}>Enable Partner Mode</Text>
                </TouchableOpacity>
              </View>

              {/* Connect to Partner */}
              <View style={{ backgroundColor: colors.white, borderRadius: borderRadius.xxl, padding: spacing.xl, ...shadows.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
                  <UserPlus size={20} color={colors.primary} />
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginLeft: spacing.sm }}>
                    Connect to Partner
                  </Text>
                </View>
                <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.lg }}>
                  Enter your partner's share code to see their cycle info
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      borderRadius: borderRadius.lg,
                      padding: spacing.lg,
                      fontSize: fontSize.xl,
                      fontWeight: fontWeight.bold,
                      textAlign: 'center',
                      letterSpacing: 4,
                      color: colors.textPrimary,
                    }}
                    placeholder="XXXXXX"
                    placeholderTextColor={colors.textMuted}
                    value={partnerCode}
                    onChangeText={(text) => setPartnerCode(text.toUpperCase().slice(0, 6))}
                    autoCapitalize="characters"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: partnerCode.length === 6 ? colors.primary : colors.border,
                      borderRadius: borderRadius.lg,
                      padding: spacing.lg,
                      justifyContent: 'center',
                    }}
                    onPress={connectToPartner}
                    disabled={partnerCode.length !== 6 || isConnecting}
                  >
                    {isConnecting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Check size={24} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Share Code Card */}
              <View style={{ backgroundColor: colors.white, borderRadius: borderRadius.xxl, padding: spacing.xl, marginBottom: spacing.xl, ...shadows.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Your Share Code</Text>
                  <TouchableOpacity onPress={regenerateCode} style={{ padding: spacing.sm }}>
                    <RefreshCw size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: colors.primaryLight, borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg }}>
                  <Text style={{ fontSize: 32, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: 8 }}>
                    {settings.shareCode}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.md }}
                    onPress={copyCode}
                  >
                    <Copy size={18} color={colors.textSecondary} />
                    <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginLeft: spacing.sm }}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.md }}
                    onPress={shareWithPartner}
                  >
                    <Share2 size={18} color="white" />
                    <Text style={{ fontSize: fontSize.base, color: 'white', marginLeft: spacing.sm, fontWeight: fontWeight.semibold }}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Privacy Settings */}
              <View style={{ backgroundColor: colors.white, borderRadius: borderRadius.xxl, padding: spacing.xl, marginBottom: spacing.xl, ...shadows.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
                  <Shield size={20} color={colors.primary} />
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginLeft: spacing.sm }}>
                    What to Share
                  </Text>
                </View>

                {/* Period Toggle */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                  onPress={() => toggleSetting('sharePeriod')}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Calendar size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.textPrimary }}>Period & Cycle</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Period dates & predictions</Text>
                  </View>
                  {settings.sharePeriod ? <Eye size={22} color={colors.success} /> : <EyeOff size={22} color={colors.textMuted} />}
                </TouchableOpacity>

                {/* Mood Toggle */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                  onPress={() => toggleSetting('shareMood')}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.moodLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Smile size={22} color={colors.mood} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.textPrimary }}>Mood</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Daily mood status</Text>
                  </View>
                  {settings.shareMood ? <Eye size={22} color={colors.success} /> : <EyeOff size={22} color={colors.textMuted} />}
                </TouchableOpacity>

                {/* Sleep Toggle */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md }}
                  onPress={() => toggleSetting('shareSleep')}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.sleepLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Moon size={22} color={colors.sleep} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.medium, color: colors.textPrimary }}>Sleep</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Sleep quality info</Text>
                  </View>
                  {settings.shareSleep ? <Eye size={22} color={colors.success} /> : <EyeOff size={22} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>

              {/* Disable Button */}
              <TouchableOpacity
                style={{ backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.error }}
                onPress={disableSharing}
              >
                <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.error }}>Disable Partner Mode</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: spacing.xxxl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
