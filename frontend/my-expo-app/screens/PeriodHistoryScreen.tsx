import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';
import * as periodService from '../services/periodService';
import { PERIOD_SYMPTOMS, FLOW_OPTIONS, formatDate, getRegularityInfo } from '../services/periodService';

interface PeriodHistoryScreenProps {
  onNavigateBack?: () => void;
}

export const PeriodHistoryScreen: React.FC<PeriodHistoryScreenProps> = ({ onNavigateBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<periodService.PeriodEntry[]>([]);
  const [stats, setStats] = useState<periodService.PeriodStats | null>(null);
  const [settings, setSettings] = useState<periodService.PeriodSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entriesData, statsData, settingsData] = await Promise.all([
        periodService.getPeriodEntries(12),
        periodService.getPeriodStats(),
        periodService.getPeriodSettings(),
      ]);
      setEntries(entriesData);
      setStats(statsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading period data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      const updated = await periodService.updatePeriodSettings({ notificationsEnabled: enabled });
      setSettings(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleChangeNotifyDays = async (days: number) => {
    try {
      const updated = await periodService.updatePeriodSettings({ notifyDaysBefore: days });
      setSettings(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const getFlowColor = (flow?: string): string => {
    const option = FLOW_OPTIONS.find((f) => f.value === flow);
    return option?.color || '#9CA3AF';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          {onNavigateBack && (
            <TouchableOpacity onPress={onNavigateBack} style={{ marginRight: 16 }}>
              <Text style={{ color: '#3B82F6', fontSize: 24 }}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Period History</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#EC4899" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Statistics */}
            {stats && stats.totalPeriods > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                  Cycle Statistics
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={{ flex: 1, backgroundColor: '#FDF2F8', padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: '#9D174D' }}>Average Cycle</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#BE185D' }}>
                      {stats.averageCycleLength} days
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#FDF2F8', padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: '#9D174D' }}>Average Period</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#BE185D' }}>
                      {stats.averagePeriodLength} days
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Shortest Cycle</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#374151' }}>
                      {stats.shortestCycle} days
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>Longest Cycle</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#374151' }}>
                      {stats.longestCycle} days
                    </Text>
                  </View>
                </View>

                {/* Regularity */}
                <View style={{
                  backgroundColor: getRegularityInfo(stats.cycleRegularity).color + '15',
                  padding: 16,
                  borderRadius: 12,
                  marginTop: 12,
                }}>
                  <Text style={{ fontSize: 14, color: '#374151' }}>
                    Cycle Regularity: {' '}
                    <Text style={{
                      fontWeight: 'bold',
                      color: getRegularityInfo(stats.cycleRegularity).color,
                    }}>
                      {getRegularityInfo(stats.cycleRegularity).label}
                    </Text>
                  </Text>
                  {stats.cycleRegularity !== 'regular' && (
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                      Variation of {stats.longestCycle - stats.shortestCycle} days between cycles
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Notification Settings */}
            {settings && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                  🔔 Notification Settings
                </Text>
                <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <Text style={{ fontSize: 16, color: '#374151' }}>Pre-period Reminders</Text>
                    <Switch
                      value={settings.notificationsEnabled}
                      onValueChange={handleToggleNotifications}
                      trackColor={{ false: '#D1D5DB', true: '#FBCFE8' }}
                      thumbColor={settings.notificationsEnabled ? '#EC4899' : '#9CA3AF'}
                    />
                  </View>

                  {settings.notificationsEnabled && (
                    <View>
                      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                        Notify me before period:
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {[1, 2, 3].map((days) => (
                          <TouchableOpacity
                            key={days}
                            style={{
                              flex: 1,
                              padding: 12,
                              borderRadius: 8,
                              backgroundColor: settings.notifyDaysBefore === days ? '#EC4899' : 'white',
                              alignItems: 'center',
                            }}
                            onPress={() => handleChangeNotifyDays(days)}
                          >
                            <Text style={{
                              color: settings.notifyDaysBefore === days ? 'white' : '#6B7280',
                              fontWeight: '500',
                            }}>
                              {days} day{days > 1 ? 's' : ''}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Common Symptoms */}
            {stats && Object.keys(stats.symptomFrequency).length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                  Common Symptoms
                </Text>
                <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 }}>
                  {Object.entries(stats.symptomFrequency)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([symptom, count]) => {
                      const symptomInfo = PERIOD_SYMPTOMS.find((s) => s.value === symptom);
                      const percentage = stats.totalPeriods > 0 ? (count / stats.totalPeriods) * 100 : 0;
                      return (
                        <View key={symptom} style={{ marginBottom: 12 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: '#374151' }}>
                              {symptomInfo?.emoji} {symptomInfo?.label || symptom}
                            </Text>
                            <Text style={{ color: '#6B7280' }}>{percentage.toFixed(0)}%</Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                            <View
                              style={{
                                height: '100%',
                                width: `${percentage}%`,
                                backgroundColor: '#EC4899',
                                borderRadius: 3,
                              }}
                            />
                          </View>
                        </View>
                      );
                    })}
                </View>
              </View>
            )}

            {/* Period History */}
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                Period History
              </Text>

              {entries.length === 0 ? (
                <View style={{ backgroundColor: '#F9FAFB', padding: 24, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280', fontSize: 16 }}>No periods logged yet</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
                    Start tracking to see your history
                  </Text>
                </View>
              ) : (
                entries.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={{
                      backgroundColor: '#F9FAFB',
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontWeight: '600', color: '#111827' }}>
                          {formatDate(entry.startDate)}
                          {entry.endDate && ` - ${formatDate(entry.endDate)}`}
                        </Text>
                        {entry.cycleLength && (
                          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                            Cycle: {entry.cycleLength} days
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        {entry.flowIntensity && (
                          <View style={{
                            backgroundColor: getFlowColor(entry.flowIntensity),
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}>
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                              {entry.flowIntensity}
                            </Text>
                          </View>
                        )}
                        {entry.periodLength && (
                          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                            {entry.periodLength} days
                          </Text>
                        )}
                      </View>
                    </View>

                    {entry.symptoms.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 }}>
                        {entry.symptoms.slice(0, 5).map((symptom) => {
                          const symptomInfo = PERIOD_SYMPTOMS.find((s) => s.value === symptom);
                          return (
                            <Text key={symptom} style={{ fontSize: 14 }}>
                              {symptomInfo?.emoji}
                            </Text>
                          );
                        })}
                        {entry.symptoms.length > 5 && (
                          <Text style={{ fontSize: 12, color: '#6B7280' }}>
                            +{entry.symptoms.length - 5}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* PCOS Insight */}
            {stats && stats.totalPeriods >= 3 && (
              <View style={{
                backgroundColor: stats.cycleRegularity === 'regular' ? '#F0FDF4' : '#FEF3C7',
                padding: 16,
                borderRadius: 12,
                marginTop: 24,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: stats.cycleRegularity === 'regular' ? '#166534' : '#92400E',
                  marginBottom: 4,
                }}>
                  {stats.cycleRegularity === 'regular' ? '✅ Good Cycle Pattern' : '📊 PCOS Insight'}
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: stats.cycleRegularity === 'regular' ? '#15803D' : '#B45309',
                  lineHeight: 20,
                }}>
                  {stats.cycleRegularity === 'regular'
                    ? 'Your cycles are relatively regular. Keep tracking and maintaining healthy habits!'
                    : `Your cycles vary by ${stats.longestCycle - stats.shortestCycle} days. This is common with PCOS. Share this data with your healthcare provider for personalized advice.`}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};
