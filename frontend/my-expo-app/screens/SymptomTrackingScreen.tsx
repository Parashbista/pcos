import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  History,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import * as symptomService from '../services/symptomService';
import {
  SymptomItem,
  SymptomName,
  SymptomSeverity,
  SymptomCategory,
  SymptomAnalysis,
  SYMPTOM_DEFINITIONS,
  CATEGORY_COLORS,
  SEVERITY_COLORS,
} from '../services/symptomService';
import SymptomRecommendationCard from '../components/symptom/SymptomRecommendationCard';

interface SymptomTrackingScreenProps {
  onNavigateBack?: () => void;
  onNavigateToHistory?: () => void;
}

export const SymptomTrackingScreen: React.FC<SymptomTrackingScreenProps> = ({
  onNavigateBack,
  onNavigateToHistory,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSymptoms, setSelectedSymptoms] = useState<Map<SymptomName, SymptomSeverity>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [existingEntry, setExistingEntry] = useState<symptomService.SymptomEntry | null>(null);

  useEffect(() => {
    loadExistingEntry();
  }, [selectedDate]);

  const loadExistingEntry = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const entry = await symptomService.getSymptomEntryByDate(dateStr);

      if (entry) {
        setExistingEntry(entry);
        const symptomsMap = new Map<SymptomName, SymptomSeverity>();
        entry.symptoms.forEach((s) => {
          symptomsMap.set(s.name, s.severity);
        });
        setSelectedSymptoms(symptomsMap);
      } else {
        setExistingEntry(null);
        setSelectedSymptoms(new Map());
      }
      setAnalysis(null);
    } catch (error) {
      console.error('Error loading symptoms:', error);
    } finally {
      setIsLoading(false);
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

  const toggleSymptom = (symptomName: SymptomName) => {
    const newMap = new Map(selectedSymptoms);
    if (newMap.has(symptomName)) {
      newMap.delete(symptomName);
    } else {
      newMap.set(symptomName, 'moderate');
    }
    setSelectedSymptoms(newMap);
  };

  const updateSeverity = (symptomName: SymptomName, severity: SymptomSeverity) => {
    const newMap = new Map(selectedSymptoms);
    newMap.set(symptomName, severity);
    setSelectedSymptoms(newMap);
  };

  const buildSymptomItems = (): SymptomItem[] => {
    const items: SymptomItem[] = [];
    selectedSymptoms.forEach((severity, name) => {
      const def = SYMPTOM_DEFINITIONS.find((s) => s.name === name);
      if (def) {
        items.push({ name, severity, category: def.category });
      }
    });
    return items;
  };

  const handleSave = async () => {
    if (selectedSymptoms.size === 0) {
      Alert.alert('No Symptoms', 'Select at least one symptom to log.');
      return;
    }
    try {
      setIsSaving(true);
      const symptoms = buildSymptomItems();
      const dateStr = selectedDate.toISOString().split('T')[0];
      const result = await symptomService.logSymptomsWithRecommendations({ date: dateStr, symptoms });
      setExistingEntry(result.entry);
      setAnalysis(result.analysis);
      if (result.analysis.whenToSeeDoctor) {
        Alert.alert('⚠️ Health Notice', result.analysis.whenToSeeDoctor);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save symptoms.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSymptomsByCategory = (category: SymptomCategory) => {
    const categorySymptoms = SYMPTOM_DEFINITIONS.filter((s) => s.category === category);
    const categoryColor = CATEGORY_COLORS[category];
    const labels: Record<SymptomCategory, string> = {
      physical: '💪 Physical', hormonal: '🌸 Hormonal', emotional: '💭 Emotional', digestive: '🍽️ Digestive',
    };
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: categoryColor, marginBottom: 10, marginLeft: 4 }}>{labels[category]}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categorySymptoms.map((symptom) => {
            const isSelected = selectedSymptoms.has(symptom.name);
            return (
              <TouchableOpacity key={symptom.name} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isSelected ? categoryColor : 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isSelected ? categoryColor : '#E5E7EB' }} onPress={() => toggleSymptom(symptom.name)}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>{symptom.emoji}</Text>
                <Text style={{ fontSize: 13, color: isSelected ? 'white' : '#374151', fontWeight: isSelected ? '600' : '400' }}>{symptom.label}</Text>
                {isSelected && <View style={{ marginLeft: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' }}><Check size={12} color="white" /></View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSeveritySelector = () => {
    if (selectedSymptoms.size === 0) return null;
    return (
      <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>How severe are your symptoms?</Text>
        {Array.from(selectedSymptoms.entries()).map(([symptomName, severity]) => {
          const symptom = SYMPTOM_DEFINITIONS.find((s) => s.name === symptomName);
          if (!symptom) return null;
          return (
            <View key={symptomName} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>{symptom.emoji}</Text>
                <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>{symptom.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map((level) => (
                  <TouchableOpacity key={level} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: severity === level ? SEVERITY_COLORS[level] : '#F3F4F6', alignItems: 'center' }} onPress={() => updateSeverity(symptomName, level)}>
                    <Text style={{ fontSize: 13, fontWeight: severity === level ? '600' : '400', color: severity === level ? 'white' : '#6B7280', textTransform: 'capitalize' }}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAnalysis = () => {
    if (!analysis) return null;
    return (
      <View style={{ marginBottom: 16 }}>
        <View style={{ backgroundColor: '#FDF4FF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F5D0FE' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Sparkles size={20} color="#A855F7" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#7C3AED', marginLeft: 8 }}>AI Analysis</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#6B21A8', lineHeight: 22 }}>{analysis.summary}</Text>
        </View>
        <View style={{ backgroundColor: '#FFF7ED', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🌸</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#C2410C' }}>PCOS Insight</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#9A3412', lineHeight: 22 }}>{analysis.pcosInsight}</Text>
        </View>
        {analysis.whenToSeeDoctor && (
          <View style={{ backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} color="#DC2626" style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#991B1B', marginBottom: 4 }}>When to See a Doctor</Text>
              <Text style={{ fontSize: 13, color: '#B91C1C', lineHeight: 20 }}>{analysis.whenToSeeDoctor}</Text>
            </View>
          </View>
        )}
        {analysis.recommendations.length > 0 && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12, marginLeft: 4 }}>💡 Personalized Recommendations</Text>
            {analysis.recommendations.map((rec, index) => (<SymptomRecommendationCard key={index} recommendation={rec} index={index} />))}
          </View>
        )}
      </View>
    );
  };

  const severeCounts = Array.from(selectedSymptoms.values()).filter((s) => s === 'severe').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onNavigateBack && (<TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}><ArrowLeft size={20} color="white" /></TouchableOpacity>)}
              <View><Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Symptom Tracker</Text><Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Track & get AI insights</Text></View>
            </View>
            {onNavigateToHistory && (<TouchableOpacity onPress={onNavigateToHistory} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}><History size={20} color="white" /></TouchableOpacity>)}
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 24 }}>📋</Text></View>
            <View style={{ marginLeft: 14, flex: 1 }}><Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Today's Log</Text><Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{selectedSymptoms.size} symptom{selectedSymptoms.size !== 1 ? 's' : ''}</Text></View>
            {severeCounts > 0 && (<View style={{ backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}><Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>{severeCounts} severe</Text></View>)}
          </View>
        </View>
        <View style={{ padding: 20, marginTop: -16 }}>
          {isLoading ? (<View style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#8B5CF6" /></View>) : (
            <>
              <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 6, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <TouchableOpacity onPress={() => navigateDate('prev')} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' }}><ChevronLeft size={20} color="#8B5CF6" /></TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}><Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{formatDate(selectedDate)}</Text></View>
                <TouchableOpacity onPress={() => navigateDate('next')} disabled={selectedDate.toDateString() === new Date().toDateString()} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.4 : 1 }}><ChevronRight size={20} color="#8B5CF6" /></TouchableOpacity>
              </View>
              <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>How are you feeling today?</Text>
                {renderSymptomsByCategory('physical')}
                {renderSymptomsByCategory('hormonal')}
                {renderSymptomsByCategory('emotional')}
                {renderSymptomsByCategory('digestive')}
              </View>
              {renderSeveritySelector()}
              <TouchableOpacity style={{ backgroundColor: '#8B5CF6', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 16, opacity: isSaving ? 0.7 : 1, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="white" /> : <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>{existingEntry ? '✓ Update & Get Insights' : '✓ Save & Get AI Insights'}</Text>}
              </TouchableOpacity>
              {renderAnalysis()}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
