import api from './api';

// Types
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
  customName?: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  timeOfDay: string[];
  instruction: IntakeInstruction;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementLog {
  id: string;
  odId: string;
  supplementId: string;
  supplementName: string;
  date: string;
  time: string;
  taken: boolean;
  takenWithFood: boolean;
  notes?: string;
  createdAt: string;
}

export interface DietGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetMeals: MealType[];
  isActive: boolean;
}

export interface DietLog {
  id: string;
  userId: string;
  date: string;
  mealType: MealType;
  description: string;
  isHealthy: boolean;
  tags: string[];
  notes?: string;
}

export interface SupplementConsistency {
  supplementId: string;
  supplementName: string;
  totalDays: number;
  takenDays: number;
  missedDays: number;
  consistencyRate: number;
  streak: number;
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

export interface TodayStatus {
  total: number;
  taken: number;
  pending: number;
  supplements: { name: string; taken: boolean; time: string }[];
}

// Supplement definitions for UI
export const SUPPLEMENT_OPTIONS: {
  name: SupplementName;
  label: string;
  emoji: string;
  pcosRelation: string;
}[] = [
  { name: 'vitamin_d', label: 'Vitamin D', emoji: '☀️', pcosRelation: 'Insulin sensitivity & hormones' },
  { name: 'inositol', label: 'Inositol', emoji: '💊', pcosRelation: 'Ovulation & insulin' },
  { name: 'omega_3', label: 'Omega-3', emoji: '🐟', pcosRelation: 'Inflammation & hormones' },
  { name: 'magnesium', label: 'Magnesium', emoji: '✨', pcosRelation: 'Sleep & stress' },
  { name: 'zinc', label: 'Zinc', emoji: '🔬', pcosRelation: 'Hormones & acne' },
  { name: 'vitamin_b12', label: 'Vitamin B12', emoji: '🔴', pcosRelation: 'Energy & Metformin support' },
  { name: 'folate', label: 'Folate', emoji: '🌿', pcosRelation: 'Fertility support' },
  { name: 'iron', label: 'Iron', emoji: '💪', pcosRelation: 'Heavy periods & energy' },
  { name: 'berberine', label: 'Berberine', emoji: '🌱', pcosRelation: 'Blood sugar control' },
  { name: 'spearmint', label: 'Spearmint', emoji: '🍃', pcosRelation: 'Androgen reduction' },
  { name: 'probiotics', label: 'Probiotics', emoji: '🦠', pcosRelation: 'Gut health' },
  { name: 'coq10', label: 'CoQ10', emoji: '⚡', pcosRelation: 'Egg quality' },
  { name: 'chromium', label: 'Chromium', emoji: '🎯', pcosRelation: 'Blood sugar' },
  { name: 'n_acetyl_cysteine', label: 'NAC', emoji: '🛡️', pcosRelation: 'Antioxidant & ovulation' },
  { name: 'custom', label: 'Custom', emoji: '➕', pcosRelation: 'Your supplement' },
];

export const INSTRUCTION_LABELS: Record<IntakeInstruction, string> = {
  with_food: 'Take with food',
  empty_stomach: 'Take on empty stomach',
  with_fat: 'Take with fatty meal',
  any_time: 'Take any time',
};

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Once daily',
  twice_daily: 'Twice daily',
  weekly: 'Weekly',
  as_needed: 'As needed',
};

// Alert colors
export const ALERT_COLORS: Record<string, string> = {
  info: '#6366F1',
  warning: '#F59E0B',
  alert: '#EF4444',
};

// ============================================
// API Functions
// ============================================

/**
 * Create a new supplement
 */
export const createSupplement = async (data: {
  name: SupplementName | string;
  customName?: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  instruction: IntakeInstruction;
  notes?: string;
}): Promise<Supplement> => {
  const response = await api.post<{ success: boolean; data: Supplement }>(
    '/api/supplements',
    data
  );
  return response.data.data;
};

/**
 * Get user's supplements
 */
export const getSupplements = async (activeOnly = false): Promise<Supplement[]> => {
  const response = await api.get<{ success: boolean; data: Supplement[] }>(
    '/api/supplements',
    { params: { active: activeOnly } }
  );
  return response.data.data;
};

/**
 * Update a supplement
 */
export const updateSupplement = async (
  id: string,
  data: Partial<Supplement>
): Promise<Supplement> => {
  const response = await api.put<{ success: boolean; data: Supplement }>(
    `/api/supplements/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Delete a supplement
 */
export const deleteSupplement = async (id: string): Promise<void> => {
  await api.delete(`/api/supplements/${id}`);
};

/**
 * Log supplement intake
 */
export const logSupplementIntake = async (data: {
  supplementId: string;
  supplementName: string;
  date: string;
  time?: string;
  taken: boolean;
  takenWithFood?: boolean;
  notes?: string;
}): Promise<SupplementLog> => {
  const response = await api.post<{ success: boolean; data: SupplementLog }>(
    '/api/supplements/log',
    data
  );
  return response.data.data;
};

/**
 * Get supplement logs
 */
export const getSupplementLogs = async (
  startDate: string,
  endDate: string,
  supplementId?: string
): Promise<SupplementLog[]> => {
  const params: any = { startDate, endDate };
  if (supplementId) params.supplementId = supplementId;

  const response = await api.get<{ success: boolean; data: SupplementLog[] }>(
    '/api/supplements/logs',
    { params }
  );
  return response.data.data;
};

/**
 * Get today's supplement status
 */
export const getTodayStatus = async (): Promise<TodayStatus> => {
  const response = await api.get<{ success: boolean; data: TodayStatus }>(
    '/api/supplements/today'
  );
  return response.data.data;
};

/**
 * Get supplement analysis
 */
export const getSupplementAnalysis = async (): Promise<SupplementAnalysis> => {
  const response = await api.get<{ success: boolean; data: SupplementAnalysis }>(
    '/api/supplements/analysis'
  );
  return response.data.data;
};

/**
 * Get absorption tip for a supplement
 */
export const getAbsorptionTip = async (supplementName: SupplementName): Promise<string> => {
  const response = await api.get<{ success: boolean; data: { tip: string } }>(
    `/api/supplements/tip/${supplementName}`
  );
  return response.data.data.tip;
};

// ============================================
// Diet Functions
// ============================================

/**
 * Create diet goal
 */
export const createDietGoal = async (data: {
  name: string;
  description?: string;
  targetMeals: MealType[];
}): Promise<DietGoal> => {
  const response = await api.post<{ success: boolean; data: DietGoal }>(
    '/api/supplements/diet-goals',
    data
  );
  return response.data.data;
};

/**
 * Get diet goals
 */
export const getDietGoals = async (): Promise<DietGoal[]> => {
  const response = await api.get<{ success: boolean; data: DietGoal[] }>(
    '/api/supplements/diet-goals'
  );
  return response.data.data;
};

/**
 * Log diet/meal
 */
export const logDiet = async (data: {
  date: string;
  mealType: MealType;
  description: string;
  isHealthy?: boolean;
  tags?: string[];
  notes?: string;
}): Promise<DietLog> => {
  const response = await api.post<{ success: boolean; data: DietLog }>(
    '/api/supplements/diet-log',
    data
  );
  return response.data.data;
};

/**
 * Get diet logs
 */
export const getDietLogs = async (
  startDate: string,
  endDate: string
): Promise<DietLog[]> => {
  const response = await api.get<{ success: boolean; data: DietLog[] }>(
    '/api/supplements/diet-logs',
    { params: { startDate, endDate } }
  );
  return response.data.data;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get supplement option by name
 */
export const getSupplementOption = (name: SupplementName | string) => {
  return SUPPLEMENT_OPTIONS.find((s) => s.name === name);
};

/**
 * Format consistency percentage with color
 */
export const getConsistencyColor = (rate: number): string => {
  if (rate >= 80) return '#22C55E';
  if (rate >= 60) return '#F59E0B';
  return '#EF4444';
};
