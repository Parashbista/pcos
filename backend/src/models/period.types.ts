/**
 * Period Tracker types for PCOS management
 */

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
  cycleLength?: number; // Days since last period start
  periodLength?: number; // Duration of this period
  flowIntensity?: FlowIntensity;
  symptoms: PeriodSymptom[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePeriodEntryData {
  startDate: string;
  endDate?: string;
  flowIntensity?: FlowIntensity;
  symptoms?: PeriodSymptom[];
  notes?: string;
}

export interface UpdatePeriodEntryData {
  startDate?: string;
  endDate?: string;
  flowIntensity?: FlowIntensity;
  symptoms?: PeriodSymptom[];
  notes?: string;
}

export interface PeriodSettings {
  id: string;
  userId: string;
  notifyDaysBefore: number; // 1, 2, or 3 days before
  notificationsEnabled: boolean;
  averageCycleLength: number; // User can override calculated average
  createdAt: Date;
  updatedAt: Date;
}

export interface SetPeriodSettingsData {
  notifyDaysBefore?: number;
  notificationsEnabled?: boolean;
  averageCycleLength?: number;
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
