import api from './api';

// Types
export type SymptomSeverity = 'mild' | 'moderate' | 'severe';
export type SymptomCategory = 'physical' | 'hormonal' | 'emotional' | 'digestive';

export type SymptomName =
  | 'cramps'
  | 'bloating'
  | 'headache'
  | 'fatigue'
  | 'back_pain'
  | 'breast_tenderness'
  | 'acne'
  | 'hair_loss'
  | 'excess_hair'
  | 'hot_flashes'
  | 'weight_changes'
  | 'mood_swings'
  | 'anxiety'
  | 'depression'
  | 'irritability'
  | 'brain_fog'
  | 'nausea'
  | 'cravings'
  | 'digestive_issues'
  | 'appetite_changes';

export interface SymptomItem {
  name: SymptomName;
  severity: SymptomSeverity;
  category: SymptomCategory;
}

export interface SymptomEntry {
  id: string;
  userId: string;
  date: string;
  symptoms: SymptomItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomRecommendation {
  type: 'lifestyle' | 'diet' | 'exercise' | 'supplement' | 'medical' | 'selfcare';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedSymptoms: string[];
}

export interface SymptomAnalysis {
  summary: string;
  recommendations: SymptomRecommendation[];
  pcosInsight: string;
  whenToSeeDoctor?: string;
}

export interface SymptomStats {
  totalEntries: number;
  mostCommonSymptoms: { name: SymptomName; count: number }[];
  severityDistribution: Record<SymptomSeverity, number>;
  categoryDistribution: Record<SymptomCategory, number>;
}

// Symptom definitions for UI
export const SYMPTOM_DEFINITIONS: {
  name: SymptomName;
  label: string;
  emoji: string;
  category: SymptomCategory;
}[] = [
  // Physical
  { name: 'cramps', label: 'Cramps', emoji: '⚡', category: 'physical' },
  { name: 'bloating', label: 'Bloating', emoji: '🎈', category: 'physical' },
  { name: 'headache', label: 'Headache', emoji: '🤕', category: 'physical' },
  { name: 'fatigue', label: 'Fatigue', emoji: '😴', category: 'physical' },
  { name: 'back_pain', label: 'Back Pain', emoji: '🔙', category: 'physical' },
  { name: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💗', category: 'physical' },
  // Hormonal
  { name: 'acne', label: 'Acne', emoji: '😣', category: 'hormonal' },
  { name: 'hair_loss', label: 'Hair Loss', emoji: '💇', category: 'hormonal' },
  { name: 'excess_hair', label: 'Excess Hair', emoji: '🧔', category: 'hormonal' },
  { name: 'hot_flashes', label: 'Hot Flashes', emoji: '🔥', category: 'hormonal' },
  { name: 'weight_changes', label: 'Weight Changes', emoji: '⚖️', category: 'hormonal' },
  // Emotional
  { name: 'mood_swings', label: 'Mood Swings', emoji: '🎭', category: 'emotional' },
  { name: 'anxiety', label: 'Anxiety', emoji: '😰', category: 'emotional' },
  { name: 'depression', label: 'Depression', emoji: '😢', category: 'emotional' },
  { name: 'irritability', label: 'Irritability', emoji: '😤', category: 'emotional' },
  { name: 'brain_fog', label: 'Brain Fog', emoji: '🌫️', category: 'emotional' },
  // Digestive
  { name: 'nausea', label: 'Nausea', emoji: '🤢', category: 'digestive' },
  { name: 'cravings', label: 'Cravings', emoji: '🍫', category: 'digestive' },
  { name: 'digestive_issues', label: 'Digestive Issues', emoji: '🤮', category: 'digestive' },
  { name: 'appetite_changes', label: 'Appetite Changes', emoji: '🍽️', category: 'digestive' },
];

// Category colors
export const CATEGORY_COLORS: Record<SymptomCategory, string> = {
  physical: '#3B82F6',
  hormonal: '#EC4899',
  emotional: '#8B5CF6',
  digestive: '#F59E0B',
};

// Severity colors
export const SEVERITY_COLORS: Record<SymptomSeverity, string> = {
  mild: '#22C55E',
  moderate: '#F59E0B',
  severe: '#EF4444',
};

// Priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
};

// Recommendation type icons
export const RECOMMENDATION_ICONS: Record<string, string> = {
  lifestyle: '🏠',
  diet: '🥗',
  exercise: '🏃',
  supplement: '💊',
  medical: '🏥',
  selfcare: '💆',
};

/**
 * Create or update symptom entry
 */
export const createSymptomEntry = async (data: {
  date: string;
  symptoms: SymptomItem[];
  notes?: string;
}): Promise<SymptomEntry> => {
  const response = await api.post<SymptomEntry>('/api/symptoms', data);
  return response.data;
};

/**
 * Get symptom entries for date range
 */
export const getSymptomEntries = async (
  startDate?: string,
  endDate?: string
): Promise<SymptomEntry[]> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get<SymptomEntry[]>('/api/symptoms', { params });
  return response.data;
};

/**
 * Get symptom entry by date
 */
export const getSymptomEntryByDate = async (date: string): Promise<SymptomEntry | null> => {
  try {
    const response = await api.get<SymptomEntry>(`/api/symptoms/date/${date}`);
    return response.data;
  } catch (error: any) {
    // Handle 404 - no entry for this date (this is expected, not an error)
    if (error.status === 404 || error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Delete symptom entry
 */
export const deleteSymptomEntry = async (id: string): Promise<void> => {
  await api.delete(`/api/symptoms/${id}`);
};

/**
 * Get symptom statistics
 */
export const getSymptomStats = async (days: number = 30): Promise<SymptomStats> => {
  const response = await api.get<SymptomStats>('/api/symptoms/stats', {
    params: { days },
  });
  return response.data;
};

/**
 * Get AI-powered recommendations based on symptoms
 */
export const getSymptomRecommendations = async (
  symptoms: SymptomItem[]
): Promise<SymptomAnalysis> => {
  const response = await api.post<{ success: boolean; data: SymptomAnalysis }>(
    '/api/symptoms/recommendations',
    { symptoms }
  );
  return response.data.data;
};

/**
 * Log symptoms and get AI recommendations in one call
 */
export const logSymptomsWithRecommendations = async (data: {
  date: string;
  symptoms: SymptomItem[];
  notes?: string;
}): Promise<{ entry: SymptomEntry; analysis: SymptomAnalysis }> => {
  const response = await api.post<{
    success: boolean;
    data: { entry: SymptomEntry; analysis: SymptomAnalysis };
  }>('/api/symptoms/log-with-recommendations', data);
  return response.data.data;
};

/**
 * Get quick tip for a symptom
 */
export const getSymptomTip = async (symptomName: SymptomName): Promise<string> => {
  const response = await api.get<{ success: boolean; data: { tip: string } }>(
    `/api/symptoms/tip/${symptomName}`
  );
  return response.data.data.tip;
};

/**
 * Get symptom definition by name
 */
export const getSymptomDefinition = (name: SymptomName) => {
  return SYMPTOM_DEFINITIONS.find((s) => s.name === name);
};

/**
 * Get symptoms by category
 */
export const getSymptomsByCategory = (category: SymptomCategory) => {
  return SYMPTOM_DEFINITIONS.filter((s) => s.category === category);
};
