import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp, Database, Eye, Lock, Trash2, Shield } from 'lucide-react-native';

interface PrivacyPolicyScreenProps {
  onNavigateBack?: () => void;
}

interface PolicyItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: string;
  color: string;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigateBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const policyItems: PolicyItem[] = [
    {
      id: 'collect',
      icon: <Database size={18} color="#3B82F6" />,
      title: 'Data We Collect',
      content: 'We collect information you provide: account details (email, name), health tracking data (period cycles, mood logs, sleep records), and app preferences. We do not collect data without your knowledge.',
      color: '#3B82F6',
    },
    {
      id: 'use',
      icon: <Eye size={18} color="#F59E0B" />,
      title: 'How We Use Your Data',
      content: 'Your data is used to provide personalized health insights, send reminders you set up, improve app functionality, and generate your health reports. We never sell your data to third parties.',
      color: '#F59E0B',
    },
    {
      id: 'security',
      icon: <Lock size={18} color="#22C55E" />,
      title: 'Data Security',
      content: 'Your data is encrypted in transit and at rest. We use industry-standard security measures including secure servers, encrypted connections (HTTPS), and regular security audits.',
      color: '#22C55E',
    },
    {
      id: 'rights',
      icon: <Trash2 size={18} color="#EF4444" />,
      title: 'Your Rights',
      content: 'You have the right to access your data anytime, export your data, request data deletion, and opt out of non-essential communications. Contact us to exercise these rights.',
      color: '#EF4444',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Privacy Policy</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={{ backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Shield size={20} color="#7C3AED" />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#5B21B6', marginLeft: 10 }}>Your Privacy Matters</Text>
        </View>

        {/* Policy Items */}
        {policyItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleExpand(item.id)}
            style={{ backgroundColor: 'white', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color + '20', justifyContent: 'center', alignItems: 'center' }}>
                {item.icon}
              </View>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>{item.title}</Text>
              {expandedId === item.id ? (
                <ChevronUp size={20} color="#9CA3AF" />
              ) : (
                <ChevronDown size={20} color="#9CA3AF" />
              )}
            </View>
            {expandedId === item.id && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 }} />
                <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>{item.content}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
          Last updated: December 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
