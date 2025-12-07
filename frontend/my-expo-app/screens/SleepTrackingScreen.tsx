import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Moon, CloudMoon, Sunrise, Frown, Meh, Smile, Sparkles, Brain, Coffee, Smartphone, Dumbbell, UtensilsCrossed, Wine, Pill, HeartCrack, AlertCircle, Lightbulb } from 'lucide-react-native';
import * as sleepService from '../services/sleepService';
import { SleepFactor } from '../services/sleepService';

const SLEEP_FACTORS: { value: SleepFactor; label: string; icon: any }[] = [
  { value: 'stress', label: 'Stress', icon: Brain },
  { value: 'caffeine', label: 'Caffeine', icon: Coffee },
  { value: 'screen_time', label: 'Screens', icon: Smartphone },
  { value: 'exercise', label: 'Exercise', icon: Dumbbell },
  { value: 'late_meal', label: 'Late Meal', icon: UtensilsCrossed },
  { value: 'alcohol', label: 'Alcohol', icon: Wine },
  { value: 'medication', label: 'Meds', icon: Pill },
  { value: 'pain', label: 'Pain', icon: HeartCrack },
  { value: 'anxiety', label: 'Anxiety', icon: AlertCircle },
];

interface SleepTrackingScreenProps {
  onNavigateToHistory?: () => void;
  onNavigateBack?: () => void;
}

const QUALITY_OPTIONS = [
  { value: 1, label: 'Terrible', color: '#EF4444' },
  { value: 2, label: 'Poor', color: '#F97316' },
  { value: 3, label: 'Fair', color: '#EAB308' },
  { value: 4, label: 'Good', color: '#22C55E' },
  { value: 5, label: 'Excellent', color: '#6366F1' },
];

const QualityIcon: React.FC<{ level: number; size?: number; color?: string }> = ({ level, size = 24, color }) => {
  if (level <= 2) return <Frown size={size} color={color} />;
  if (level === 3) return <Meh size={size} color={color} />;
  if (level === 4) return <Smile size={size} color={color} />;
  return <Sparkles size={size} color={color} />;
};

export const SleepTrackingScreen: React.FC<SleepTrackingScreenProps> = ({ onNavigateToHistory, onNavigateBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bedtime, setBedtime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [selectedFactors, setSelectedFactors] = useState<SleepFactor[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [existingEntry, setExistingEntry] = useState<sleepService.SleepEntry | null>(null);

  useEffect(() => { loadExistingEntry(); }, [selectedDate]);

  const loadExistingEntry = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const entry = await sleepService.getSleepEntryByDate(dateStr);
      if (entry) {
        setExistingEntry(entry);
        setBedtime(new Date(entry.bedtime));
        setWakeTime(new Date(entry.wakeTime));
        setQuality(entry.quality);
        setSelectedFactors(entry.factors);
      } else {
        setExistingEntry(null);
        const defaultBedtime = new Date(selectedDate);
        defaultBedtime.setHours(22, 0, 0, 0);
        setBedtime(defaultBedtime);
        const defaultWakeTime = new Date(selectedDate);
        defaultWakeTime.setDate(defaultWakeTime.getDate() + 1);
        defaultWakeTime.setHours(6, 0, 0, 0);
        setWakeTime(defaultWakeTime);
        setQuality(3);
        setSelectedFactors([]);
      }
    } catch (error) {
      console.error('Error loading sleep entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (): number => Math.round((wakeTime.getTime() - bedtime.getTime()) / (1000 * 60));
  const toggleFactor = (factor: SleepFactor) => setSelectedFactors(prev => prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]);
  const formatTime = (date: Date): string => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
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

  const handleSave = async () => {
    const duration = calculateDuration();
    if (duration <= 0) { Alert.alert('Invalid', 'Wake time must be after bedtime'); return; }
    try {
      setIsSaving(true);
      await sleepService.createSleepEntry({
        date: selectedDate.toISOString().split('T')[0],
        bedtime: bedtime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        quality,
        factors: selectedFactors,
      });
      Alert.alert('Saved', 'Sleep entry saved!');
      loadExistingEntry();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const duration = calculateDuration();
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const isValidDuration = duration > 0;
  const currentQuality = QUALITY_OPTIONS.find(q => q.value === quality)!;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ backgroundColor: '#6366F1', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onNavigateBack && (
              <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Sleep Tracker</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Track your rest</Text>
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
            <Moon size={28} color="white" />
          </View>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{existingEntry ? 'Logged Sleep' : 'Sleep Duration'}</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              {isValidDuration ? `${hours}h ${mins}m` : '--'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <QualityIcon level={quality} size={24} color="white" />
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{currentQuality.label}</Text>
          </View>
        </View>

        {/* Tip */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <Lightbulb size={16} color="rgba(255,255,255,0.8)" />
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 8, flex: 1 }}>
            Aim for 7-9 hours. Consistent sleep helps regulate hormones.
          </Text>
        </View>
      </View>

      <View style={{ padding: 20, marginTop: -16 }}>
        {isLoading ? (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <>
            {/* Date Selector */}
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <TouchableOpacity onPress={() => navigateDate('prev')} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' }}>
                <ChevronLeft size={20} color="#6366F1" />
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }} onPress={() => setShowDatePicker(true)}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateDate('next')} disabled={selectedDate.toDateString() === new Date().toDateString()} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.4 : 1 }}>
                <ChevronRight size={20} color="#6366F1" />
              </TouchableOpacity>
            </View>
            {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }} maximumDate={new Date()} />}

            {/* Time Pickers */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>Sleep Schedule</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => setShowBedtimePicker(true)} style={{ flex: 1, backgroundColor: '#1E1B4B', borderRadius: 16, padding: 18, alignItems: 'center' }}>
                  <CloudMoon size={30} color="white" />
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>Bedtime</Text>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 4 }}>{formatTime(bedtime)}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowWakeTimePicker(true)} style={{ flex: 1, backgroundColor: '#FEF3C7', borderRadius: 16, padding: 18, alignItems: 'center' }}>
                  <Sunrise size={30} color="#92400E" />
                  <Text style={{ fontSize: 12, color: '#92400E', marginTop: 10 }}>Wake Up</Text>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#78350F', marginTop: 4 }}>{formatTime(wakeTime)}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {showBedtimePicker && <DateTimePicker value={bedtime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, date) => { setShowBedtimePicker(false); if (date) setBedtime(date); }} />}
            {showWakeTimePicker && <DateTimePicker value={wakeTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, date) => { setShowWakeTimePicker(false); if (date) setWakeTime(date); }} />}

            {/* Quality Selection */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>Sleep Quality</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {QUALITY_OPTIONS.map(option => (
                  <TouchableOpacity key={option.value} onPress={() => setQuality(option.value as 1|2|3|4|5)} style={{ alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: quality === option.value ? option.color : '#F9FAFB', borderWidth: 2, borderColor: quality === option.value ? option.color : 'transparent', minWidth: 58 }}>
                    <QualityIcon level={option.value} size={26} color={quality === option.value ? 'white' : '#9CA3AF'} />
                    <Text style={{ fontSize: 10, color: quality === option.value ? 'white' : '#9CA3AF', marginTop: 6, fontWeight: '600' }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Factors */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>What affected your sleep?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {SLEEP_FACTORS.map(factor => {
                  const isSelected = selectedFactors.includes(factor.value);
                  const IconComponent = factor.icon;
                  return (
                    <TouchableOpacity 
                      key={factor.value} 
                      onPress={() => toggleFactor(factor.value)} 
                      style={{ 
                        width: '31%', 
                        alignItems: 'center', 
                        padding: 14, 
                        borderRadius: 14, 
                        backgroundColor: isSelected ? '#6366F1' : '#F9FAFB', 
                        borderWidth: 2, 
                        borderColor: isSelected ? '#6366F1' : 'transparent',
                        marginBottom: 10,
                      }}
                    >
                      <IconComponent size={24} color={isSelected ? 'white' : '#9CA3AF'} />
                      <Text style={{ fontSize: 11, color: isSelected ? 'white' : '#6B7280', marginTop: 8, fontWeight: '500' }}>{factor.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSave} disabled={isSaving || !isValidDuration} style={{ backgroundColor: isValidDuration ? '#6366F1' : '#9CA3AF', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 32, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isValidDuration ? 0.3 : 0, shadowRadius: 8, elevation: isValidDuration ? 4 : 0 }}>
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 17, fontWeight: '600' }}>{existingEntry ? '✓ Update Entry' : '✓ Save Entry'}</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};
