import api from './api';

// Types
export type PeriodSymptom =
  | 'cramps'
  | 'bloating'
  | 'headache'
  | 'fatigue'
  | 'mood_swings'
  | 'breast_tenderness'
  | 'acne'
  | 'back_pain'
  | 'nausea'
  | 'cravings';

export type FlowIntensity = 'light' | 'medium' | 'heavy';

export interface PeriodEntry {
  id: string;
  userId: string;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodLength?: number;
  flowIntensity?: FlowIntensity;
  symptoms: PeriodSymptom[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodSettings {
  id: string;
  userId: string;
  notifyDaysBefore: number;
  notificationsEnabled: boolean;
  averageCycleLength: number;
}

export interface PeriodStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  shortestCycle: number;
  longestCycle: number;
  totalPeriods: number;
  cycleRegularity: 'regular' | 'irregular' | 'very_irregular';
  nextPredictedDate: string | null;
  daysUntilNext: number | null;
  symptomFrequency: Record<PeriodSymptom, number>;
}

export interface PeriodPrediction {
  predictedStartDate: string;
  daysUntil: number;
  confidence: 'high' | 'medium' | 'low';
  basedOnCycles: number;
}

export interface CreatePeriodEntryData {
  startDate: string;
  endDate?: string;
  flowIntensity?: FlowIntensity;
  symptoms?: PeriodSymptom[];
  notes?: string;
}

// Symptom options
export const PERIOD_SYMPTOMS: { value: PeriodSymptom; label: string; emoji: string }[] = [
  { value: 'cramps', label: 'Cramps', emoji: '😣' },
  { value: 'bloating', label: 'Bloating', emoji: '🎈' },
  { value: 'headache', label: 'Headache', emoji: '🤕' },
  { value: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { value: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { value: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💔' },
  { value: 'acne', label: 'Acne', emoji: '😖' },
  { value: 'back_pain', label: 'Back Pain', emoji: '🔙' },
  { value: 'nausea', label: 'Nausea', emoji: '🤢' },
  { value: 'cravings', label: 'Cravings', emoji: '🍫' },
];

// Flow intensity options
export const FLOW_OPTIONS: { value: FlowIntensity; label: string; color: string }[] = [
  { value: 'light', label: 'Light', color: '#FCA5A5' },
  { value: 'medium', label: 'Medium', color: '#EF4444' },
  { value: 'heavy', label: 'Heavy', color: '#991B1B' },
];

/**
 * Create period entry
 */
export const createPeriodEntry = async (data: CreatePeriodEntryData): Promise<PeriodEntry> => {
  const response = await api.post<PeriodEntry>('/api/period/entries', data);
  return response.data;
};

/**
 * Get period entries
 */
export const getPeriodEntries = async (limit: number = 12): Promise<PeriodEntry[]> => {
  const response = await api.get<PeriodEntry[]>('/api/period/entries', {
    params: { limit },
  });
  return response.data;
};

/**
 * Update period entry
 */
export const updatePeriodEntry = async (
  id: string,
  data: Partial<CreatePeriodEntryData>
): Promise<PeriodEntry> => {
  const response = await api.put<PeriodEntry>(`/api/period/entries/${id}`, data);
  return response.data;
};

/**
 * Delete period entry
 */
export const deletePeriodEntry = async (id: string): Promise<void> => {
  await api.delete(`/api/period/entries/${id}`);
};

/**
 * Get period settings
 */
export const getPeriodSettings = async (): Promise<PeriodSettings> => {
  const response = await api.get<PeriodSettings>('/api/period/settings');
  return response.data;
};

/**
 * Update period settings
 */
export const updatePeriodSettings = async (
  data: Partial<PeriodSettings>
): Promise<PeriodSettings> => {
  const response = await api.put<PeriodSettings>('/api/period/settings', data);
  return response.data;
};

/**
 * Get period statistics
 */
export const getPeriodStats = async (): Promise<PeriodStats> => {
  const response = await api.get<PeriodStats>('/api/period/stats');
  return response.data;
};

/**
 * Get period prediction
 */
export const getPeriodPrediction = async (): Promise<PeriodPrediction | null> => {
  const response = await api.get<PeriodPrediction | null>('/api/period/prediction');
  return response.data;
};

/**
 * Format date for display
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Get regularity label and color
 */
export const getRegularityInfo = (
  regularity: 'regular' | 'irregular' | 'very_irregular'
): { label: string; color: string } => {
  switch (regularity) {
    case 'regular':
      return { label: 'Regular', color: '#22C55E' };
    case 'irregular':
      return { label: 'Irregular', color: '#F59E0B' };
    case 'very_irregular':
      return { label: 'Very Irregular', color: '#EF4444' };
  }
};
