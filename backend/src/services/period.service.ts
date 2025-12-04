import { ObjectId } from 'mongodb';
import { getPeriodEntriesCollection, getPeriodSettingsCollection } from '../models/period.model';
import {
  PeriodEntry,
  PeriodSettings,
  CreatePeriodEntryData,
  UpdatePeriodEntryData,
  SetPeriodSettingsData,
  PeriodStats,
  PeriodPrediction,
  PeriodSymptom,
} from '../models/period.types';

/**
 * Create a new period entry
 */
export const createPeriodEntry = async (
  userId: string,
  data: CreatePeriodEntryData
): Promise<PeriodEntry> => {
  const collection = getPeriodEntriesCollection();
  const now = new Date();

  // Calculate cycle length from previous period
  const previousPeriod = await collection
    .find({ userId, startDate: { $lt: data.startDate } })
    .sort({ startDate: -1 })
    .limit(1)
    .toArray();

  let cycleLength: number | undefined;
  if (previousPeriod.length > 0) {
    const prevStart = new Date(previousPeriod[0].startDate);
    const currentStart = new Date(data.startDate);
    cycleLength = Math.round((currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate period length if end date provided
  let periodLength: number | undefined;
  if (data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    periodLength = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const entryData = {
    userId,
    startDate: data.startDate,
    endDate: data.endDate || null,
    cycleLength,
    periodLength,
    flowIntensity: data.flowIntensity || null,
    symptoms: data.symptoms || [],
    notes: data.notes || null,
    updatedAt: now,
  };

  const result = await collection.findOneAndUpdate(
    { userId, startDate: data.startDate },
    {
      $set: entryData,
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return mapDocToPeriodEntry(result);
};

/**
 * Get all period entries for a user
 */
export const getPeriodEntries = async (
  userId: string,
  limit: number = 12
): Promise<PeriodEntry[]> => {
  const collection = getPeriodEntriesCollection();
  const docs = await collection
    .find({ userId })
    .sort({ startDate: -1 })
    .limit(limit)
    .toArray();

  return docs.map(mapDocToPeriodEntry);
};

/**
 * Get period entry by ID
 */
export const getPeriodEntryById = async (
  userId: string,
  entryId: string
): Promise<PeriodEntry | null> => {
  const collection = getPeriodEntriesCollection();
  const doc = await collection.findOne({ _id: new ObjectId(entryId), userId });

  if (!doc) return null;
  return mapDocToPeriodEntry(doc);
};

/**
 * Update a period entry
 */
export const updatePeriodEntry = async (
  userId: string,
  entryId: string,
  data: UpdatePeriodEntryData
): Promise<PeriodEntry | null> => {
  const collection = getPeriodEntriesCollection();

  const updateData: any = { updatedAt: new Date() };

  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;
  if (data.flowIntensity !== undefined) updateData.flowIntensity = data.flowIntensity;
  if (data.symptoms !== undefined) updateData.symptoms = data.symptoms;
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Recalculate period length if dates changed
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    updateData.periodLength = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(entryId), userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return mapDocToPeriodEntry(result);
};

/**
 * Delete a period entry
 */
export const deletePeriodEntry = async (
  userId: string,
  entryId: string
): Promise<boolean> => {
  const collection = getPeriodEntriesCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(entryId),
    userId,
  });
  return result.deletedCount > 0;
};

/**
 * Get or create period settings
 */
export const getPeriodSettings = async (userId: string): Promise<PeriodSettings> => {
  const collection = getPeriodSettingsCollection();
  let doc = await collection.findOne({ userId });

  if (!doc) {
    // Create default settings
    const now = new Date();
    const defaultSettings = {
      userId,
      notifyDaysBefore: 2,
      notificationsEnabled: true,
      averageCycleLength: 28,
      createdAt: now,
      updatedAt: now,
    };
    await collection.insertOne(defaultSettings);
    doc = await collection.findOne({ userId });
  }

  return mapDocToPeriodSettings(doc!);
};

/**
 * Update period settings
 */
export const updatePeriodSettings = async (
  userId: string,
  data: SetPeriodSettingsData
): Promise<PeriodSettings> => {
  const collection = getPeriodSettingsCollection();

  const updateData: any = { updatedAt: new Date() };

  if (data.notifyDaysBefore !== undefined) updateData.notifyDaysBefore = data.notifyDaysBefore;
  if (data.notificationsEnabled !== undefined) updateData.notificationsEnabled = data.notificationsEnabled;
  if (data.averageCycleLength !== undefined) updateData.averageCycleLength = data.averageCycleLength;

  await collection.updateOne(
    { userId },
    { $set: updateData },
    { upsert: true }
  );

  return getPeriodSettings(userId);
};


/**
 * Get period statistics and prediction
 */
export const getPeriodStats = async (userId: string): Promise<PeriodStats> => {
  const collection = getPeriodEntriesCollection();
  const entries = await collection
    .find({ userId })
    .sort({ startDate: -1 })
    .toArray();

  if (entries.length === 0) {
    return {
      averageCycleLength: 0,
      averagePeriodLength: 0,
      shortestCycle: 0,
      longestCycle: 0,
      totalPeriods: 0,
      cycleRegularity: 'irregular',
      nextPredictedDate: null,
      daysUntilNext: null,
      symptomFrequency: {} as Record<PeriodSymptom, number>,
    };
  }

  // Calculate cycle statistics
  const cycleLengths = entries
    .filter((e) => e.cycleLength && e.cycleLength > 0)
    .map((e) => e.cycleLength as number);

  const periodLengths = entries
    .filter((e) => e.periodLength && e.periodLength > 0)
    .map((e) => e.periodLength as number);

  const avgCycleLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  const avgPeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0;
  const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0;

  // Determine regularity
  let cycleRegularity: 'regular' | 'irregular' | 'very_irregular' = 'regular';
  if (cycleLengths.length >= 3) {
    const variance = longestCycle - shortestCycle;
    if (variance > 14) {
      cycleRegularity = 'very_irregular';
    } else if (variance > 7) {
      cycleRegularity = 'irregular';
    }
  }

  // Calculate next predicted date
  let nextPredictedDate: string | null = null;
  let daysUntilNext: number | null = null;

  if (entries.length > 0) {
    const lastPeriodStart = new Date(entries[0].startDate);
    const predictedNext = new Date(lastPeriodStart);
    predictedNext.setDate(predictedNext.getDate() + avgCycleLength);
    
    nextPredictedDate = predictedNext.toISOString().split('T')[0];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysUntilNext = Math.round((predictedNext.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate symptom frequency
  const symptomFrequency: Record<string, number> = {};
  entries.forEach((entry) => {
    (entry.symptoms || []).forEach((symptom: string) => {
      symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
    });
  });

  return {
    averageCycleLength: avgCycleLength,
    averagePeriodLength: avgPeriodLength,
    shortestCycle,
    longestCycle,
    totalPeriods: entries.length,
    cycleRegularity,
    nextPredictedDate,
    daysUntilNext,
    symptomFrequency: symptomFrequency as Record<PeriodSymptom, number>,
  };
};

/**
 * Get period prediction
 */
export const getPeriodPrediction = async (userId: string): Promise<PeriodPrediction | null> => {
  const stats = await getPeriodStats(userId);

  if (!stats.nextPredictedDate || stats.totalPeriods === 0) {
    return null;
  }

  // Determine confidence based on data and regularity
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (stats.totalPeriods >= 6 && stats.cycleRegularity === 'regular') {
    confidence = 'high';
  } else if (stats.totalPeriods >= 3) {
    confidence = stats.cycleRegularity === 'regular' ? 'high' : 'medium';
  }

  return {
    predictedStartDate: stats.nextPredictedDate,
    daysUntil: stats.daysUntilNext || 0,
    confidence,
    basedOnCycles: stats.totalPeriods,
  };
};

/**
 * Map MongoDB document to PeriodEntry
 */
const mapDocToPeriodEntry = (doc: any): PeriodEntry => ({
  id: doc._id.toString(),
  userId: doc.userId,
  startDate: doc.startDate,
  endDate: doc.endDate,
  cycleLength: doc.cycleLength,
  periodLength: doc.periodLength,
  flowIntensity: doc.flowIntensity,
  symptoms: doc.symptoms || [],
  notes: doc.notes,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/**
 * Map MongoDB document to PeriodSettings
 */
const mapDocToPeriodSettings = (doc: any): PeriodSettings => ({
  id: doc._id.toString(),
  userId: doc.userId,
  notifyDaysBefore: doc.notifyDaysBefore,
  notificationsEnabled: doc.notificationsEnabled,
  averageCycleLength: doc.averageCycleLength,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
