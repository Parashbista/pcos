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
  const response = await api.post<MoodEntry>('/api/mood/entries', data);
  return response.data;
};

/**
 * Get mood entry by date
 */
export const getMoodEntryByDate = async (date: string): Promise<MoodEntry | null> => {
  try {
    const response = await api.get<MoodEntry>(`/api/mood/entries/${date}`);
    return response.data;
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
};

/**
 * Get mood entries for date range
 */
export const getMoodEntries = async (startDate: string, endDate: string): Promise<MoodEntry[]> => {
  const response = await api.get<MoodEntry[]>('/api/mood/entries', {
    params: { startDate, endDate },
  });
  return response.data;
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
  const response = await api.get<MoodStats>('/api/mood/stats', {
    params: { startDate, endDate },
  });
  return response.data;
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
