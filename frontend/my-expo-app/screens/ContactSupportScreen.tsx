import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';

interface ContactSupportScreenProps {
  onNavigateBack?: () => void;
}

export const ContactSupportScreen: React.FC<ContactSupportScreenProps> = ({ onNavigateBack }) => {
  const ContactCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
    color: string;
  }> = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: color + '20', justifyContent: 'center', alignItems: 'center' }}>
        {icon}
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Contact Support</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Quick Contact Options */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>Quick Contact</Text>

        <ContactCard
          icon={<Mail size={22} color="#EC4899" />}
          title="Email Support"
          subtitle="support@pcostracker.com"
          onPress={() => Linking.openURL('mailto:support@pcostracker.com')}
          color="#EC4899"
        />
      </ScrollView>
    </SafeAreaView>
  );
};
