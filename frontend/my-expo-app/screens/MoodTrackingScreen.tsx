import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react-native';
import * as moodService from '../services/moodService';
import { MoodLevel, EnergyLevel, MoodFactor, MoodQuote } from '../services/moodService';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface MoodTrackingScreenProps {
  onNavigateBack?: () => void;
  onNavigateToHistory?: () => void;
}

const MOOD_OPTIONS = [
  { value: 1 as MoodLevel, emoji: '😢', label: 'Awful', color: '#FDA4AF', bgColor: '#FFF1F2' },
  { value: 2 as MoodLevel, emoji: '😔', label: 'Low', color: '#FDBA74', bgColor: '#FFF7ED' },
  { value: 3 as MoodLevel, emoji: '😊', label: 'Okay', color: '#FCD34D', bgColor: '#FEFCE8' },
  { value: 4 as MoodLevel, emoji: '🥰', label: 'Good', color: '#86EFAC', bgColor: '#F0FDF4' },
  { value: 5 as MoodLevel, emoji: '✨', label: 'Amazing', color: '#F9A8D4', bgColor: '#FDF2F8' },
];

const ENERGY_OPTIONS = [
  { value: 1 as EnergyLevel, emoji: '🪫', label: 'Drained', color: '#FDA4AF' },
  { value: 2 as EnergyLevel, emoji: '😴', label: 'Tired', color: '#FDBA74' },
  { value: 3 as EnergyLevel, emoji: '☕', label: 'Normal', color: '#FCD34D' },
  { value: 4 as EnergyLevel, emoji: '💪', label: 'Good', color: '#86EFAC' },
  { value: 5 as EnergyLevel, emoji: '⚡', label: 'Energized', color: '#F9A8D4' },
];

const FACTORS: { value: MoodFactor; label: string; emoji: string }[] = [
  { value: 'hormonal', label: 'Hormonal', emoji: '🌸' },
  { value: 'poor_sleep', label: 'Sleep', emoji: '🌙' },
  { value: 'stress', label: 'Stress', emoji: '💭' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'exercise', label: 'Exercise', emoji: '🧘‍♀️' },
  { value: 'diet', label: 'Food', emoji: '🥗' },
];

export const MoodTrackingScreen: React.FC<MoodTrackingScreenProps> = ({
  onNavigateBack,
  onNavigateToHistory,
}) => {
  const { colors } = useThemedStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState<MoodLevel>(3);
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [selectedFactors, setSelectedFactors] = useState<MoodFactor[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [existingEntry, setExistingEntry] = useState<moodService.MoodEntry | null>(null);

  // Quote modal state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<MoodQuote | null>(null);
  const [quoteFeedbackGiven, setQuoteFeedbackGiven] = useState(false);

  useEffect(() => {
    loadExistingEntry();
  }, [selectedDate]);

  const loadExistingEntry = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const entry = await moodService.getMoodEntryByDate(dateStr);
      if (entry) {
        setExistingEntry(entry);
        setMood(entry.mood);
        setEnergy(entry.energy);
        setSelectedFactors(entry.factors || []);
        setJournalEntry(entry.journalEntry || '');
      } else {
        setExistingEntry(null);
        setMood(3);
        setEnergy(3);
        setSelectedFactors([]);
        setJournalEntry('');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFactor = (factor: MoodFactor) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await moodService.createMoodEntryWithQuote({
        date: selectedDate.toISOString().split('T')[0],
        mood,
        energy,
        factors: selectedFactors,
        journalEntry: journalEntry || undefined,
      });

      // Show quote modal if quote was generated
      if (result.quote) {
        setCurrentQuote(result.quote);
        setQuoteFeedbackGiven(false);
        setShowQuoteModal(true);
      } else {
        Alert.alert('Saved! 💕', 'Your mood has been logged.');
      }

      loadExistingEntry();
    } catch (error: any) {
      Alert.alert('Oops!', error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuoteFeedback = async (helpful: boolean) => {
    if (!currentQuote || quoteFeedbackGiven) return;
    try {
      await moodService.submitQuoteFeedback(currentQuote.quote, helpful, mood);
      setQuoteFeedbackGiven(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const navigateDate = (dir: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (dir === 'next' ? 1 : -1));
    if (newDate <= new Date()) setSelectedDate(newDate);
  };

  const moodOption = MOOD_OPTIONS.find((m) => m.value === mood);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onNavigateBack && (
                <TouchableOpacity
                  onPress={onNavigateBack}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.borderLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <ArrowLeft size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              )}
              <View>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
                  How are you? 💕
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  Let's check in with yourself
                </Text>
              </View>
            </View>
            {onNavigateToHistory && (
              <TouchableOpacity
                onPress={onNavigateToHistory}
                style={{
                  backgroundColor: colors.borderLight,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 20,
                }}
              >
                <BarChart3 size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            {/* Date Selector */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 6,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <TouchableOpacity
                onPress={() => navigateDate('prev')}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: colors.borderLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ChevronLeft size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                  {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigateDate('next')}
                disabled={selectedDate.toDateString() === new Date().toDateString()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: colors.borderLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.4 : 1,
                }}
              >
                <ChevronRight size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
                maximumDate={new Date()}
              />
            )}

            {/* Mood Selection */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Heart size={18} color={colors.textPrimary} fill={colors.textPrimary} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginLeft: 8 }}>
                  How's your mood?
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {MOOD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setMood(option.value)}
                    style={{
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 16,
                      backgroundColor: mood === option.value ? colors.borderLight : colors.background,
                      borderWidth: 2,
                      borderColor: mood === option.value ? colors.border : 'transparent',
                      minWidth: 60,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{option.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: mood === option.value ? colors.textPrimary : colors.textMuted,
                        marginTop: 4,
                        fontWeight: '600',
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Energy Selection */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
                Energy level ⚡
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {ENERGY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setEnergy(option.value)}
                    style={{
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 16,
                      backgroundColor: energy === option.value ? colors.borderLight : colors.background,
                      borderWidth: 2,
                      borderColor: energy === option.value ? colors.border : 'transparent',
                      minWidth: 60,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: energy === option.value ? colors.textPrimary : colors.textMuted,
                        marginTop: 4,
                        fontWeight: '600',
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Factors */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
                What's on your mind? 💭
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {FACTORS.map((factor) => (
                  <TouchableOpacity
                    key={factor.value}
                    onPress={() => toggleFactor(factor.value)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 20,
                      backgroundColor: selectedFactors.includes(factor.value) ? colors.borderLight : colors.background,
                      borderWidth: 1,
                      borderColor: selectedFactors.includes(factor.value) ? colors.border : colors.borderLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: selectedFactors.includes(factor.value) ? colors.textPrimary : colors.textSecondary,
                        fontWeight: '500',
                      }}
                    >
                      {factor.emoji} {factor.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Journal */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 20,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
                Quick thoughts ✨
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.borderLight,
                  borderRadius: 16,
                  padding: 16,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  fontSize: 15,
                  color: colors.textPrimary,
                }}
                placeholder="How was your day, beautiful? 💕"
                placeholderTextColor={colors.textMuted}
                value={journalEntry}
                onChangeText={setJournalEntry}
                multiline
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: colors.primary,
                padding: 18,
                borderRadius: 20,
                alignItems: 'center',
                marginBottom: 32,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Sparkles size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 17, fontWeight: '600', marginLeft: 8 }}>
                    {existingEntry ? 'Update & Get Quote ✨' : 'Save & Get Quote ✨'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Quote Modal */}
      <Modal visible={showQuoteModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 28,
              padding: 28,
              width: '100%',
              maxWidth: 340,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.borderLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 28 }}>{moodOption?.emoji || '💕'}</Text>
            </View>

            <Text
              style={{
                fontSize: 13,
                color: colors.primary,
                fontWeight: '600',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Your Daily Inspiration
            </Text>

            <Text
              style={{
                fontSize: 18,
                color: colors.textPrimary,
                textAlign: 'center',
                lineHeight: 26,
                fontStyle: 'italic',
                marginBottom: 8,
              }}
            >
              "{currentQuote?.quote}"
            </Text>

            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 24 }}>
              — {currentQuote?.author}
            </Text>

            {!quoteFeedbackGiven ? (
              <View style={{ width: '100%' }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginBottom: 12,
                  }}
                >
                  Was this helpful?
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => handleQuoteFeedback(true)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.successLight,
                      padding: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.success,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>💕</Text>
                    <Text style={{ fontSize: 12, color: colors.success, marginTop: 4, fontWeight: '500' }}>
                      Love it!
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuoteFeedback(false)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.borderLight,
                      padding: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🤔</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: '500' }}>
                      Not really
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>
                Thanks for your feedback! 💕
              </Text>
            )}

            <TouchableOpacity
              onPress={() => setShowQuoteModal(false)}
              style={{
                marginTop: 20,
                backgroundColor: colors.primary,
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 14,
              }}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Done ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
