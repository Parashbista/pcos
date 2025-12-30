/**
 * Symptom Recommendation Service
 * AI-powered recommendations based on user's PCOS symptoms
 */

import { getAIService } from './ai.service';
import { SymptomItem, SymptomName, SymptomSeverity, SymptomCategory } from '../models/symptom.types';

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

// Symptom info for AI context
const SYMPTOM_INFO: Record<SymptomName, { label: string; pcosRelation: string }> = {
  cramps: { label: 'Cramps', pcosRelation: 'Common during periods, may indicate hormonal imbalance' },
  bloating: { label: 'Bloating', pcosRelation: 'Often related to insulin resistance and digestive issues in PCOS' },
  headache: { label: 'Headache', pcosRelation: 'Can be triggered by hormonal fluctuations' },
  fatigue: { label: 'Fatigue', pcosRelation: 'Common in PCOS due to insulin resistance and sleep issues' },
  back_pain: { label: 'Back Pain', pcosRelation: 'May accompany menstrual symptoms' },
  breast_tenderness: { label: 'Breast Tenderness', pcosRelation: 'Related to hormonal changes' },
  acne: { label: 'Acne', pcosRelation: 'Caused by elevated androgens in PCOS' },
  hair_loss: { label: 'Hair Loss', pcosRelation: 'Androgenic alopecia common in PCOS' },
  excess_hair: { label: 'Excess Hair Growth', pcosRelation: 'Hirsutism due to high androgens' },
  hot_flashes: { label: 'Hot Flashes', pcosRelation: 'Hormonal imbalance symptom' },
  weight_changes: { label: 'Weight Changes', pcosRelation: 'Insulin resistance makes weight management difficult' },
  mood_swings: { label: 'Mood Swings', pcosRelation: 'Hormonal fluctuations affect mood' },
  anxiety: { label: 'Anxiety', pcosRelation: 'Higher rates of anxiety in PCOS patients' },
  depression: { label: 'Depression', pcosRelation: 'Linked to hormonal imbalances and PCOS challenges' },
  irritability: { label: 'Irritability', pcosRelation: 'Common with hormonal changes' },
  brain_fog: { label: 'Brain Fog', pcosRelation: 'May be related to insulin resistance and inflammation' },
  nausea: { label: 'Nausea', pcosRelation: 'Can occur with hormonal fluctuations' },
  cravings: { label: 'Cravings', pcosRelation: 'Often related to insulin resistance and blood sugar issues' },
  digestive_issues: { label: 'Digestive Issues', pcosRelation: 'Gut health often affected in PCOS' },
  appetite_changes: { label: 'Appetite Changes', pcosRelation: 'Hormonal influence on hunger signals' },
};

/**
 * Get AI-powered recommendations based on symptoms
 */
export async function getSymptomRecommendations(
  symptoms: SymptomItem[],
  recentSymptomHistory?: { date: string; symptoms: SymptomItem[] }[]
): Promise<SymptomAnalysis> {
  if (symptoms.length === 0) {
    return {
      summary: 'No symptoms logged today. Keep tracking to identify patterns!',
      recommendations: [],
      pcosInsight: 'Regular symptom tracking helps you and your healthcare provider understand your PCOS patterns better.',
    };
  }

  try {
    const aiService = getAIService();

    // Build symptom context
    const symptomDetails = symptoms.map(s => {
      const info = SYMPTOM_INFO[s.name];
      return `- ${info?.label || s.name} (${s.severity}, ${s.category}): ${info?.pcosRelation || 'PCOS-related symptom'}`;
    }).join('\n');

    // Analyze severity distribution
    const severeCounts = symptoms.filter(s => s.severity === 'severe').length;
    const moderateCounts = symptoms.filter(s => s.severity === 'moderate').length;

    // Build history context if available
    let historyContext = '';
    if (recentSymptomHistory && recentSymptomHistory.length > 0) {
      const recentSymptoms = recentSymptomHistory.slice(0, 7);
      const frequentSymptoms: Record<string, number> = {};
      recentSymptoms.forEach(entry => {
        entry.symptoms.forEach(s => {
          frequentSymptoms[s.name] = (frequentSymptoms[s.name] || 0) + 1;
        });
      });
      const topRecurring = Object.entries(frequentSymptoms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${SYMPTOM_INFO[name as SymptomName]?.label || name} (${count} days)`)
        .join(', ');
      
      if (topRecurring) {
        historyContext = `\nRecurring symptoms this week: ${topRecurring}`;
      }
    }

    const prompt = `You are a women's health expert specializing in PCOS (Polycystic Ovary Syndrome).

A user has logged the following symptoms today:
${symptomDetails}

Severity summary: ${severeCounts} severe, ${moderateCounts} moderate, ${symptoms.length - severeCounts - moderateCounts} mild symptoms.
${historyContext}

Based on these symptoms, provide personalized recommendations. Consider:
1. The combination of symptoms and their PCOS connection
2. Practical lifestyle, diet, and self-care suggestions
3. When symptoms might warrant medical attention

Return ONLY valid JSON in this exact format:
{
  "summary": "Brief empathetic summary of their symptoms (1-2 sentences)",
  "recommendations": [
    {
      "type": "lifestyle|diet|exercise|supplement|medical|selfcare",
      "title": "Short actionable title",
      "description": "Detailed but concise recommendation (2-3 sentences)",
      "priority": "high|medium|low",
      "relatedSymptoms": ["symptom1", "symptom2"]
    }
  ],
  "pcosInsight": "How these symptoms relate to PCOS and what they might indicate (2-3 sentences)",
  "whenToSeeDoctor": "Only include if severe symptoms warrant medical attention, otherwise omit this field"
}

Generate 3-5 recommendations prioritized by relevance to their symptoms.`;

    const result = await aiService.generateJSON<SymptomAnalysis>(prompt);

    if (result.success && result.data) {
      return result.data;
    }

    return getFallbackRecommendations(symptoms);
  } catch (error) {
    console.error('Error generating symptom recommendations:', error);
    return getFallbackRecommendations(symptoms);
  }
}

/**
 * Fallback recommendations when AI fails
 */
function getFallbackRecommendations(symptoms: SymptomItem[]): SymptomAnalysis {
  const recommendations: SymptomRecommendation[] = [];
  const symptomNames = symptoms.map(s => s.name);
  const hasSevere = symptoms.some(s => s.severity === 'severe');

  // Physical symptoms
  if (symptomNames.includes('fatigue') || symptomNames.includes('brain_fog')) {
    recommendations.push({
      type: 'lifestyle',
      title: 'Prioritize Quality Sleep',
      description: 'Aim for 7-9 hours of sleep. Poor sleep worsens fatigue and brain fog. Try a consistent sleep schedule and limit screens before bed.',
      priority: 'high',
      relatedSymptoms: ['fatigue', 'brain_fog'],
    });
  }

  if (symptomNames.includes('bloating') || symptomNames.includes('digestive_issues')) {
    recommendations.push({
      type: 'diet',
      title: 'Anti-Inflammatory Diet',
      description: 'Reduce processed foods, dairy, and gluten which can worsen bloating. Focus on whole foods, vegetables, and lean proteins.',
      priority: 'high',
      relatedSymptoms: ['bloating', 'digestive_issues'],
    });
  }

  if (symptomNames.includes('cramps') || symptomNames.includes('back_pain')) {
    recommendations.push({
      type: 'selfcare',
      title: 'Heat Therapy & Gentle Movement',
      description: 'Apply a heating pad to ease cramps. Gentle yoga or walking can help reduce pain and improve blood flow.',
      priority: 'medium',
      relatedSymptoms: ['cramps', 'back_pain'],
    });
  }

  // Hormonal symptoms
  if (symptomNames.includes('acne') || symptomNames.includes('excess_hair')) {
    recommendations.push({
      type: 'lifestyle',
      title: 'Manage Androgen Levels',
      description: 'Spearmint tea may help reduce androgens naturally. Consider discussing anti-androgen treatments with your doctor.',
      priority: 'medium',
      relatedSymptoms: ['acne', 'excess_hair'],
    });
  }

  if (symptomNames.includes('weight_changes') || symptomNames.includes('cravings')) {
    recommendations.push({
      type: 'diet',
      title: 'Balance Blood Sugar',
      description: 'Eat protein with every meal to stabilize blood sugar. Avoid refined carbs and sugary snacks that spike insulin.',
      priority: 'high',
      relatedSymptoms: ['weight_changes', 'cravings'],
    });
  }

  // Emotional symptoms
  if (symptomNames.includes('anxiety') || symptomNames.includes('mood_swings') || symptomNames.includes('depression')) {
    recommendations.push({
      type: 'selfcare',
      title: 'Stress Management',
      description: 'Practice deep breathing or meditation for 10 minutes daily. Regular exercise also helps regulate mood and reduce anxiety.',
      priority: 'high',
      relatedSymptoms: ['anxiety', 'mood_swings', 'depression'],
    });
  }

  // Default recommendation if none matched
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'lifestyle',
      title: 'Track Your Patterns',
      description: 'Continue logging symptoms daily to identify triggers and patterns. This information is valuable for managing PCOS.',
      priority: 'medium',
      relatedSymptoms: symptomNames,
    });
  }

  return {
    summary: `You've logged ${symptoms.length} symptom${symptoms.length > 1 ? 's' : ''} today. Here are some suggestions to help you feel better.`,
    recommendations,
    pcosInsight: 'These symptoms are common in PCOS and often interconnected through hormonal imbalances and insulin resistance. Managing one symptom often helps improve others.',
    whenToSeeDoctor: hasSevere ? 'You have severe symptoms today. If they persist or worsen, please consult your healthcare provider.' : undefined,
  };
}

/**
 * Get quick tips based on a single symptom
 */
export function getQuickTip(symptomName: SymptomName): string {
  const tips: Record<SymptomName, string> = {
    cramps: '💡 Try a warm compress and gentle stretching to ease cramps.',
    bloating: '💡 Drink peppermint tea and avoid carbonated drinks.',
    headache: '💡 Stay hydrated and rest in a dark, quiet room.',
    fatigue: '💡 Take a short 20-minute power nap or go for a brief walk.',
    back_pain: '💡 Apply heat and do gentle lower back stretches.',
    breast_tenderness: '💡 Wear a supportive bra and reduce caffeine intake.',
    acne: '💡 Keep skin clean and avoid touching your face.',
    hair_loss: '💡 Be gentle when brushing and consider biotin supplements.',
    excess_hair: '💡 Spearmint tea may help reduce excess hair growth.',
    hot_flashes: '💡 Dress in layers and keep a fan nearby.',
    weight_changes: '💡 Focus on protein-rich meals to stabilize blood sugar.',
    mood_swings: '💡 Practice deep breathing when emotions feel intense.',
    anxiety: '💡 Try the 4-7-8 breathing technique to calm your mind.',
    depression: '💡 Reach out to someone you trust or take a short walk outside.',
    irritability: '💡 Take a break and do something you enjoy for 10 minutes.',
    brain_fog: '💡 Stay hydrated and take short breaks during tasks.',
    nausea: '💡 Sip ginger tea and eat small, bland meals.',
    cravings: '💡 Eat protein to stabilize blood sugar and reduce cravings.',
    digestive_issues: '💡 Eat slowly and consider a probiotic supplement.',
    appetite_changes: '💡 Eat regular small meals even if not hungry.',
  };

  return tips[symptomName] || '💡 Track this symptom to identify patterns over time.';
}
