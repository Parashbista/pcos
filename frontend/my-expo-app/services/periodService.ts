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


// ============================================
// Cycle Irregularity Analysis Types & Functions
// ============================================

export interface IrregularityAlert {
  type: 'short_cycle' | 'long_cycle' | 'missed_period' | 'pcos_pattern' | 'improving' | 'lifestyle_impact';
  severity: 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  recommendation: string;
  data?: {
    cycleLength?: number;
    averageCycle?: number;
    irregularCount?: number;
  };
}

export interface CycleAnalysis {
  hasEnoughData: boolean;
  totalPeriods: number;
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  cycleVariation: number;
  irregularCycleCount: number;
  regularCycleCount: number;
  regularity: 'regular' | 'slightly_irregular' | 'irregular' | 'very_irregular';
  pcosPatternDetected: boolean;
  trend: 'improving' | 'worsening' | 'stable' | 'insufficient_data';
  alerts: IrregularityAlert[];
  lifestyleCorrelation?: {
    sleepImpact: string | null;
    supplementImpact: string | null;
  };
  aiRecommendation?: string;
  pcosInsight?: string;
}

export interface CycleDashboardStatus {
  hasAlert: boolean;
  alertMessage?: string;
  averageCycle: number;
  regularity: string;
  daysUntilNext?: number;
}

// Alert severity colors
export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  info: '#6366F1',
  warning: '#F59E0B',
  alert: '#EF4444',
};

// Regularity colors (extended)
export const REGULARITY_COLORS: Record<string, string> = {
  regular: '#22C55E',
  slightly_irregular: '#84CC16',
  irregular: '#F59E0B',
  very_irregular: '#EF4444',
};

// Trend icons
export const TREND_INFO: Record<string, { icon: string; color: string; label: string }> = {
  improving: { icon: '📈', color: '#22C55E', label: 'Improving' },
  worsening: { icon: '📉', color: '#EF4444', label: 'Worsening' },
  stable: { icon: '➡️', color: '#6B7280', label: 'Stable' },
  insufficient_data: { icon: '📊', color: '#9CA3AF', label: 'Need More Data' },
};

/**
 * Get cycle irregularity analysis with AI recommendations
 */
export const getCycleIrregularityAnalysis = async (): Promise<CycleAnalysis> => {
  const response = await api.get<{ success: boolean; data: CycleAnalysis }>(
    '/api/period/irregularity-analysis'
  );
  return response.data.data;
};

/**
 * Get cycle status for dashboard
 */
export const getCycleDashboardStatus = async (): Promise<CycleDashboardStatus> => {
  const response = await api.get<{ success: boolean; data: CycleDashboardStatus }>(
    '/api/period/dashboard-status'
  );
  return response.data.data;
};

/**
 * Get regularity label (extended)
 */
export const getRegularityLabel = (
  regularity: 'regular' | 'slightly_irregular' | 'irregular' | 'very_irregular'
): string => {
  switch (regularity) {
    case 'regular':
      return 'Regular';
    case 'slightly_irregular':
      return 'Slightly Irregular';
    case 'irregular':
      return 'Irregular';
    case 'very_irregular':
      return 'Very Irregular';
  }
};

/**
 * Check if cycle length is in normal range
 */
export const isCycleLengthNormal = (length: number): boolean => {
  return length >= 21 && length <= 35;
};

/**
 * Get cycle length status
 */
export const getCycleLengthStatus = (
  length: number
): { status: 'normal' | 'short' | 'long'; color: string } => {
  if (length < 21) {
    return { status: 'short', color: '#F59E0B' };
  } else if (length > 35) {
    return { status: 'long', color: '#EF4444' };
  }
  return { status: 'normal', color: '#22C55E' };
};
