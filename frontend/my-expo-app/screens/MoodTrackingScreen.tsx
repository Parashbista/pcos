import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Smile, Meh, Frown, Battery, BatteryLow, BatteryFull, Zap, Lightbulb } from 'lucide-react-native';
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
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onNavigateBack && (
              <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Moodboard</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Track how you feel</Text>
            </View>
          </View>
          {onNavigateToHistory && (
            <TouchableOpacity onPress={onNavigateToHistory} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
              <BarChart3 size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Card */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <MoodIcon level={mood} size={28} color="white" />
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{existingEntry ? 'Logged Mood' : 'Current Mood'}</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>Feeling {moodOption?.label}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <EnergyIcon level={energy} size={24} color="white" />
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{energyOption?.label} Energy</Text>
          </View>
        </View>

        {/* Tip */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Lightbulb size={16} color="rgba(255,255,255,0.8)" />
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 8, flex: 1 }}>
            Tracking mood helps identify patterns related to your cycle.
          </Text>
        </View>
      </View>

      <View style={{ padding: 20, marginTop: -16 }}>
        {isLoading ? (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : (
          <>
            {/* Date Selector */}
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <TouchableOpacity onPress={() => navigateDate('prev')} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' }}>
                <ChevronLeft size={20} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => setShowDatePicker(true)}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateDate('next')} disabled={selectedDate.toDateString() === new Date().toDateString()} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.4 : 1 }}>
                <ChevronRight size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>
            {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }} maximumDate={new Date()} />}

            {/* Mood Selection */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>How are you feeling?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {MOOD_OPTIONS.map(option => (
                  <TouchableOpacity key={option.value} onPress={() => setMood(option.value)} style={{ alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: mood === option.value ? option.color : '#F9FAFB', borderWidth: 2, borderColor: mood === option.value ? option.color : 'transparent', minWidth: 58 }}>
                    <MoodIcon level={option.value} size={26} color={mood === option.value ? 'white' : '#9CA3AF'} />
                    <Text style={{ fontSize: 10, color: mood === option.value ? 'white' : '#9CA3AF', marginTop: 6, fontWeight: '600' }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Energy Selection */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>Energy level</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {ENERGY_OPTIONS.map(option => (
                  <TouchableOpacity key={option.value} onPress={() => setEnergy(option.value)} style={{ alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: energy === option.value ? option.color : '#F9FAFB', borderWidth: 2, borderColor: energy === option.value ? option.color : 'transparent', minWidth: 58 }}>
                    <EnergyIcon level={option.value} size={26} color={energy === option.value ? 'white' : '#9CA3AF'} />
                    <Text style={{ fontSize: 10, color: energy === option.value ? 'white' : '#9CA3AF', marginTop: 6, fontWeight: '600' }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Factors */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>What's affecting you?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {FACTORS.map(factor => (
                  <TouchableOpacity key={factor.value} onPress={() => toggleFactor(factor.value)} style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: selectedFactors.includes(factor.value) ? '#F59E0B' : '#F3F4F6' }}>
                    <Text style={{ fontSize: 13, color: selectedFactors.includes(factor.value) ? 'white' : '#4B5563', fontWeight: '600' }}>{factor.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Journal */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>Quick Note</Text>
              <TextInput
                style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, minHeight: 100, textAlignVertical: 'top', fontSize: 15, color: '#1F2937' }}
                placeholder="How was your day? Any thoughts..."
                placeholderTextColor="#9CA3AF"
                value={journalEntry}
                onChangeText={setJournalEntry}
                multiline
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ backgroundColor: '#F59E0B', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 32, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 17, fontWeight: '600' }}>{existingEntry ? '✓ Update Entry' : '✓ Save Entry'}</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};
