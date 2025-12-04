/**
 * Mood & Motivation Journal types for PCOS management
 */

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
  createdAt: Date;
  updatedAt: Date;
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

export interface UpdateMoodEntryData {
  mood?: MoodLevel;
  energy?: EnergyLevel;
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
