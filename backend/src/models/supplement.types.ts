/**
 * Supplement and Diet Tracking Types for PCOS Management
 */

import { ObjectId } from 'mongodb';

// Common PCOS supplements
export type SupplementName =
  | 'vitamin_d'
  | 'inositol'
  | 'omega_3'
  | 'magnesium'
  | 'zinc'
  | 'vitamin_b12'
  | 'folate'
  | 'iron'
  | 'berberine'
  | 'spearmint'
  | 'probiotics'
  | 'coq10'
  | 'chromium'
  | 'n_acetyl_cysteine'
  | 'custom';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type IntakeInstruction = 'with_food' | 'empty_stomach' | 'with_fat' | 'any_time';

export interface Supplement {
  id: string;
  userId: string;
  name: SupplementName | string;
  customName?: string; // For custom supplements
  dosage: string; // e.g., "1000 IU", "500mg"
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  timeOfDay: string[]; // ["08:00", "20:00"]
  instruction: IntakeInstruction;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DietGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetMeals: MealType[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplementLog {
  id: string;
  odId: string;
  supplementId: string;
  supplementName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  taken: boolean;
  takenWithFood: boolean;
  notes?: string;
  createdAt: Date;
}

export interface DietLog {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  description: string;
  isHealthy: boolean;
  tags: string[]; // ['high_protein', 'low_sugar', 'processed', etc.]
  notes?: string;
  createdAt: Date;
}

export interface SupplementConsistency {
  supplementId: string;
  supplementName: string;
  totalDays: number;
  takenDays: number;
  missedDays: number;
  consistencyRate: number; // percentage
  streak: number; // current streak
  longestStreak: number;
}

export interface SupplementAlert {
  type: 'missed_dose' | 'low_consistency' | 'absorption_tip' | 'cycle_impact';
  severity: 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  recommendation: string;
  supplementName?: string;
}

export interface SupplementAnalysis {
  period: { start: string; end: string };
  overallConsistency: number;
  supplements: SupplementConsistency[];
  alerts: SupplementAlert[];
  cycleImpactInsight?: string;
  aiRecommendation?: string;
}

// Supplement info for AI context
export const SUPPLEMENT_INFO: Record<SupplementName, {
  label: string;
  pcosRelation: string;
  bestTaken: IntakeInstruction;
  absorptionTip: string;
}> = {
  vitamin_d: {
    label: 'Vitamin D',
    pcosRelation: 'Helps with insulin sensitivity and hormone regulation',
    bestTaken: 'with_fat',
    absorptionTip: 'Take with a meal containing healthy fats for better absorption',
  },
  inositol: {
    label: 'Inositol (Myo + D-Chiro)',
    pcosRelation: 'Improves insulin sensitivity and ovulation',
    bestTaken: 'empty_stomach',
    absorptionTip: 'Best taken on empty stomach, 30 minutes before meals',
  },
  omega_3: {
    label: 'Omega-3 Fish Oil',
    pcosRelation: 'Reduces inflammation and supports hormone balance',
    bestTaken: 'with_food',
    absorptionTip: 'Take with meals to reduce fishy aftertaste and improve absorption',
  },
  magnesium: {
    label: 'Magnesium',
    pcosRelation: 'Helps with sleep, stress, and insulin sensitivity',
    bestTaken: 'any_time',
    absorptionTip: 'Evening is best for sleep benefits. Avoid taking with calcium',
  },
  zinc: {
    label: 'Zinc',
    pcosRelation: 'Supports hormone production and reduces acne',
    bestTaken: 'with_food',
    absorptionTip: 'Take with food to prevent nausea. Avoid taking with iron',
  },
  vitamin_b12: {
    label: 'Vitamin B12',
    pcosRelation: 'Important if on Metformin, supports energy',
    bestTaken: 'any_time',
    absorptionTip: 'Sublingual forms absorb better. Can be taken any time',
  },
  folate: {
    label: 'Folate (Methylfolate)',
    pcosRelation: 'Supports fertility and reduces homocysteine',
    bestTaken: 'any_time',
    absorptionTip: 'Methylfolate is better absorbed than folic acid',
  },
  iron: {
    label: 'Iron',
    pcosRelation: 'Important for heavy periods, prevents anemia',
    bestTaken: 'empty_stomach',
    absorptionTip: 'Take with vitamin C for better absorption. Avoid with calcium',
  },
  berberine: {
    label: 'Berberine',
    pcosRelation: 'Natural alternative to Metformin for blood sugar',
    bestTaken: 'with_food',
    absorptionTip: 'Take with meals to reduce GI side effects',
  },
  spearmint: {
    label: 'Spearmint Tea/Extract',
    pcosRelation: 'May help reduce androgen levels and hirsutism',
    bestTaken: 'any_time',
    absorptionTip: '2 cups of tea daily or supplement form',
  },
  probiotics: {
    label: 'Probiotics',
    pcosRelation: 'Supports gut health and hormone metabolism',
    bestTaken: 'empty_stomach',
    absorptionTip: 'Best taken first thing in morning on empty stomach',
  },
  coq10: {
    label: 'CoQ10',
    pcosRelation: 'Supports egg quality and energy production',
    bestTaken: 'with_fat',
    absorptionTip: 'Take with fatty meal for better absorption',
  },
  chromium: {
    label: 'Chromium',
    pcosRelation: 'Helps with blood sugar regulation',
    bestTaken: 'with_food',
    absorptionTip: 'Take with meals for best results',
  },
  n_acetyl_cysteine: {
    label: 'NAC (N-Acetyl Cysteine)',
    pcosRelation: 'Antioxidant that may improve ovulation',
    bestTaken: 'empty_stomach',
    absorptionTip: 'Best absorbed on empty stomach',
  },
  custom: {
    label: 'Custom Supplement',
    pcosRelation: 'User-defined supplement',
    bestTaken: 'any_time',
    absorptionTip: 'Follow package instructions',
  },
};
