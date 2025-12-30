import api from './api';

// Types
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type MoodFactor =
  | 'hormonal'
  | 'poor_sleep'
  | 'stress'
  | 'work'
  | 'relationship'
  | 'diet'
  | 'exercise'
  | 'weather'
  | 'social'
  | 'health'
  | 'medication';

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  factors: MoodFactor[];
  journalEntry?: string;
  gratitude?: string;
  goals?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoodEntryData {
  date: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  factors?: MoodFactor[];
  journalEntry?: string;
  gratitude?: string;
  goals?: string;
}

export interface MoodStats {
  averageMood: number;
  averageEnergy: number;
  totalEntries: number;
  moodDistribution: Record<MoodLevel, number>;
  energyDistribution: Record<EnergyLevel, number>;
  factorFrequency: Record<MoodFactor, number>;
  entriesWithJournal: number;
}

// Mood emojis and labels
export const MOOD_OPTIONS: { value: MoodLevel; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: '😭', label: 'Very Low', color: '#EF4444' },
  { value: 2, emoji: '🥹', label: 'Low', color: '#F97316' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#EAB308' },
  { value: 4, emoji: '💅', label: 'Good', color: '#22C55E' },
  { value: 5, emoji: '💃', label: 'Great', color: '#10B981' },
];

export const ENERGY_OPTIONS: { value: EnergyLevel; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: '🪫', label: 'Exhausted', color: '#EF4444' },
  { value: 2, emoji: '😴', label: 'Tired', color: '#F97316' },
  { value: 3, emoji: '⚡', label: 'Normal', color: '#EAB308' },
  { value: 4, emoji: '💪', label: 'Energetic', color: '#22C55E' },
  { value: 5, emoji: '🔥', label: 'Super', color: '#10B981' },
];

export const MOOD_FACTORS: { value: MoodFactor; label: string; emoji: string }[] = [
  { value: 'hormonal', label: 'Hormonal', emoji: '🩸' },
  { value: 'poor_sleep', label: 'Poor Sleep', emoji: '😴' },
  { value: 'stress', label: 'Stress', emoji: '😰' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'relationship', label: 'Relationship', emoji: '💕' },
  { value: 'diet', label: 'Diet', emoji: '🍽️' },
  { value: 'exercise', label: 'Exercise', emoji: '🏃' },
  { value: 'weather', label: 'Weather', emoji: '🌤️' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'medication', label: 'Medication', emoji: '💊' },
];

/**
 * Create or update mood entry
 */
export const createMoodEntry = async (data: CreateMoodEntryData): Promise<MoodEntry> => {
  const response = await api.post<{ success: boolean; data: MoodEntry }>('/api/mood/entries', data);
  return response.data.data;
};

/**
 * Get mood entry by date
 */
export const getMoodEntryByDate = async (date: string): Promise<MoodEntry | null> => {
  try {
    const response = await api.get<{ success: boolean; data: MoodEntry }>(`/api/mood/entries/${date}`);
    return response.data.data;
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
};

/**
 * Get mood entries for date range
 */
export const getMoodEntries = async (startDate: string, endDate: string): Promise<MoodEntry[]> => {
  const response = await api.get<{ success: boolean; data: MoodEntry[] }>('/api/mood/entries', {
    params: { startDate, endDate },
  });
  return response.data.data;
};

/**
 * Delete mood entry
 */
export const deleteMoodEntry = async (id: string): Promise<void> => {
  await api.delete(`/api/mood/entries/${id}`);
};

/**
 * Get mood statistics
 */
export const getMoodStats = async (startDate: string, endDate: string): Promise<MoodStats> => {
  const response = await api.get<{ success: boolean; data: MoodStats }>('/api/mood/stats', {
    params: { startDate, endDate },
  });
  return response.data.data;
};

/**
 * Get mood emoji by level
 */
export const getMoodEmoji = (mood: MoodLevel): string => {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji || '😐';
};

/**
 * Get energy emoji by level
 */
export const getEnergyEmoji = (energy: EnergyLevel): string => {
  return ENERGY_OPTIONS.find((e) => e.value === energy)?.emoji || '⚡';
};

/**
 * Get mood color by level
 */
export const getMoodColor = (mood: MoodLevel): string => {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.color || '#6B7280';
};

// ============================================
// AI-Powered Recommendations & Feedback
// ============================================

export type RecommendationType = 'breathing' | 'exercise' | 'activity' | 'affirmation';
export type FeedbackType = 'good' | 'bad' | 'improve';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  duration?: string;
  steps?: string[];
}

export interface MoodRecommendationResponse {
  mood: number;
  moodLabel: string;
  message: string;
  recommendations: Recommendation[];
  aiGenerated: boolean;
}

export interface FeedbackData {
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

/**
 * Get AI-powered recommendations based on mood
 */
export const getRecommendations = async (
  mood: number,
  factors: string[] = []
): Promise<MoodRecommendationResponse> => {
  const response = await api.post<{ success: boolean; data: MoodRecommendationResponse }>(
    '/api/mood/recommendations',
    { mood, factors }
  );
  return response.data.data;
};

/**
 * Submit feedback for a recommendation
 */
export const submitFeedback = async (feedbackData: FeedbackData): Promise<void> => {
  await api.post('/api/mood/feedback', feedbackData);
};

/**
 * Get user's feedback statistics
 */
export const getFeedbackStats = async (): Promise<FeedbackStats> => {
  const response = await api.get<{ success: boolean; data: FeedbackStats }>(
    '/api/mood/feedback-stats'
  );
  return response.data.data;
};

// Recommendation type icons
export const RECOMMENDATION_ICONS: Record<RecommendationType, string> = {
  breathing: '🫁',
  exercise: '🏃',
  activity: '🎯',
  affirmation: '💭',
};

// Feedback options
export const FEEDBACK_OPTIONS: { value: FeedbackType; emoji: string; label: string }[] = [
  { value: 'good', emoji: '👍', label: 'Good' },
  { value: 'bad', emoji: '👎', label: 'Bad' },
  { value: 'improve', emoji: '💡', label: 'Improve' },
];

// ============================================
// AI Quote Functions
// ============================================

export interface MoodQuote {
  quote: string;
  author: string;
  mood: number;
  generatedAt: string;
}

export interface MoodEntryWithQuote extends MoodEntry {
  quote?: MoodQuote;
}

export interface TodayQuoteResponse {
  quote: MoodQuote;
  mood: number | null;
  hasEntry: boolean;
}

/**
 * Create mood entry and get AI quote
 */
export const createMoodEntryWithQuote = async (
  data: CreateMoodEntryData
): Promise<MoodEntryWithQuote> => {
  const response = await api.post<{ success: boolean; data: MoodEntryWithQuote }>(
    '/api/mood/entries',
    data
  );
  return response.data.data;
};

/**
 * Get motivational quote based on mood
 */
export const getMotivationalQuote = async (
  mood: number,
  factors: string[] = []
): Promise<MoodQuote> => {
  const response = await api.post<{ success: boolean; data: MoodQuote }>('/api/mood/quote', {
    mood,
    factors,
  });
  return response.data.data;
};

/**
 * Submit feedback for a quote
 */
export const submitQuoteFeedback = async (
  quote: string,
  helpful: boolean,
  mood?: number
): Promise<void> => {
  await api.post('/api/mood/quote-feedback', { quote, helpful, mood });
};

/**
 * Get today's quote for dashboard
 */
export const getTodayQuote = async (): Promise<TodayQuoteResponse> => {
  const response = await api.get<{ success: boolean; data: TodayQuoteResponse }>(
    '/api/mood/today-quote'
  );
  return response.data.data;
};
