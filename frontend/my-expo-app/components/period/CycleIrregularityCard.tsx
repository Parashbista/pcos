import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Info, ChevronDown, Sparkles } from 'lucide-react-native';
import {
  CycleAnalysis,
  IrregularityAlert,
  ALERT_SEVERITY_COLORS,
  REGULARITY_COLORS,
  TREND_INFO,
  getRegularityLabel,
} from '../../services/periodService';

interface CycleIrregularityCardProps {
  analysis: CycleAnalysis | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export default function CycleIrregularityCard({
  analysis,
  isLoading,
  onRefresh,
}: CycleIrregularityCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={{ color: '#6B7280', marginTop: 12 }}>Analyzing your cycles...</Text>
      </View>
    );
  }

  if (!analysis) return null;

  const regularityColor = REGULARITY_COLORS[analysis.regularity] || '#6B7280';
  const trendInfo = TREND_INFO[analysis.trend];

  const renderAlert = (alert: IrregularityAlert, index: number) => {
    const severityColor = ALERT_SEVERITY_COLORS[alert.severity];
    const bgColor =
      alert.severity === 'alert'
        ? '#FEF2F2'
        : alert.severity === 'warning'
        ? '#FFFBEB'
        : '#EEF2FF';
    const borderColor =
      alert.severity === 'alert'
        ? '#FECACA'
        : alert.severity === 'warning'
        ? '#FDE68A'
        : '#C7D2FE';

    return (
      <View
        key={index}
        style={{
          backgroundColor: bgColor,
          borderRadius: 12,
          padding: 12,
          marginBottom: 8,
          borderLeftWidth: 4,
          borderLeftColor: severityColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {alert.severity === 'alert' || alert.severity === 'warning' ? (
            <AlertTriangle size={16} color={severityColor} />
          ) : alert.type === 'improving' ? (
            <TrendingUp size={16} color={severityColor} />
          ) : (
            <Info size={16} color={severityColor} />
          )}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#1F2937',
              marginLeft: 6,
              flex: 1,
            }}
          >
            {alert.title}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: '#4B5563', lineHeight: 18, marginBottom: 6 }}>
          {alert.message}
        </Text>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: borderColor,
          }}
        >
          <Text style={{ fontSize: 11, color: '#6B7280', lineHeight: 16 }}>
            💡 {alert.recommendation}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: analysis.pcosPatternDetected ? '#FEF2F2' : '#FDF2F8',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🌸</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              Cycle Analysis
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <View
                style={{
                  backgroundColor: regularityColor + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: regularityColor }}>
                  {getRegularityLabel(analysis.regularity)}
                </Text>
              </View>
              {analysis.pcosPatternDetected && (
                <View
                  style={{
                    backgroundColor: '#FEE2E2',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#DC2626' }}>
                    PCOS Pattern
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <ChevronDown
          size={20}
          color="#9CA3AF"
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {/* Summary Stats */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingBottom: 16,
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
            {analysis.averageCycleLength}
          </Text>
          <Text style={{ fontSize: 11, color: '#6B7280' }}>Avg Days</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#F9FAFB',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
            {analysis.shortestCycle}-{analysis.longestCycle}
          </Text>
          <Text style={{ fontSize: 11, color: '#6B7280' }}>Range</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: trendInfo.color + '15',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16 }}>{trendInfo.icon}</Text>
          <Text style={{ fontSize: 11, color: trendInfo.color, fontWeight: '500' }}>
            {trendInfo.label}
          </Text>
        </View>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {/* Alerts */}
          {analysis.alerts.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              {analysis.alerts.map((alert, index) => renderAlert(alert, index))}
            </View>
          )}

          {/* Lifestyle Correlation */}
          {analysis.lifestyleCorrelation &&
            (analysis.lifestyleCorrelation.sleepImpact ||
              analysis.lifestyleCorrelation.supplementImpact) && (
              <View
                style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: '#166534', marginBottom: 8 }}
                >
                  🔗 Lifestyle Factors
                </Text>
                {analysis.lifestyleCorrelation.sleepImpact && (
                  <Text style={{ fontSize: 12, color: '#15803D', lineHeight: 18, marginBottom: 4 }}>
                    😴 {analysis.lifestyleCorrelation.sleepImpact}
                  </Text>
                )}
                {analysis.lifestyleCorrelation.supplementImpact && (
                  <Text style={{ fontSize: 12, color: '#15803D', lineHeight: 18 }}>
                    💊 {analysis.lifestyleCorrelation.supplementImpact}
                  </Text>
                )}
              </View>
            )}

          {/* AI Recommendation */}
          {analysis.aiRecommendation && (
            <View
              style={{
                backgroundColor: '#FDF4FF',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#F5D0FE',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Sparkles size={16} color="#A855F7" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#7C3AED', marginLeft: 6 }}>
                  AI Recommendation
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B21A8', lineHeight: 18 }}>
                {analysis.aiRecommendation}
              </Text>
            </View>
          )}

          {/* PCOS Insight */}
          {analysis.pcosInsight && (
            <View
              style={{
                backgroundColor: '#FFF7ED',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#FED7AA',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>🌸</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#C2410C' }}>
                  PCOS Insight
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#9A3412', lineHeight: 18 }}>
                {analysis.pcosInsight}
              </Text>
            </View>
          )}

          {/* Stats Detail */}
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Periods Tracked</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1F2937' }}>
                {analysis.totalPeriods}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}
            >
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Regular Cycles</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#22C55E' }}>
                {analysis.regularCycleCount}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}
            >
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Irregular Cycles</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444' }}>
                {analysis.irregularCycleCount}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
