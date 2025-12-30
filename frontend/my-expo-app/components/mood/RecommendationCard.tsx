import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { 
  Recommendation, 
  FeedbackType, 
  RECOMMENDATION_ICONS,
  FEEDBACK_OPTIONS 
} from '../../services/moodService';
import { colors, spacing, fontSize } from '../../constants/theme';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  onFeedback: (feedback: FeedbackType) => void;
  feedbackGiven?: FeedbackType | null;
}

export default function RecommendationCard({ 
  recommendation, 
  index, 
  onFeedback,
  feedbackGiven 
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const icon = RECOMMENDATION_ICONS[recommendation.type] || '🎯';

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.card}
    >
      <TouchableOpacity 
        style={styles.header}
        onPress={() => recommendation.steps && setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{recommendation.title}</Text>
          <Text style={styles.description}>{recommendation.description}</Text>
          {recommendation.duration && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.duration}>{recommendation.duration}</Text>
              <Text style={styles.type}>• {recommendation.type}</Text>
            </View>
          )}
        </View>
        {recommendation.steps && (
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={colors.textMuted} 
          />
        )}
      </TouchableOpacity>

      {expanded && recommendation.steps && (
        <Animated.View entering={FadeInUp.springify()} style={styles.stepsContainer}>
          {recommendation.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      <View style={styles.feedbackRow}>
        <Text style={styles.feedbackLabel}>Was this helpful?</Text>
        <View style={styles.feedbackButtons}>
          {FEEDBACK_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.feedbackButton,
                feedbackGiven === option.value && styles.feedbackButtonActive,
              ]}
              onPress={() => onFeedback(option.value)}
              disabled={!!feedbackGiven}
            >
              <Text style={styles.feedbackEmoji}>{option.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  duration: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  type: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  stepsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  stepText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feedbackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackButtonActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  feedbackEmoji: {
    fontSize: 18,
  },
});
