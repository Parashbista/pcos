/**
 * Symptom tracking types for PCOS management
 */

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type SymptomCategory = 'physical' | 'hormonal' | 'emotional' | 'digestive';

export type SymptomName =
  // Physical
  | 'cramps'
  | 'bloating'
  | 'headache'
  | 'fatigue'
  | 'back_pain'
  | 'breast_tenderness'
  // Hormonal
  | 'acne'
  | 'hair_loss'
  | 'excess_hair'
  | 'hot_flashes'
  | 'weight_changes'
  // Emotional
  | 'mood_swings'
  | 'anxiety'
  | 'depression'
  | 'irritability'
  | 'brain_fog'
  // Digestive
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
  date: string; // YYYY-MM-DD
  symptoms: SymptomItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSymptomEntryData {
  date: string;
  symptoms: SymptomItem[];
  notes?: string;
}

export interface UpdateSymptomEntryData {
  symptoms?: SymptomItem[];
  notes?: string;
}

export interface SymptomStats {
  totalEntries: number;
  mostCommonSymptoms: { name: SymptomName; count: number }[];
  severityDistribution: Record<SymptomSeverity, number>;
  categoryDistribution: Record<SymptomCategory, number>;
}
