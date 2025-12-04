/**
 * Sleep tracking types for PCOS management
 */

export interface SleepEntry {
  id: string;
  userId: string;
  date: Date;
  bedtime: Date;
  wakeTime: Date;
  duration: number; // in minutes
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 star rating
  factors: SleepFactor[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface SleepGoal {
  id: string;
  userId: string;
  targetBedtime: string; // HH:mm format
  targetWakeTime: string; // HH:mm format
  targetDuration: number; // in minutes (default 480 = 8 hours)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSleepEntryData {
  date: string; // ISO date string
  bedtime: string; // ISO datetime string
  wakeTime: string; // ISO datetime string
  quality: 1 | 2 | 3 | 4 | 5;
  factors?: SleepFactor[];
  notes?: string;
}

export interface UpdateSleepEntryData {
  bedtime?: string;
  wakeTime?: string;
  quality?: 1 | 2 | 3 | 4 | 5;
  factors?: SleepFactor[];
  notes?: string;
}

export interface SetSleepGoalData {
  targetBedtime: string; // HH:mm format
  targetWakeTime: string; // HH:mm format
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  averageBedtime: string;
  averageWakeTime: string;
  totalEntries: number;
  goalAchievementRate: number; // percentage
  factorFrequency: Record<SleepFactor, number>;
}
