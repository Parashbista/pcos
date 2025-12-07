import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Smile, Meh, Frown, Battery, BatteryLow, BatteryFull, Zap } from 'lucide-react-native';
import * as moodService from '../services/moodService';
import { MoodLevel, EnergyLevel, MoodFactor } from '../services/moodService';

interface MoodTrackingScreenProps {
  onNavigateBack?: () => void;
  onNavigateToHistory?: () => void;
}

const MOOD_OPTIONS = [
  { value: 1 as MoodLevel, label: 'Awful', color: '#EF4444' },
  { value: 2 as MoodLevel, label: 'Bad', color: '#F97316' },
  { value: 3 as MoodLevel, label: 'Okay', color: '#EAB308' },
  { value: 4 as MoodLevel, label: 'Good', color: '#22C55E' },
  { value: 5 as MoodLevel, label: 'Great', color: '#10B981' },
];

const ENERGY_OPTIONS = [
  { value: 1 as EnergyLevel, label: 'Low', color: '#EF4444' },
  { value: 2 as EnergyLevel, label: 'Tired', color: '#F97316' },
  { value: 3 as EnergyLevel, label: 'Normal', color: '#EAB308' },
  { value: 4 as EnergyLevel, label: 'Good', color: '#22C55E' },
  { value: 5 as EnergyLevel, label: 'High', color: '#10B981' },
];

const FACTORS: { value: MoodFactor; label: string }[] = [
  { value: 'hormonal', label: '🩸 Hormonal' },
  { value: 'poor_sleep', label: '😴 Sleep' },
  { value: 'stress', label: '😰 Stress' },
  { value: 'work', label: '💼 Work' },
  { value: 'exercise', label: '🏃 Exercise' },
  { value: 'diet', label: '🍎 Diet' },
];

const MoodIcon: React.FC<{ level: MoodLevel; size?: number; color?: string }> = ({ level, size = 24, color }) => {
  if (level <= 2) return <Frown size={size} color={color} />;
  if (level === 3) return <Meh size={size} color={color} />;
  return <Smile size={size} color={color} />;
};

const EnergyIcon: React.FC<{ level: EnergyLevel; size?: number; color?: string }> = ({ level, size = 24, color }) => {
  if (level <= 2) return <BatteryLow size={size} color={color} />;
  if (level === 3) return <Battery size={size} color={color} />;
  if (level === 4) return <BatteryFull size={size} color={color} />;
  return <Zap size={size} color={color} />;
};

export const MoodTrackingScreen: React.FC<MoodTrackingScreenProps> = ({ onNavigateBack, onNavigateToHistory }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState<MoodLevel>(3);
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [selectedFactors, setSelectedFactors] = useState<MoodFactor[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [existingEntry, setExistingEntry] = useState<moodService.MoodEntry | null>(null);

  useEffect(() => { loadExistingEntry(); }, [selectedDate]);

  const loadExistingEntry = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const entry = await moodService.getMoodEntryByDate(dateStr);
      if (entry) {
        setExistingEntry(entry);
        setMood(entry.mood);
        setEnergy(entry.energy);
        setSelectedFactors(entry.factors);
        setJournalEntry(entry.journalEntry || '');
      } else {
        setExistingEntry(null);
        setMood(3); setEnergy(3); setSelectedFactors([]); setJournalEntry('');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFactor = (factor: MoodFactor) => setSelectedFactors(prev => prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await moodService.createMoodEntry({
        date: selectedDate.toISOString().split('T')[0],
        mood, energy, factors: selectedFactors,
        journalEntry: journalEntry || undefined,
      });
      Alert.alert('Saved', 'Mood entry saved!');
      loadExistingEntry();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const navigateDate = (dir: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (dir === 'next' ? 1 : -1));
    if (newDate <= new Date()) setSelectedDate(newDate);
  };

  const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
  const energyOption = ENERGY_OPTIONS.find(e => e.value === energy);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginLeft: 12 }}>Moodboard</Text>
        </View>
        {onNavigateToHistory && (
          <TouchableOpacity onPress={onNavigateToHistory} style={{ padding: 8 }}>
            <BarChart3 size={22} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          {/* Date Selector */}
          <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => navigateDate('prev')} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
              <ChevronLeft size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => setShowDatePicker(true)}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateDate('next')} disabled={selectedDate.toDateString() === new Date().toDateString()} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.4 : 1 }}>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }} maximumDate={new Date()} />}

          {/* Current Status Card */}
          <View style={{ backgroundColor: '#F59E0B', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <MoodIcon level={mood} size={32} color="white" />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>Feeling {moodOption?.label}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{existingEntry ? '✓ Saved' : 'Not saved yet'}</Text>
            </View>
          </View>

          {/* Mood Selection */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 14 }}>How are you feeling?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {MOOD_OPTIONS.map(option => (
                <TouchableOpacity key={option.value} onPress={() => setMood(option.value)} style={{ alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: mood === option.value ? option.color + '20' : '#F9FAFB', borderWidth: 2, borderColor: mood === option.value ? option.color : 'transparent', minWidth: 56 }}>
                  <MoodIcon level={option.value} size={24} color={mood === option.value ? option.color : '#9CA3AF'} />
                  <Text style={{ fontSize: 10, color: mood === option.value ? option.color : '#9CA3AF', marginTop: 4, fontWeight: '500' }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Energy Selection */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 14 }}>Energy level</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {ENERGY_OPTIONS.map(option => (
                <TouchableOpacity key={option.value} onPress={() => setEnergy(option.value)} style={{ alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: energy === option.value ? option.color + '20' : '#F9FAFB', borderWidth: 2, borderColor: energy === option.value ? option.color : 'transparent', minWidth: 56 }}>
                  <EnergyIcon level={option.value} size={24} color={energy === option.value ? option.color : '#9CA3AF'} />
                  <Text style={{ fontSize: 10, color: energy === option.value ? option.color : '#9CA3AF', marginTop: 4, fontWeight: '500' }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Factors */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 14 }}>What's affecting you?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {FACTORS.map(factor => (
                <TouchableOpacity key={factor.value} onPress={() => toggleFactor(factor.value)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: selectedFactors.includes(factor.value) ? '#F59E0B' : '#F3F4F6' }}>
                  <Text style={{ fontSize: 13, color: selectedFactors.includes(factor.value) ? 'white' : '#4B5563', fontWeight: '500' }}>{factor.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Journal */}
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>Quick Note</Text>
            <TextInput
              style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#1F2937' }}
              placeholder="How was your day?"
              placeholderTextColor="#9CA3AF"
              value={journalEntry}
              onChangeText={setJournalEntry}
              multiline
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ backgroundColor: '#F59E0B', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 20 }}>
            {isSaving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{existingEntry ? 'Update Entry' : 'Save Entry'}</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
