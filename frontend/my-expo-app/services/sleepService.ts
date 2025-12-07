import api from './api';

// Types
export type SleepFactor =
  | 'stress'
  | 'caffeine'
  | 'screen_time'
  | 'exercise'
  | 'late_meal'
  | 'alcohol'
  | 'medication'
  | 'pain'
  | 'anxiety';

export interface SleepEntry {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: 1 | 2 | 3 | 4 | 5;
  factors: SleepFactor[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepGoal {
  id: string;
  userId: string;
  targetBedtime: string;
  targetWakeTime: string;
  targetDuration: number;
  isActive: boolean;
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  averageBedtime: string;
  averageWakeTime: string;
  totalEntries: number;
  goalAchievementRate: number;
  factorFrequency: Record<SleepFactor, number>;
}

export interface CreateSleepEntryData {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: 1 | 2 | 3 | 4 | 5;
  factors?: SleepFactor[];
  notes?: string;
}

export interface SetSleepGoalData {
  targetBedtime: string;
  targetWakeTime: string;
}

// Sleep factor labels for UI
export const SLEEP_FACTORS: { value: SleepFactor; label: string; emoji: string }[] = [
  { value: 'stress', label: 'Stress', emoji: '😰' },
  { value: 'caffeine', label: 'Caffeine', emoji: '☕' },
  { value: 'screen_time', label: 'Screen Time', emoji: '📱' },
  { value: 'exercise', label: 'Exercise', emoji: '🏃' },
  { value: 'late_meal', label: 'Late Meal', emoji: '🍽️' },
  { value: 'alcohol', label: 'Alcohol', emoji: '🍷' },
  { value: 'medication', label: 'Medication', emoji: '💊' },
  { value: 'pain', label: 'Pain', emoji: '🤕' },
  { value: 'anxiety', label: 'Anxiety', emoji: '😟' },
];

/**
 * Create or update sleep entry
 */
export const createSleepEntry = async (data: CreateSleepEntryData): Promise<SleepEntry> => {
  const response = await api.post<SleepEntry>('/api/sleep/entries', data);
  return response.data;
};

/**
 * Get sleep entry by date
 */
export const getSleepEntryByDate = async (date: string): Promise<SleepEntry | null> => {
  try {
    const response = await api.get<SleepEntry>(`/api/sleep/entries/${date}`);
    return response.data;
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
};

/**
 * Get sleep entries for date range
 */
export const getSleepEntries = async (startDate: string, endDate: string): Promise<SleepEntry[]> => {
  const response = await api.get<SleepEntry[]>('/api/sleep/entries', {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Delete sleep entry
 */
export const deleteSleepEntry = async (id: string): Promise<void> => {
  await api.delete(`/api/sleep/entries/${id}`);
};

/**
 * Set sleep goal
 */
export const setSleepGoal = async (data: SetSleepGoalData): Promise<SleepGoal> => {
  const response = await api.post<SleepGoal>('/api/sleep/goal', data);
  return response.data;
};

/**
 * Get current sleep goal
 */
export const getSleepGoal = async (): Promise<SleepGoal | null> => {
  const response = await api.get<SleepGoal | null>('/api/sleep/goal');
  return response.data;
};

/**
 * Get sleep statistics
 */
export const getSleepStats = async (startDate: string, endDate: string): Promise<SleepStats> => {
  const response = await api.get<SleepStats>('/api/sleep/stats', {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Get quality label
 */
export const getQualityLabel = (quality: number): string => {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  return labels[quality] || '';
};

/**
 * Get quality color
 */
export const getQualityColor = (quality: number): string => {
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];
  return colors[quality] || '#6B7280';
};
