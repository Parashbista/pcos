import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft, AlertTriangle, Lightbulb, CheckCircle, Moon, Heart, Utensils, TrendingUp, RefreshCw } from 'lucide-react-native';
import * as pcosInsightsService from '../services/pcosInsightsService';
import { HealthSummary, PCOSInsight } from '../services/pcosInsightsService';

interface InsightsScreenProps {
  onNavigateBack?: () => void;
}

const InsightCard: React.FC<{ insight: PCOSInsight }> = ({ insight }) => {
  const getIcon = () => {
    if (insight.type === 'warning') return <AlertTriangle size={20} color="#EF4444" />;
    if (insight.type === 'positive') return <CheckCircle size={20} color="#22C55E" />;
    return <Lightbulb size={20} color="#F59E0B" />;
  };

  const getBgColor = () => {
    if (insight.type === 'warning') return '#FEF2F2';
    if (insight.type === 'positive') return '#F0FDF4';
    return '#FFFBEB';
  };

  const getBorderColor = () => {
    if (insight.type === 'warning') return '#FECACA';
    if (insight.type === 'positive') return '#BBF7D0';
    return '#FDE68A';
  };

  return (
    <View style={{ backgroundColor: getBgColor(), borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: getBorderColor() }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ marginRight: 12, marginTop: 2 }}>{getIcon()}</View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 6 }}>{insight.title}</Text>
          <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>{insight.message}</Text>
        </View>
      </View>
    </View>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; bgColor: string }> = ({ icon, label, value, color, bgColor }) => (
  <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center' }}>
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
      {icon}
    </View>
    <Text style={{ fontSize: 20, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{label}</Text>
  </View>
);

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ onNavigateBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const healthSummary = await pcosInsightsService.analyzeHealthData();
      setSummary(healthSummary);
      const personalizedTips = await pcosInsightsService.getPersonalizedTips();
      setTips(personalizedTips);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return '#EF4444';
    if (risk === 'moderate') return '#F59E0B';
    return '#22C55E';
  };

  const getRiskLabel = (risk: string) => {
    if (risk === 'high') return 'Needs Attention';
    if (risk === 'moderate') return 'Monitor Closely';
    return 'Looking Good';
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return '#9CA3AF';
    if (score < 2.5) return '#EF4444';
    if (score < 3.5) return '#F59E0B';
    return '#22C55E';
  };

  const formatDuration = (mins: number) => {
    if (mins === 0) return '--';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#F9FAFB' }} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#EC4899']} />}
    >
      {/* Header */}
      <View style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          {onNavigateBack && (
            <TouchableOpacity onPress={onNavigateBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Smart Cycle Alert</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Your personalized PCOS insights</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <RefreshCw size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Risk Level Card */}
        {summary && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <TrendingUp size={24} color="white" />
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Weekly Status</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>{getRiskLabel(summary.riskLevel)}</Text>
            </View>
            <View style={{ backgroundColor: getRiskColor(summary.riskLevel), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>{summary.riskLevel.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ padding: 20, marginTop: -16 }}>
        {isLoading ? (
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={{ marginTop: 12, color: '#6B7280' }}>Analyzing your data...</Text>
          </View>
        ) : (
          <>
            {/* Stats Row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <StatCard
                icon={<Heart size={22} color="#EC4899" />}
                label="Avg Mood"
                value={summary?.moodAverage ? summary.moodAverage.toFixed(1) : '--'}
                color={getScoreColor(summary?.moodAverage || 0)}
                bgColor="#FDF2F8"
              />
              <StatCard
                icon={<Moon size={22} color="#6366F1" />}
                label="Sleep Quality"
                value={summary?.sleepAverage ? summary.sleepAverage.toFixed(1) : '--'}
                color={getScoreColor(summary?.sleepAverage || 0)}
                bgColor="#EEF2FF"
              />
              <StatCard
                icon={<Utensils size={22} color="#F59E0B" />}
                label="Avg Sleep"
                value={formatDuration(summary?.sleepDurationAvg || 0)}
                color={summary?.sleepDurationAvg && summary.sleepDurationAvg >= 420 ? '#22C55E' : '#F59E0B'}
                bgColor="#FEF3C7"
              />
            </View>

            {/* Insights Section */}
            {summary && summary.insights.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#1F2937', marginBottom: 14 }}>Your Insights</Text>
                {summary.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </View>
            )}

            {/* Personalized Tips */}
            {tips.length > 0 && (
              <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Lightbulb size={20} color="#8B5CF6" />
                  <Text style={{ fontSize: 17, fontWeight: '600', color: '#1F2937', marginLeft: 8 }}>Tips for You</Text>
                </View>
                {tips.map((tip, index) => (
                  <View key={index} style={{ flexDirection: 'row', marginBottom: 12, paddingLeft: 4 }}>
                    <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22 }}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Info Card */}
            <View style={{ backgroundColor: '#F3E8FF', borderRadius: 16, padding: 18, marginBottom: 32 }}>
              <Text style={{ fontSize: 14, color: '#6B21A8', lineHeight: 22 }}>
                💜 These insights are based on your last 7 days of tracking. The more you log, the better your personalized recommendations become!
              </Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};
