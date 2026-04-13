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
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { useThemedStyles } from '../hooks/useThemedStyles';

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
  const { colors } = useThemedStyles();
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
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }}>
            {onNavigateBack && (
              <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }}>
                <ArrowLeft size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.textPrimary }}>Partner Mode</Text>
              <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 }}>Share your cycle with loved ones</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }}>
                <Heart size={20} color={colors.primary} />
              </View>
              <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, flex: 1, lineHeight: 20 }}>
                Let your partner know when your period is coming so they can be more supportive 💕
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          {!settings?.isEnabled ? (
            <>
              {/* Enable Sharing Card */}
              <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xxl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg }}>
                    <Share2 size={32} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' }}>
                    Share with Partner
                  </Text>
                  <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 }}>
                    Enable partner mode to share your cycle information with your significant other
                  </Text>
                </View>

                <TouchableOpacity
                  style={{ backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  onPress={enableSharing}
                >
                  <Heart size={20} color="white" />
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: 'white', marginLeft: spacing.sm }}>Enable Partner Mode</Text>
                </TouchableOpacity>
              </View>

              {/* Connect to Partner */}
              <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm }}>
                    <UserPlus size={16} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>
                    Connect to Partner
                  </Text>
                </View>
                <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 }}>
                  Enter your partner's share code to see their cycle info
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      borderRadius: borderRadius.lg,
                      padding: spacing.lg,
                      fontSize: fontSize.xxl,
                      fontWeight: fontWeight.bold,
                      textAlign: 'center',
                      letterSpacing: 6,
                      color: colors.textPrimary,
                      borderWidth: 1,
                      borderColor: colors.border,
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
                      paddingHorizontal: spacing.lg,
                      justifyContent: 'center',
                      minWidth: 56,
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
              <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Your Share Code</Text>
                  <TouchableOpacity 
                    onPress={regenerateCode} 
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <RefreshCw size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1.5, borderColor: colors.primary + '30' }}>
                  <Text style={{ fontSize: 24, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: 6 }}>
                    {settings.shareCode}
                  </Text>
                </View>

                {/* Partner Status */}
                {settings.partnerName && (
                  <View style={{ backgroundColor: colors.successLight, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.success + '30' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}>
                      <Check size={14} color="white" />
                    </View>
                    <Text style={{ fontSize: fontSize.base, color: colors.success, marginLeft: spacing.sm, fontWeight: fontWeight.medium }}>
                      Connected to {settings.partnerName}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
                    onPress={copyCode}
                  >
                    <Copy size={18} color={colors.textPrimary} />
                    <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, marginLeft: spacing.sm, fontWeight: fontWeight.medium }}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.lg }}
                    onPress={shareWithPartner}
                  >
                    <Share2 size={18} color="white" />
                    <Text style={{ fontSize: fontSize.base, color: 'white', marginLeft: spacing.sm, fontWeight: fontWeight.semibold }}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Privacy Settings */}
              <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm }}>
                    <Shield size={16} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>
                    What to Share
                  </Text>
                </View>

                {/* Period Toggle */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => toggleSetting('sharePeriod')}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Calendar size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Period dates & predictions</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>Cycle history and forecasts</Text>
                  </View>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: settings.sharePeriod ? colors.successLight : colors.background, justifyContent: 'center', alignItems: 'center' }}>
                    {settings.sharePeriod ? <Eye size={20} color={colors.success} /> : <EyeOff size={20} color={colors.textMuted} />}
                  </View>
                </TouchableOpacity>

                {/* Mood Toggle */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => toggleSetting('shareMood')}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.moodLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Smile size={24} color={colors.mood} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Daily mood status</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>Emotional wellbeing logs</Text>
                  </View>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: settings.shareMood ? colors.successLight : colors.background, justifyContent: 'center', alignItems: 'center' }}>
                    {settings.shareMood ? <Eye size={20} color={colors.success} /> : <EyeOff size={20} color={colors.textMuted} />}
                  </View>
                </TouchableOpacity>

                {/* Sleep Toggle */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg }}
                  onPress={() => toggleSetting('shareSleep')}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.sleepLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Moon size={24} color={colors.sleep} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>Sleep quality info</Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>Rest patterns and duration</Text>
                  </View>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: settings.shareSleep ? colors.successLight : colors.background, justifyContent: 'center', alignItems: 'center' }}>
                    {settings.shareSleep ? <Eye size={20} color={colors.success} /> : <EyeOff size={20} color={colors.textMuted} />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Disable Button */}
              <TouchableOpacity
                style={{ backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.error }}
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
