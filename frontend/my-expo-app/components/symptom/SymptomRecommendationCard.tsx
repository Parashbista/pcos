import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import {
  SymptomRecommendation,
  RECOMMENDATION_ICONS,
  PRIORITY_COLORS,
  getSymptomDefinition,
} from '../../services/symptomService';

interface SymptomRecommendationCardProps {
  recommendation: SymptomRecommendation;
  index: number;
}

export default function SymptomRecommendationCard({
  recommendation,
  index,
}: SymptomRecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityColor = PRIORITY_COLORS[recommendation.priority];
  const icon = RECOMMENDATION_ICONS[recommendation.type] || '💡';

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Helpful Tip';
      default:
        return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lifestyle':
        return 'Lifestyle';
      case 'diet':
        return 'Diet';
      case 'exercise':
        return 'Exercise';
      case 'supplement':
        return 'Supplement';
      case 'medical':
        return 'Medical';
      case 'selfcare':
        return 'Self-Care';
      default:
        return type;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Priority indicator bar */}
      <View
        style={{
          height: 4,
          backgroundColor: priorityColor,
        }}
      />

      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: priorityColor + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 22 }}>{icon}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View
                style={{
                  backgroundColor: priorityColor + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: priorityColor }}>
                  {getPriorityLabel(recommendation.priority)}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                {getTypeLabel(recommendation.type)}
              </Text>
            </View>

            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>
              {recommendation.title}
            </Text>
          </View>

          <View style={{ padding: 4 }}>
            {expanded ? (
              <ChevronUp size={20} color="#9CA3AF" />
            ) : (
              <ChevronDown size={20} color="#9CA3AF" />
            )}
          </View>
        </View>

        {/* Expanded content */}
        {expanded && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22 }}>
              {recommendation.description}
            </Text>

            {/* Related symptoms */}
            {recommendation.relatedSymptoms && recommendation.relatedSymptoms.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>
                  Related to:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {recommendation.relatedSymptoms.map((symptomName, idx) => {
                    const symptom = getSymptomDefinition(symptomName as any);
                    return (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: '#F3F4F6',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 12, marginRight: 4 }}>
                          {symptom?.emoji || '•'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {symptom?.label || symptomName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
