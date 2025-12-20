import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';
import * as periodService from '../services/periodService';
import {
  PeriodSymptom,
  FlowIntensity,
  PERIOD_SYMPTOMS,
  FLOW_OPTIONS,
  formatDate,
  getRegularityInfo,
} from '../services/periodService';
import * as notificationService from '../services/notificationService';
import { ReminderSettings } from '../services/notificationService';

interface PeriodTrackingScreenProps {
  onNavigateBack?: () => void;
  onNavigateToHistory?: () => void;
}

// Heart Icon Component with fill levels
const HeartIcon: React.FC<{ flow: 'light' | 'medium' | 'heavy'; size?: number }> = ({ flow, size = 20 }) => {
  const fillPercent = flow === 'heavy' ? 100 : flow === 'medium' ? 50 : 25;
  const fillHeight = (size * fillPercent) / 100;
  const yOffset = size - fillHeight;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <ClipPath id={`heartClip-${flow}-${size}`}>
          <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </ClipPath>
      </Defs>
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="#EC4899"
        strokeWidth={1.5}
        fill="none"
      />
      <Rect x={0} y={yOffset} width={24} height={fillHeight} fill="#EC4899" clipPath={`url(#heartClip-${flow}-${size})`} />
    </Svg>
  );
};


// Flow Selection Modal
const FlowModal: React.FC<{
  visible: boolean;
  date: string;
  currentFlow?: FlowIntensity;
  onSelect: (flow: FlowIntensity) => void;
  onRemove: () => void;
  onClose: () => void;
}> = ({ visible, date, currentFlow, onSelect, onRemove, onClose }) => {
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={{ width: '85%' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' }}>
              Log Period
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
              {formatDisplayDate(date)}
            </Text>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 20, marginBottom: 12 }}>
              Select Flow Intensity:
            </Text>

            <View style={{ gap: 10 }}>
              {FLOW_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: currentFlow === option.value ? '#FCE7F3' : '#F9FAFB',
                    borderWidth: 2,
                    borderColor: currentFlow === option.value ? '#EC4899' : 'transparent',
                  }}
                  onPress={() => onSelect(option.value)}
                >
                  <HeartIcon flow={option.value} size={28} />
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>{option.label}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {option.value === 'light' ? 'Spotting or light bleeding' : option.value === 'medium' ? 'Normal flow' : 'Heavy bleeding'}
                    </Text>
                  </View>
                  {currentFlow === option.value && (
                    <Text style={{ fontSize: 18, color: '#EC4899' }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {currentFlow && (
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#FEE2E2',
                  alignItems: 'center',
                }}
                onPress={onRemove}
              >
                <Text style={{ color: '#DC2626', fontWeight: '600' }}>Remove Period Log</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{ marginTop: 12, padding: 14, alignItems: 'center' }}
              onPress={onClose}
            >
              <Text style={{ color: '#6B7280', fontWeight: '500' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};


// Custom Calendar Component
const CustomCalendar: React.FC<{
  periodDays: { [key: string]: FlowIntensity };
  predictedDate?: string;
  onDayPress: (date: string) => void;
}> = ({ periodDays, predictedDate, onDayPress }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: number; month: 'prev' | 'current' | 'next'; fullDate: string }[] = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, day);
      days.push({ date: day, month: 'prev', fullDate: prevDate.toISOString().split('T')[0] });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: i, month: 'current', fullDate: currentDate.toISOString().split('T')[0] });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: i, month: 'next', fullDate: nextDate.toISOString().split('T')[0] });
    }

    return days;
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16 }}>
      {/* Month Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={goToPrevMonth} style={{ padding: 10 }}>
          <Text style={{ fontSize: 28, color: '#EC4899', fontWeight: '300' }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937' }}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={{ padding: 10 }}>
          <Text style={{ fontSize: 28, color: '#EC4899', fontWeight: '300' }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {DAYS.map((day, index) => (
          <View
            key={day}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              backgroundColor: index === 0 || index === 6 ? '#FDF2F8' : 'transparent',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: index === 0 || index === 6 ? '#EC4899' : '#6B7280' }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day, index) => {
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          const periodFlow = periodDays[day.fullDate];
          const isPredicted = day.fullDate === predictedDate && !periodFlow;
          const isToday = day.fullDate === today;
          const isFuture = day.fullDate > today;
          const isCurrentMonth = day.month === 'current';

          return (
            <TouchableOpacity
              key={`${day.fullDate}-${index}`}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isWeekend ? '#FDF2F8' : 'transparent',
              }}
              onPress={() => {
                if (isCurrentMonth) onDayPress(day.fullDate);
              }}
              disabled={!isCurrentMonth}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isPredicted ? '#FEF3C7' : 'transparent',
                  borderWidth: isToday ? 2 : 0,
                  borderColor: '#EC4899',
                }}
              >
                {periodFlow ? (
                  <View style={{ alignItems: 'center' }}>
                    <HeartIcon flow={periodFlow} size={22} />
                    <Text style={{ fontSize: 9, color: '#BE185D', fontWeight: '700', marginTop: 1 }}>
                      {day.date}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: isCurrentMonth ? '600' : '400',
                      color: !isCurrentMonth ? '#D1D5DB' : isWeekend ? '#EC4899' : '#1F2937',
                    }}
                  >
                    {day.date}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HeartIcon flow="light" size={14} />
            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>Light</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HeartIcon flow="medium" size={14} />
            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>Medium</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HeartIcon flow="heavy" size={14} />
            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>Heavy</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FEF3C7' }} />
            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>Predicted</Text>
          </View>
        </View>
      </View>
    </View>
  );
};


export const PeriodTrackingScreen: React.FC<PeriodTrackingScreenProps> = ({
  onNavigateBack,
  onNavigateToHistory,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data
  const [prediction, setPrediction] = useState<periodService.PeriodPrediction | null>(null);
  const [stats, setStats] = useState<periodService.PeriodStats | null>(null);
  const [periodDays, setPeriodDays] = useState<{ [key: string]: FlowIntensity }>({});

  // Modal state
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Reminder settings
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    daysBeforePeriod: [7, 3, 1],
    reminderTime: '09:00',
  });

  useEffect(() => {
    loadData();
    loadReminderSettings();
  }, []);

  // Schedule reminders when prediction changes
  useEffect(() => {
    if (prediction?.predictedStartDate && reminderSettings.enabled) {
      notificationService.schedulePeriodReminders(prediction.predictedStartDate, reminderSettings);
    }
  }, [prediction, reminderSettings]);

  const loadReminderSettings = async () => {
    const settings = await notificationService.getReminderSettings();
    setReminderSettings(settings);
  };

  const toggleReminders = async (enabled: boolean) => {
    const newSettings = { ...reminderSettings, enabled };
    setReminderSettings(newSettings);
    await notificationService.saveReminderSettings(newSettings);
    
    if (enabled && prediction?.predictedStartDate) {
      await notificationService.schedulePeriodReminders(prediction.predictedStartDate, newSettings);
      Alert.alert('🔔 Reminders On', "You'll get notified before your period! 💕");
    } else {
      await notificationService.cancelAllPeriodReminders();
    }
  };

  const toggleReminderDay = async (day: number) => {
    let newDays = [...reminderSettings.daysBeforePeriod];
    if (newDays.includes(day)) {
      newDays = newDays.filter((d) => d !== day);
    } else {
      newDays.push(day);
      newDays.sort((a, b) => b - a);
    }
    
    const newSettings = { ...reminderSettings, daysBeforePeriod: newDays };
    setReminderSettings(newSettings);
    await notificationService.saveReminderSettings(newSettings);
    
    if (reminderSettings.enabled && prediction?.predictedStartDate) {
      await notificationService.schedulePeriodReminders(prediction.predictedStartDate, newSettings);
    }
  };

  const sendTestReminder = async () => {
    await notificationService.sendTestNotification();
    Alert.alert('✓ Test Sent!', 'Check your notifications 💕');
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [predictionData, statsData, entriesData] = await Promise.all([
        periodService.getPeriodPrediction(),
        periodService.getPeriodStats(),
        periodService.getPeriodEntries(),
      ]);
      setPrediction(predictionData);
      setStats(statsData);

      const daysMap: { [key: string]: FlowIntensity } = {};
      (entriesData || []).forEach((entry: periodService.PeriodEntry) => {
        const start = new Date(entry.startDate);
        const end = entry.endDate ? new Date(entry.endDate) : start;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          daysMap[dateStr] = entry.flowIntensity || 'medium';
        }
      });
      setPeriodDays(daysMap);
    } catch (error) {
      console.error('Error loading period data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setShowFlowModal(true);
  };

  const handleSelectFlow = async (flow: FlowIntensity) => {
    try {
      setIsSaving(true);
      setShowFlowModal(false);

      // Update UI immediately
      setPeriodDays((prev) => ({ ...prev, [selectedDate]: flow }));

      await periodService.createPeriodEntry({
        startDate: selectedDate,
        endDate: selectedDate,
        flowIntensity: flow,
        symptoms: [],
      });

      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log period');
      loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDay = async () => {
    try {
      setIsSaving(true);
      setShowFlowModal(false);

      // Update UI immediately
      const newDays = { ...periodDays };
      delete newDays[selectedDate];
      setPeriodDays(newDays);

      // Find and delete the entry from backend
      const entries = await periodService.getPeriodEntries();
      const entryToDelete = entries.find((entry: periodService.PeriodEntry) => {
        const start = new Date(entry.startDate).toISOString().split('T')[0];
        const end = entry.endDate ? new Date(entry.endDate).toISOString().split('T')[0] : start;
        return selectedDate >= start && selectedDate <= end;
      });

      if (entryToDelete) {
        await periodService.deletePeriodEntry(entryToDelete.id);
      }

      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to remove period log');
      loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const getDaysUntilText = (days: number): string => {
    if (days < 0) return `${Math.abs(days)} days late`;
    if (days === 0) return 'Expected today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'high': return '#22C55E';
      case 'medium': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  // Count logged days this month
  const currentMonthDays = Object.keys(periodDays).filter((date) => {
    const d = new Date(date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#EC4899',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onNavigateBack && (
              <TouchableOpacity
                onPress={onNavigateBack}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20 }}>←</Text>
              </TouchableOpacity>
            )}
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Period Tracker</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                Tap any date to log flow
              </Text>
            </View>
          </View>
          {onNavigateToHistory && (
            <TouchableOpacity
              onPress={onNavigateToHistory}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>📊</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Prediction Card */}
        {prediction && prediction.daysUntil !== null && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>📅</Text>
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Next Period</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                {getDaysUntilText(prediction.daysUntil)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View
                style={{
                  backgroundColor: getConfidenceColor(prediction.confidence),
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
                  {prediction.confidence.toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                {formatDate(prediction.predictedStartDate)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ padding: 20, marginTop: -16 }}>
        {isLoading ? (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#EC4899" />
          </View>
        ) : (
          <>
            {/* Calendar */}
            <View
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
                marginBottom: 16,
              }}
            >
              <CustomCalendar
                periodDays={periodDays}
                predictedDate={prediction?.predictedStartDate}
                onDayPress={handleDayPress}
              />
            </View>

            {/* Stats Row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  padding: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#EC4899' }}>{currentMonthDays}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>Days this month</Text>
              </View>
              {stats && stats.totalPeriods > 0 && (
                <>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      padding: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#EC4899' }}>{stats.averageCycleLength}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Avg cycle days</Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      padding: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: getRegularityInfo(stats.cycleRegularity).color }}>
                      {stats.cycleRegularity < 5 ? '✓' : '~'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      {getRegularityInfo(stats.cycleRegularity).label}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Period Reminders */}
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 18,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginRight: 10 }}>🔔</Text>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>Period Reminders</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Get notified before your period</Text>
                  </View>
                </View>
                <Switch
                  value={reminderSettings.enabled}
                  onValueChange={toggleReminders}
                  trackColor={{ false: '#E5E7EB', true: '#FBCFE8' }}
                  thumbColor={reminderSettings.enabled ? '#EC4899' : '#9CA3AF'}
                />
              </View>

              {reminderSettings.enabled && (
                <>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 10 }}>
                    Remind me before:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {[7, 3, 1].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: reminderSettings.daysBeforePeriod.includes(day) ? '#EC4899' : '#F3F4F6',
                          alignItems: 'center',
                        }}
                        onPress={() => toggleReminderDay(day)}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: reminderSettings.daysBeforePeriod.includes(day) ? 'white' : '#6B7280',
                          }}
                        >
                          {day} {day === 1 ? 'day' : 'days'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FDF2F8',
                      padding: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                    onPress={sendTestReminder}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🧪</Text>
                    <Text style={{ fontSize: 14, color: '#BE185D', fontWeight: '500' }}>Send Test Notification</Text>
                  </TouchableOpacity>
                </>
              )}

              {prediction && prediction.daysUntil !== null && prediction.daysUntil > 0 && reminderSettings.enabled && (
                <View style={{ backgroundColor: '#F0FDF4', padding: 12, borderRadius: 10, marginTop: 12 }}>
                  <Text style={{ fontSize: 12, color: '#166534' }}>
                    ✓ Reminders scheduled for {reminderSettings.daysBeforePeriod.filter(d => d < prediction.daysUntil).length > 0 
                      ? reminderSettings.daysBeforePeriod.filter(d => d < prediction.daysUntil).join(', ') + ' days before'
                      : 'your next period'}
                  </Text>
                </View>
              )}
            </View>

            {/* PCOS Tip */}
            <View
              style={{
                backgroundColor: '#FDF2F8',
                borderRadius: 16,
                padding: 18,
                borderLeftWidth: 4,
                borderLeftColor: '#EC4899',
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#9D174D' }}>PCOS Tip</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#BE185D', lineHeight: 20 }}>
                Tracking flow intensity helps identify patterns. Heavy or irregular bleeding is common with PCOS - share this data with your healthcare provider.
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Flow Selection Modal */}
      <FlowModal
        visible={showFlowModal}
        date={selectedDate}
        currentFlow={periodDays[selectedDate]}
        onSelect={handleSelectFlow}
        onRemove={handleRemoveDay}
        onClose={() => setShowFlowModal(false)}
      />

      {/* Saving Indicator */}
      {isSaving && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16 }}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={{ marginTop: 12, color: '#6B7280' }}>Saving...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
