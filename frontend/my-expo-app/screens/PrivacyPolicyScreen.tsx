import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp, Database, Eye, Lock, Trash2, Shield } from 'lucide-react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface PrivacyPolicyScreenProps {
  onNavigateBack?: () => void;
}

interface PolicyItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: string;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigateBack }) => {
  const { colors } = useThemedStyles();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const policyItems: PolicyItem[] = [
    {
      id: 'collect',
      icon: <Database size={18} color={colors.textPrimary} />,
      title: 'Data We Collect',
      content: 'We collect information you provide: account details (email, name), health tracking data (period cycles, mood logs, sleep records), and app preferences. We do not collect data without your knowledge.',
    },
    {
      id: 'use',
      icon: <Eye size={18} color={colors.textPrimary} />,
      title: 'How We Use Your Data',
      content: 'Your data is used to provide personalized health insights, send reminders you set up, improve app functionality, and generate your health reports. We never sell your data to third parties.',
    },
    {
      id: 'security',
      icon: <Lock size={18} color={colors.textPrimary} />,
      title: 'Data Security',
      content: 'Your data is encrypted in transit and at rest. We use industry-standard security measures including secure servers, encrypted connections (HTTPS), and regular security audits.',
    },
    {
      id: 'rights',
      icon: <Trash2 size={18} color={colors.textPrimary} />,
      title: 'Your Rights',
      content: 'You have the right to access your data anytime, export your data, request data deletion, and opt out of non-essential communications. Contact us to exercise these rights.',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background, borderBottomWidth: 0 }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginLeft: 12 }}>Privacy Policy</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ backgroundColor: colors.reminderLight, borderRadius: 14, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <Shield size={20} color={colors.reminderDark} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.reminderDark, marginLeft: 10 }}>Your Privacy Matters</Text>
        </View>

        {/* Policy Items */}
        {policyItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleExpand(item.id)}
            style={{ backgroundColor: colors.card, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center' }}>
                {item.icon}
              </View>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginLeft: 12 }}>{item.title}</Text>
              {expandedId === item.id ? (
                <ChevronUp size={20} color={colors.textMuted} />
              ) : (
                <ChevronDown size={20} color={colors.textMuted} />
              )}
            </View>
            {expandedId === item.id && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>{item.content}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
          Last updated: December 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
