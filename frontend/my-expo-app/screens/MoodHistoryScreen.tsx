import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as moodService from '../services/moodService';
import {
  MOOD_OPTIONS,
  ENERGY_OPTIONS,
  MOOD_FACTORS,
  getMoodEmoji,
  getEnergyEmoji,
  getMoodColor,
} from '../services/moodService';

interface MoodHistoryScreenProps {
  onNavigateBack?: () => void;
}

type TimeRange = '7days' | '30days' | '90days';

// Cute Stat Card
const StatCard: React.FC<{
  title: string;
  value: string;
  emoji: string;
  bgColor: string;
  textColor: string;
}> = ({ title, value, emoji, bgColor, textColor }) => (
  <View style={{ flex: 1, backgroundColor: bgColor, borderRadius: 20, padding: 16, borderWidth: 2, borderColor: textColor + '30' }}>
    <Text style={{ fontSize: 12, color: textColor, fontWeight: '500' }}>{title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: textColor, marginLeft: 8 }}>{value}</Text>
    </View>
  </View>
);

// Progress Bar
const ProgressBar: React.FC<{
  label: string;
  emoji: string;
  count: number;
  total: number;
  color: string;
}> = ({ label, emoji, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>{emoji}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', fontWeight: '500' }}>{label}</Text>
        </View>
        <Text style={{ fontSize: 13, color: '#FDA4AF' }}>{count} days</Text>
      </View>
      <View style={{ height: 10, backgroundColor: '#FFF0F3', borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: 5 }} />
      </View>
    </View>
  );
};

export const MoodHistoryScreen: React.FC<MoodHistoryScreenProps> = ({ onNavigateBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [entries, setEntries] = useState<moodService.MoodEntry[]>([]);
  const [stats, setStats] = useState<moodService.MoodStats | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<moodService.MoodEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '7days': startDate.setDate(startDate.getDate() - 7); break;
      case '30days': startDate.setDate(startDate.getDate() - 30); break;
      case '90days': startDate.setDate(startDate.getDate() - 90); break;
    }
    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();
      const [entriesData, statsData] = await Promise.all([
        moodService.getMoodEntries(startDate, endDate),
        moodService.getMoodStats(startDate, endDate),
      ]);
      setEntries(entriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEntryDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getInsightMessage = () => {
    if (!stats || stats.totalEntries === 0) return null;
    if (stats.averageMood >= 4) {
      return { type: 'positive', title: "You're glowing! ✨", message: "Your mood has been amazing lately! Keep doing what you're doing queen! 👑" };
    } else if (stats.averageMood >= 3) {
      return { type: 'neutral', title: 'Doing great babe! 💪', message: "You're staying balanced and that's something to be proud of! 💕" };
    } else {
      return { type: 'support', title: "Sending hugs 🤗", message: "It's okay to have tough days. Remember you're stronger than you think! We're here for you 💖" };
    }
  };

  const insight = getInsightMessage();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF5F7' }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#FB7185',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
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
                backgroundColor: 'rgba(255,255,255,0.25)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>←</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>MOODBOARD</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              ✨ Your emotional journey
            </Text>
          </View>
        </View>
      </View>

      {/* Time Range */}
      <View style={{ paddingHorizontal: 20, marginTop: -16 }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 6,
            flexDirection: 'row',
            borderWidth: 2,
            borderColor: '#FECDD3',
          }}
        >
          {(['7days', '30days', '90days'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: timeRange === range ? '#FB7185' : 'transparent',
                alignItems: 'center',
              }}
              onPress={() => setTimeRange(range)}
            >
              <Text style={{ color: timeRange === range ? 'white' : '#FDA4AF', fontWeight: '600', fontSize: 14 }}>
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FB7185" />
          <Text style={{ color: '#FDA4AF', marginTop: 12 }}>Loading your vibes... 💕</Text>
        </View>
      ) : (
        <View style={{ padding: 20 }}>
          {stats && stats.totalEntries > 0 ? (
            <>
              {/* Stats */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <StatCard
                  title="Avg Mood"
                  value={stats.averageMood.toFixed(1)}
                  emoji={getMoodEmoji(Math.round(stats.averageMood) as moodService.MoodLevel)}
                  bgColor="#FFF0F3"
                  textColor="#BE123C"
                />
                <StatCard
                  title="Avg Energy"
                  value={stats.averageEnergy.toFixed(1)}
                  emoji={getEnergyEmoji(Math.round(stats.averageEnergy) as moodService.EnergyLevel)}
                  bgColor="#FDF4FF"
                  textColor="#A21CAF"
                />
              </View>

              {/* Summary */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  borderWidth: 2,
                  borderColor: '#FECDD3',
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FB7185' }}>{stats.totalEntries}</Text>
                  <Text style={{ fontSize: 12, color: '#FDA4AF' }}>Entries 📝</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#FECDD3' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#A855F7' }}>{stats.entriesWithJournal}</Text>
                  <Text style={{ fontSize: 12, color: '#FDA4AF' }}>With Tea ☕</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#FECDD3' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F472B6' }}>
                    {Math.round((stats.totalEntries / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90)) * 100)}%
                  </Text>
                  <Text style={{ fontSize: 12, color: '#FDA4AF' }}>Streak 🔥</Text>
                </View>
              </View>

              {/* Mood Distribution */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: '#FECDD3',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#BE123C', marginBottom: 16 }}>
                  💖 Mood Breakdown
                </Text>
                {MOOD_OPTIONS.map((option) => (
                  <ProgressBar
                    key={option.value}
                    label={option.label}
                    emoji={option.emoji}
                    count={stats.moodDistribution[option.value] || 0}
                    total={stats.totalEntries}
                    color={option.color}
                  />
                ))}
              </View>

              {/* Insight */}
              {insight && (
                <View
                  style={{
                    backgroundColor: insight.type === 'positive' ? '#FDF2F8' : insight.type === 'neutral' ? '#FFF0F3' : '#FCE7F3',
                    borderRadius: 20,
                    padding: 18,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: '#FBCFE8',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#BE123C', marginBottom: 8 }}>
                    {insight.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#F472B6', lineHeight: 20 }}>{insight.message}</Text>
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FECDD3',
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#BE123C', marginBottom: 8 }}>No entries yet babe!</Text>
              <Text style={{ fontSize: 14, color: '#FDA4AF', textAlign: 'center' }}>
                Start journaling to see your mood patterns ✨
              </Text>
            </View>
          )}

          {/* Recent Entries */}
          {entries.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#BE123C', marginBottom: 14 }}>
                📅 Recent Entries
              </Text>
              {entries.slice(0, 10).map((entry) => {
                const moodOption = MOOD_OPTIONS.find((m) => m.value === entry.mood);
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 20,
                      padding: 16,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor: '#FECDD3',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => { setSelectedEntry(entry); setShowDetailModal(true); }}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: moodOption?.color + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{getMoodEmoji(entry.mood)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>
                        {formatEntryDate(entry.date)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#FDA4AF', marginTop: 2 }}>
                        {moodOption?.label} • {ENERGY_OPTIONS.find((e) => e.value === entry.energy)?.label} energy
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, color: '#FECDD3' }}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 32 }} />
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent onRequestClose={() => setShowDetailModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '80%' }}>
            {selectedEntry && (
              <ScrollView style={{ padding: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#BE123C' }}>Entry Details 💕</Text>
                  <TouchableOpacity
                    onPress={() => setShowDetailModal(false)}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FECDD3', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 18, color: '#BE123C' }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 14, color: '#FDA4AF', marginBottom: 16 }}>
                  {new Date(selectedEntry.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#FECDD3' }}>
                    <Text style={{ fontSize: 40 }}>{getMoodEmoji(selectedEntry.mood)}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#BE123C', marginTop: 8 }}>
                      {MOOD_OPTIONS.find((m) => m.value === selectedEntry.mood)?.label}
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#FECDD3' }}>
                    <Text style={{ fontSize: 40 }}>{getEnergyEmoji(selectedEntry.energy)}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#BE123C', marginTop: 8 }}>
                      {ENERGY_OPTIONS.find((e) => e.value === selectedEntry.energy)?.label}
                    </Text>
                  </View>
                </View>
                {selectedEntry.journalEntry && (
                  <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 2, borderColor: '#FECDD3' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#BE123C', marginBottom: 6 }}>🍵 The Tea</Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>{selectedEntry.journalEntry}</Text>
                  </View>
                )}
                {selectedEntry.gratitude && (
                  <View style={{ backgroundColor: '#FDF2F8', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 2, borderColor: '#FBCFE8' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#BE123C', marginBottom: 6 }}>🙏 Grateful For</Text>
                    <Text style={{ fontSize: 14, color: '#F472B6', lineHeight: 22 }}>{selectedEntry.gratitude}</Text>
                  </View>
                )}
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
