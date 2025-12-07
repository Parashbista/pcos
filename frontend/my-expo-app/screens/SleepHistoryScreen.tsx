import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import * as sleepService from '../services/sleepService';
import { formatDuration, getQualityLabel, getQualityColor, SLEEP_FACTORS } from '../services/sleepService';

interface SleepHistoryScreenProps {
  onNavigateBack?: () => void;
}

type TimeRange = '7days' | '30days' | '90days';

const QUALITY_EMOJIS = ['', '😫', '😔', '😐', '😊', '😴'];

export const SleepHistoryScreen: React.FC<SleepHistoryScreenProps> = ({ onNavigateBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [entries, setEntries] = useState<sleepService.SleepEntry[]>([]);
  const [stats, setStats] = useState<sleepService.SleepStats | null>(null);
  const [goal, setGoal] = useState<sleepService.SleepGoal | null>(null);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const getDateRange = (): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();

      const [entriesData, statsData, goalData] = await Promise.all([
        sleepService.getSleepEntries(startDate, endDate),
        sleepService.getSleepStats(startDate, endDate),
        sleepService.getSleepGoal(),
      ]);

      setEntries(entriesData);
      setStats(statsData);
      setGoal(goalData);
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getRangeLabel = () => {
    switch (timeRange) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#3B82F6',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 80,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
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
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Sleep Analytics</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              {getRangeLabel()} • {stats?.totalEntries || 0} nights tracked
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ paddingHorizontal: 20, marginTop: -60 }}>
        {/* Time Range Selector */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 6,
            flexDirection: 'row',
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {(['7days', '30days', '90days'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: timeRange === range ? '#3B82F6' : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={{
                  color: timeRange === range ? 'white' : '#6B7280',
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            {stats && stats.totalEntries > 0 && (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
                  Sleep Summary
                </Text>

                {/* Main Stats Row */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#EFF6FF',
                      borderRadius: 16,
                      padding: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#3B82F6', marginBottom: 4 }}>Avg Duration</Text>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1E40AF' }}>
                      {Math.floor(stats.averageDuration / 60)}h {stats.averageDuration % 60}m
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#F0FDF4',
                      borderRadius: 16,
                      padding: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#22C55E', marginBottom: 4 }}>Avg Quality</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 24 }}>
                        {QUALITY_EMOJIS[Math.round(stats.averageQuality)]}
                      </Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#166534', marginLeft: 6 }}>
                        {stats.averageQuality.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Time Stats */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#1E3A5F',
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 20, marginRight: 8 }}>🌙</Text>
                    <View>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Avg Bedtime</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                        {stats.averageBedtime}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#FEF3C7',
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 20, marginRight: 8 }}>☀️</Text>
                    <View>
                      <Text style={{ fontSize: 11, color: '#92400E' }}>Avg Wake</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#78350F' }}>
                        {stats.averageWakeTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Goal Progress */}
                {goal && (
                  <View style={{ marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, color: '#6B7280' }}>Goal Achievement</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937' }}>
                        {stats.goalAchievementRate}%
                      </Text>
                    </View>
                    <View style={{ height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${stats.goalAchievementRate}%`,
                          backgroundColor: stats.goalAchievementRate >= 70 ? '#22C55E' : '#F59E0B',
                          borderRadius: 5,
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Factor Analysis */}
            {stats && Object.keys(stats.factorFrequency).length > 0 && (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
                  Sleep Disruptors
                </Text>
                {Object.entries(stats.factorFrequency)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([factor, count]) => {
                    const factorInfo = SLEEP_FACTORS.find((f) => f.value === factor);
                    const percentage = stats.totalEntries > 0 ? (count / stats.totalEntries) * 100 : 0;
                    return (
                      <View key={factor} style={{ marginBottom: 14 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, marginRight: 8 }}>{factorInfo?.emoji}</Text>
                            <Text style={{ color: '#374151', fontWeight: '500' }}>
                              {factorInfo?.label || factor}
                            </Text>
                          </View>
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>
                            {count} nights ({percentage.toFixed(0)}%)
                          </Text>
                        </View>
                        <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              width: `${percentage}%`,
                              backgroundColor: '#3B82F6',
                              borderRadius: 4,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}

            {/* Recent Entries */}
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
                Recent Entries
              </Text>

              {entries.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>😴</Text>
                  <Text style={{ color: '#6B7280', fontSize: 16 }}>No sleep entries yet</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
                    Start tracking to see your history
                  </Text>
                </View>
              ) : (
                entries.slice(0, 7).map((entry, index) => (
                  <View
                    key={entry.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 14,
                      borderBottomWidth: index < Math.min(entries.length, 7) - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6',
                    }}
                  >
                    {/* Quality Indicator */}
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: getQualityColor(entry.quality) + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{QUALITY_EMOJIS[entry.quality]}</Text>
                    </View>

                    {/* Entry Details */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#1F2937', fontSize: 15 }}>
                        {formatDate(entry.date)}
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: 4, gap: 12 }}>
                        <Text style={{ color: '#6B7280', fontSize: 13 }}>
                          🌙{' '}
                          {new Date(entry.bedtime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={{ color: '#6B7280', fontSize: 13 }}>
                          ☀️{' '}
                          {new Date(entry.wakeTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* Duration */}
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#3B82F6' }}>
                        {formatDuration(entry.duration)}
                      </Text>
                      <View
                        style={{
                          backgroundColor: getQualityColor(entry.quality),
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ color: 'white', fontSize: 11, fontWeight: '500' }}>
                          {getQualityLabel(entry.quality)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* PCOS Insight */}
            {stats && stats.totalEntries > 0 && (
              <View
                style={{
                  backgroundColor: stats.averageDuration >= 420 ? '#F0FDF4' : '#FEF2F2',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 32,
                  borderLeftWidth: 4,
                  borderLeftColor: stats.averageDuration >= 420 ? '#22C55E' : '#EF4444',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>
                    {stats.averageDuration >= 420 ? '✅' : '⚠️'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: stats.averageDuration >= 420 ? '#166534' : '#991B1B',
                    }}
                  >
                    {stats.averageDuration >= 420 ? 'Great Sleep Pattern!' : 'Sleep Improvement Needed'}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: stats.averageDuration >= 420 ? '#15803D' : '#B91C1C',
                    lineHeight: 22,
                  }}
                >
                  {stats.averageDuration >= 420
                    ? 'You\'re averaging 7+ hours of sleep. This is excellent for managing PCOS symptoms and maintaining hormonal balance.'
                    : `You're averaging ${formatDuration(stats.averageDuration)} of sleep. For PCOS management, aim for 7-9 hours. Poor sleep increases cortisol and worsens insulin resistance.`}
                </Text>
              </View>
            )}

            {/* Empty State */}
            {(!stats || stats.totalEntries === 0) && (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 32,
                  alignItems: 'center',
                  marginBottom: 32,
                }}
              >
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                  No Data Yet
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 }}>
                  Start logging your sleep to see detailed analytics and insights for your PCOS management.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};
