import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import MoodSelector from '../components/mood/MoodSelector';
import RecommendationCard from '../components/mood/RecommendationCard';
import FeedbackModal from '../components/mood/FeedbackModal';
import { 
  MoodLevel, 
  Recommendation,
  FeedbackType,
  getRecommendations,
  submitFeedback,
  MOOD_FACTORS,
  MoodFactor
} from '../services/moodService';
import { colors, spacing, fontSize } from '../constants/theme';

export default function MoodboardScreen() {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<MoodFactor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, FeedbackType>>({});
  
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    recommendation: Recommendation | null;
  }>({ visible: false, recommendation: null });

  const fetchRecommendations = useCallback(async (mood: MoodLevel) => {
    setLoading(true);
    try {
      const response = await getRecommendations(mood, selectedFactors);
      setRecommendations(response.recommendations);
      setMessage(response.message);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setMessage('Unable to get recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFactors]);

  const handleMoodSelect = (mood: MoodLevel) => {
    setSelectedMood(mood);
    setFeedbackGiven({});
    fetchRecommendations(mood);
  };

  const handleFactorToggle = (factor: MoodFactor) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleFeedback = async (recommendation: Recommendation, feedback: FeedbackType, comment?: string) => {
    if (!selectedMood) return;
    
    try {
      await submitFeedback({
        moodLevel: selectedMood,
        recommendationTitle: recommendation.title,
        recommendationType: recommendation.type,
        feedback,
        comment,
        moodFactors: selectedFactors,
      });
      
      setFeedbackGiven(prev => ({
        ...prev,
        [recommendation.title]: feedback,
      }));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleQuickFeedback = (recommendation: Recommendation, feedback: FeedbackType) => {
    if (feedback === 'improve') {
      setFeedbackModal({ visible: true, recommendation });
    } else {
      handleFeedback(recommendation, feedback);
    }
  };

  const handleModalSubmit = (feedback: FeedbackType, comment?: string) => {
    if (feedbackModal.recommendation) {
      handleFeedback(feedbackModal.recommendation, feedback, comment);
    }
    setFeedbackModal({ visible: false, recommendation: null });
  };

  const onRefresh = useCallback(async () => {
    if (!selectedMood) return;
    setRefreshing(true);
    await fetchRecommendations(selectedMood);
    setRefreshing(false);
  }, [selectedMood, fetchRecommendations]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MoodSelector 
          selectedMood={selectedMood} 
          onMoodSelect={handleMoodSelect}
          disabled={loading}
        />

        <View style={styles.factorsSection}>
          <Text style={styles.factorsTitle}>What's affecting your mood?</Text>
          <View style={styles.factorsRow}>
            {MOOD_FACTORS.slice(0, 6).map((factor) => (
              <TouchableOpacity
                key={factor.value}
                style={[
                  styles.factorChip,
                  selectedFactors.includes(factor.value) && styles.factorChipActive,
                ]}
                onPress={() => handleFactorToggle(factor.value)}
              >
                <Text style={styles.factorEmoji}>{factor.emoji}</Text>
                <Text style={[
                  styles.factorLabel,
                  selectedFactors.includes(factor.value) && styles.factorLabelActive,
                ]}>
                  {factor.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Getting personalized suggestions...</Text>
          </View>
        )}

        {!loading && recommendations.length > 0 && (
          <Animated.View entering={FadeIn} style={styles.recommendationsSection}>
            <Text style={styles.messageText}>{message}</Text>
            {recommendations.map((rec, index) => (
              <RecommendationCard
                key={`${rec.title}-${index}`}
                recommendation={rec}
                index={index}
                onFeedback={(feedback) => handleQuickFeedback(rec, feedback)}
                feedbackGiven={feedbackGiven[rec.title]}
              />
            ))}
          </Animated.View>
        )}

        {!loading && !selectedMood && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyTitle}>How are you feeling today?</Text>
            <Text style={styles.emptyText}>
              Select your mood above to get personalized wellness recommendations
            </Text>
          </View>
        )}
      </ScrollView>

      <FeedbackModal
        visible={feedbackModal.visible}
        recommendationTitle={feedbackModal.recommendation?.title || ''}
        onSubmit={handleModalSubmit}
        onClose={() => setFeedbackModal({ visible: false, recommendation: null })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  factorsSection: {
    marginBottom: spacing.lg,
  },
  factorsTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  factorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  factorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factorChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  factorEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  factorLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  factorLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recommendationsSection: {
    marginTop: spacing.md,
  },
  messageText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
