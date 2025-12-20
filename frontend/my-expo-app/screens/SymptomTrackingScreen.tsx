import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  History,
  Frown,
  Circle,
  Moon,
  HeadsetIcon,
  Zap,
  ArrowLeftRight,
  Scissors,
  User,
  Scale,
  Flame,
  Droplets,
  AlertTriangle,
  RefreshCw,
  Angry,
  Cloud,
  BatteryLow,
  LucideIcon,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../constants/theme';

interface SymptomTrackingScreenProps {
  onNavigateBack?: () => void;
  onNavigateToHistory?: () => void;
}

interface Symptom {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'physical' | 'hormonal' | 'emotional';
}

interface SymptomEntry {
  date: string;
  symptoms: string[];
  severity: { [key: string]: number };
  notes?: string;
}

const SYMPTOMS: Symptom[] = [
  // Physical
  { id: 'acne', name: 'Acne', icon: Frown, category: 'physical' },
  { id: 'bloating', name: 'Bloating', icon: Circle, category: 'physical' },
  { id: 'fatigue', name: 'Fatigue', icon: Moon, category: 'physical' },
  { id: 'headache', name: 'Headache', icon: HeadsetIcon, category: 'physical' },
  { id: 'cramps', name: 'Cramps', icon: Zap, category: 'physical' },
  { id: 'back_pain', name: 'Back Pain', icon: ArrowLeftRight, category: 'physical' },
  
  // Hormonal
  { id: 'hair_loss', name: 'Hair Loss', icon: Scissors, category: 'hormonal' },
  { id: 'excess_hair', name: 'Excess Hair', icon: User, category: 'hormonal' },
  { id: 'weight_gain', name: 'Weight Gain', icon: Scale, category: 'hormonal' },
  { id: 'hot_flashes', name: 'Hot Flashes', icon: Flame, category: 'hormonal' },
  { id: 'oily_skin', name: 'Oily Skin', icon: Droplets, category: 'hormonal' },
  
  // Emotional
  { id: 'anxiety', name: 'Anxiety', icon: AlertTriangle, category: 'emotional' },
  { id: 'mood_swings', name: 'Mood Swings', icon: RefreshCw, category: 'emotional' },
  { id: 'irritability', name: 'Irritability', icon: Angry, category: 'emotional' },
  { id: 'brain_fog', name: 'Brain Fog', icon: Cloud, category: 'emotional' },
  { id: 'low_energy', name: 'Low Energy', icon: BatteryLow, category: 'emotional' },
];

const STORAGE_KEY = 'symptom_history';

export const SymptomTrackingScreen: React.FC<SymptomTrackingScreenProps> = ({
  onNavigateBack,
  onNavigateToHistory,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<{ [key: string]: number }>({});
  const [isSaving, setIsSaving] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const history: SymptomEntry[] = JSON.parse(data);
        const todayEntry = history.find(e => e.date === today);
        if (todayEntry) {
          setSelectedSymptoms(todayEntry.symptoms);
          setSeverity(todayEntry.severity);
        }
      }
    } catch (error) {
      console.error('Error loading symptoms:', error);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(prev => prev.filter(id => id !== symptomId));
      setSeverity(prev => {
        const newSeverity = { ...prev };
        delete newSeverity[symptomId];
        return newSeverity;
      });
    } else {
      setSelectedSymptoms(prev => [...prev, symptomId]);
      setSeverity(prev => ({ ...prev, [symptomId]: 2 })); // Default severity: moderate
    }
  };

  const updateSeverity = (symptomId: string, level: number) => {
    setSeverity(prev => ({ ...prev, [symptomId]: level }));
  };

  const saveEntry = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms', 'Select at least one symptom to log.');
      return;
    }

    try {
      setIsSaving(true);
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      let history: SymptomEntry[] = data ? JSON.parse(data) : [];
      
      // Remove existing entry for today
      history = history.filter(e => e.date !== today);
      
      // Add new entry
      history.unshift({
        date: today,
        symptoms: selectedSymptoms,
        severity,
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      Alert.alert('Saved! 💜', 'Your symptoms have been logged.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save symptoms.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedColor = colors.reminder; // Purple color for all selected symptoms

  const renderSymptomsByCategory = (category: 'physical' | 'hormonal' | 'emotional') => {
    const categorySymptoms = SYMPTOMS.filter(s => s.category === category);
    const categoryLabels = {
      physical: { title: 'Physical', color: colors.primary },
      hormonal: { title: 'Hormonal', color: colors.insights },
      emotional: { title: 'Emotional', color: colors.mood },
    };

    return (
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.md, marginLeft: 4 }}>
          {categoryLabels[category].title.toUpperCase()}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {categorySymptoms.map(symptom => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            return (
              <TouchableOpacity
                key={symptom.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isSelected ? selectedColor : colors.white,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.round,
                  borderWidth: 1,
                  borderColor: isSelected ? selectedColor : colors.border,
                  ...shadows.sm,
                }}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <symptom.icon size={16} color={isSelected ? colors.white : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: fontSize.base, color: isSelected ? colors.white : colors.textPrimary, fontWeight: isSelected ? fontWeight.semibold : fontWeight.normal }}>
                  {symptom.name}
                </Text>
                {isSelected && (
                  <View style={{ marginLeft: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                    <Check size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSeveritySelector = () => {
    if (selectedSymptoms.length === 0) return null;

    return (
      <View style={{ backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.sm }}>
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.lg }}>
          Severity Level
        </Text>
        {selectedSymptoms.map(symptomId => {
          const symptom = SYMPTOMS.find(s => s.id === symptomId);
          if (!symptom) return null;
          const currentSeverity = severity[symptomId] || 2;

          return (
            <View key={symptomId} style={{ marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <symptom.icon size={16} color={colors.textPrimary} />
                <Text style={{ fontSize: fontSize.base, color: colors.textPrimary, marginLeft: 6 }}>
                  {symptom.name}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {[1, 2, 3].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                      backgroundColor: currentSeverity === level 
                        ? level === 1 ? colors.success : level === 2 ? colors.warning : colors.error
                        : colors.background,
                      alignItems: 'center',
                    }}
                    onPress={() => updateSeverity(symptomId, level)}
                  >
                    <Text style={{ 
                      fontSize: fontSize.sm, 
                      fontWeight: currentSeverity === level ? fontWeight.semibold : fontWeight.normal,
                      color: currentSeverity === level ? colors.white : colors.textSecondary 
                    }}>
                      {level === 1 ? 'Mild' : level === 2 ? 'Moderate' : 'Severe'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: colors.reminder, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onNavigateBack && (
                <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md }}>
                  <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
              )}
              <View>
                <Text style={{ fontSize: fontSize.title, fontWeight: fontWeight.bold, color: 'white' }}>Symptom Tracker</Text>
                <Text style={{ fontSize: fontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Track your PCOS symptoms</Text>
              </View>
            </View>
            {onNavigateToHistory && (
              <TouchableOpacity onPress={onNavigateToHistory} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <History size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Today's count */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>📋</Text>
            </View>
            <View style={{ marginLeft: spacing.lg }}>
              <Text style={{ fontSize: fontSize.md, color: 'rgba(255,255,255,0.8)' }}>Today's Log</Text>
              <Text style={{ fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: 'white' }}>
                {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ padding: spacing.xl, marginTop: -spacing.lg }}>
          {/* Symptoms Selection */}
          <View style={{ backgroundColor: colors.white, borderRadius: borderRadius.xxl, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.lg }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.lg }}>
              How are you feeling today?
            </Text>
            {renderSymptomsByCategory('physical')}
            {renderSymptomsByCategory('hormonal')}
            {renderSymptomsByCategory('emotional')}
          </View>

          {/* Severity Selector */}
          {renderSeveritySelector()}

          {/* Save Button */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.reminder,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              alignItems: 'center',
              marginBottom: spacing.xxxl,
              opacity: isSaving ? 0.7 : 1,
            }}
            onPress={saveEntry}
            disabled={isSaving}
          >
            <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: 'white' }}>
              {isSaving ? 'Saving...' : 'Save Symptoms'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
