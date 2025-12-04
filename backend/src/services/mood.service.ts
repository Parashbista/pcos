import { ObjectId } from 'mongodb';
import { getMoodEntriesCollection } from '../models/mood.model';
import {
  MoodEntry,
  CreateMoodEntryData,
  UpdateMoodEntryData,
  MoodStats,
  MoodLevel,
  EnergyLevel,
  MoodFactor,
} from '../models/mood.types';

/**
 * Create a new mood entry (or update if exists for that date)
 */
export const createMoodEntry = async (
  userId: string,
  data: CreateMoodEntryData
): Promise<MoodEntry> => {
  const collection = getMoodEntriesCollection();
  const now = new Date();

  const entryData = {
    userId,
    date: data.date,
    mood: data.mood,
    energy: data.energy,
    factors: data.factors || [],
    journalEntry: data.journalEntry || null,
    gratitude: data.gratitude || null,
    goals: data.goals || null,
    updatedAt: now,
  };

  const result = await collection.findOneAndUpdate(
    { userId, date: data.date },
    {
      $set: entryData,
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return mapDocToMoodEntry(result);
};

/**
 * Get mood entry by date
 */
export const getMoodEntryByDate = async (
  userId: string,
  date: string
): Promise<MoodEntry | null> => {
  const collection = getMoodEntriesCollection();
  const doc = await collection.findOne({ userId, date });

  if (!doc) return null;
  return mapDocToMoodEntry(doc);
};

/**
 * Get mood entries for a date range
 */
export const getMoodEntries = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<MoodEntry[]> => {
  const collection = getMoodEntriesCollection();
  const docs = await collection
    .find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
    .sort({ date: -1 })
    .toArray();

  return docs.map(mapDocToMoodEntry);
};

/**
 * Update a mood entry
 */
export const updateMoodEntry = async (
  userId: string,
  entryId: string,
  data: UpdateMoodEntryData
): Promise<MoodEntry | null> => {
  const collection = getMoodEntriesCollection();

  const updateData: any = { updatedAt: new Date() };

  if (data.mood !== undefined) updateData.mood = data.mood;
  if (data.energy !== undefined) updateData.energy = data.energy;
  if (data.factors !== undefined) updateData.factors = data.factors;
  if (data.journalEntry !== undefined) updateData.journalEntry = data.journalEntry;
  if (data.gratitude !== undefined) updateData.gratitude = data.gratitude;
  if (data.goals !== undefined) updateData.goals = data.goals;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(entryId), userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return mapDocToMoodEntry(result);
};

/**
 * Delete a mood entry
 */
export const deleteMoodEntry = async (
  userId: string,
  entryId: string
): Promise<boolean> => {
  const collection = getMoodEntriesCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(entryId),
    userId,
  });
  return result.deletedCount > 0;
};

/**
 * Get mood statistics for a date range
 */
export const getMoodStats = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<MoodStats> => {
  const collection = getMoodEntriesCollection();

  const entries = await collection
    .find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
    .toArray();

  if (entries.length === 0) {
    return {
      averageMood: 0,
      averageEnergy: 0,
      totalEntries: 0,
      moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      energyDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      factorFrequency: {} as Record<MoodFactor, number>,
      entriesWithJournal: 0,
    };
  }

  // Calculate averages
  const totalMood = entries.reduce((sum, e) => sum + e.mood, 0);
  const totalEnergy = entries.reduce((sum, e) => sum + e.energy, 0);

  // Calculate distributions
  const moodDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const energyDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const factorFrequency: Record<string, number> = {};
  let entriesWithJournal = 0;

  entries.forEach((entry) => {
    moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    energyDistribution[entry.energy] = (energyDistribution[entry.energy] || 0) + 1;

    if (entry.journalEntry) entriesWithJournal++;

    (entry.factors || []).forEach((factor: string) => {
      factorFrequency[factor] = (factorFrequency[factor] || 0) + 1;
    });
  });

  return {
    averageMood: parseFloat((totalMood / entries.length).toFixed(1)),
    averageEnergy: parseFloat((totalEnergy / entries.length).toFixed(1)),
    totalEntries: entries.length,
    moodDistribution: moodDistribution as Record<MoodLevel, number>,
    energyDistribution: energyDistribution as Record<EnergyLevel, number>,
    factorFrequency: factorFrequency as Record<MoodFactor, number>,
    entriesWithJournal,
  };
};

/**
 * Map MongoDB document to MoodEntry
 */
const mapDocToMoodEntry = (doc: any): MoodEntry => ({
  id: doc._id.toString(),
  userId: doc.userId,
  date: doc.date,
  mood: doc.mood,
  energy: doc.energy,
  factors: doc.factors || [],
  journalEntry: doc.journalEntry,
  gratitude: doc.gratitude,
  goals: doc.goals,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
