/**
 * Feedback types for AI-powered mood recommendations
 */

export type FeedbackType = 'good' | 'bad' | 'improve';

export type RecommendationType = 'breathing' | 'exercise' | 'activity' | 'affirmation';

export interface RecommendationFeedback {
  id: string;
  userId: string;
  moodLevel: number;
  recommendationTitle: string;
  recommendationType: RecommendationType;
  feedback: FeedbackType;
  comment?: string;
  moodFactors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedbackData {
  moodLevel: number;
  recommendationTitle: string;
  recommendationType: RecommendationType;
  feedback: FeedbackType;
  comment?: string;
  moodFactors?: string[];
}

export interface FeedbackStats {
  totalFeedback: number;
  breakdown: {
    good: number;
    bad: number;
    improve: number;
  };
  byType: Record<RecommendationType, { good: number; bad: number; improve: number }>;
  topPreferences: RecommendationType[];
}

export interface FeedbackHistory {
  good: RecommendationFeedback[];
  bad: RecommendationFeedback[];
  improve: RecommendationFeedback[];
}
