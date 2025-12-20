import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle } from 'lucide-react-native';

interface HelpFAQScreenProps {
  onNavigateBack?: () => void;
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12 }}>
    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 6 }}>{question}</Text>
    <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 18 }}>{answer}</Text>
  </View>
);

export const HelpFAQScreen: React.FC<HelpFAQScreenProps> = ({ onNavigateBack }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Help & FAQ</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <HelpCircle size={20} color="#EC4899" />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginLeft: 8 }}>Common Questions</Text>
        </View>

        <FAQItem
          question="What is PCOS?"
          answer="Polycystic Ovary Syndrome is a hormonal condition affecting women. Tracking symptoms helps manage it better."
        />

        <FAQItem
          question="How do I reset my password?"
          answer="Tap 'Forgot Password' on the login screen and enter your email to receive a reset code."
        />

        <FAQItem
          question="Is my data secure?"
          answer="Yes, your data is encrypted and stored securely. We never share your information."
        />

        <FAQItem
          question="How do notifications work?"
          answer="Enable notifications in Settings to receive reminders at your scheduled times."
        />

        <FAQItem
          question="Can I use this app offline?"
          answer="Some features require internet. Your data syncs when you're back online."
        />

        <View style={{ marginTop: 8, padding: 14, backgroundColor: '#FCE7F3', borderRadius: 12 }}>
          <Text style={{ fontSize: 13, color: '#BE185D', textAlign: 'center' }}>
            Need more help? Email us at parashbista234@gmail.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
