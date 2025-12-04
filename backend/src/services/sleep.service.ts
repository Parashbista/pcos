import { ObjectId } from 'mongodb';
import { getSleepEntriesCollection, getSleepGoalsCollection } from '../models/sleep.model';
import {
  SleepEntry,
  SleepGoal,
  CreateSleepEntryData,
  UpdateSleepEntryData,
  SetSleepGoalData,
  SleepStats,
  SleepFactor,
} from '../models/sleep.types';

/**
 * Calculate sleep duration in minutes
 */
const calculateDuration = (bedtime: Date, wakeTime: Date): number => {
  const diff = wakeTime.getTime() - bedtime.getTime();
  return Math.round(diff / (1000 * 60));
};

/**
 * Create a new sleep entry (or update if exists for that date)
 */
export const createSleepEntry = async (
  userId: string,
  data: CreateSleepEntryData
): Promise<SleepEntry> => {
  const collection = getSleepEntriesCollection();
  const bedtime = new Date(data.bedtime);
  const wakeTime = new Date(data.wakeTime);
  const duration = calculateDuration(bedtime, wakeTime);
  const now = new Date();

  const entryData = {
    userId,
    date: data.date,
    bedtime,
    wakeTime,
    duration,
    quality: data.quality,
    factors: data.factors || [],
    notes: data.notes || null,
    updatedAt: now,
  };

  // Upsert - update if exists, insert if not
  const result = await collection.findOneAndUpdate(
    { userId, date: data.date },
    { 
      $set: entryData,
      $setOnInsert: { createdAt: now }
    },
    { upsert: true, returnDocument: 'after' }
  );

  return mapDocToSleepEntry(result);
};

/**
 * Get sleep entry by date
 */
export const getSleepEntryByDate = async (
  userId: string,
  date: string
): Promise<SleepEntry | null> => {
  const collection = getSleepEntriesCollection();
  const doc = await collection.findOne({ userId, date });

  if (!doc) return null;
  return mapDocToSleepEntry(doc);
};

/**
 * Get sleep entries for a date range
 */
export const getSleepEntries = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<SleepEntry[]> => {
  const collection = getSleepEntriesCollection();
  const docs = await collection
    .find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    })
    .sort({ date: -1 })
    .toArray();

  return docs.map(mapDocToSleepEntry);
};

/**
 * Update a sleep entry
 */
export const updateSleepEntry = async (
  userId: string,
  entryId: string,
  data: UpdateSleepEntryData
): Promise<SleepEntry | null> => {
  const collection = getSleepEntriesCollection();
  
  const updateData: any = { updatedAt: new Date() };
  
  if (data.bedtime && data.wakeTime) {
    const bedtime = new Date(data.bedtime);
    const wakeTime = new Date(data.wakeTime);
    updateData.bedtime = bedtime;
    updateData.wakeTime = wakeTime;
    updateData.duration = calculateDuration(bedtime, wakeTime);
  }
  if (data.quality !== undefined) updateData.quality = data.quality;
  if (data.factors !== undefined) updateData.factors = data.factors;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(entryId), userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return mapDocToSleepEntry(result);
};

/**
 * Delete a sleep entry
 */
export const deleteSleepEntry = async (
  userId: string,
  entryId: string
): Promise<boolean> => {
  const collection = getSleepEntriesCollection();
  const result = await collection.deleteOne({ 
    _id: new ObjectId(entryId), 
    userId 
  });
  return result.deletedCount > 0;
};

/**
 * Set or update sleep goal
 */
export const setSleepGoal = async (
  userId: string,
  data: SetSleepGoalData
): Promise<SleepGoal> => {
  const collection = getSleepGoalsCollection();
  
  // Calculate target duration from times
  const [bedHour, bedMin] = data.targetBedtime.split(':').map(Number);
  const [wakeHour, wakeMin] = data.targetWakeTime.split(':').map(Number);
  
  let targetDuration = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
  if (targetDuration < 0) targetDuration += 24 * 60; // Handle overnight sleep

  const now = new Date();

  // Deactivate existing goals
  await collection.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false, updatedAt: now } }
  );

  // Create new goal
  const goalData = {
    userId,
    targetBedtime: data.targetBedtime,
    targetWakeTime: data.targetWakeTime,
    targetDuration,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(goalData);
  
  return {
    id: result.insertedId.toString(),
    ...goalData,
  };
};

/**
 * Get active sleep goal
 */
export const getSleepGoal = async (userId: string): Promise<SleepGoal | null> => {
  const collection = getSleepGoalsCollection();
  const doc = await collection.findOne({ userId, isActive: true });

  if (!doc) return null;
  return mapDocToSleepGoal(doc);
};


/**
 * Get sleep statistics for a date range
 */
export const getSleepStats = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<SleepStats> => {
  const collection = getSleepEntriesCollection();
  
  // Get all entries in range
  const entries = await collection
    .find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    })
    .toArray();

  if (entries.length === 0) {
    return {
      averageDuration: 0,
      averageQuality: 0,
      averageBedtime: '00:00',
      averageWakeTime: '00:00',
      totalEntries: 0,
      goalAchievementRate: 0,
      factorFrequency: {} as Record<SleepFactor, number>,
    };
  }

  // Calculate averages
  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalQuality = entries.reduce((sum, e) => sum + e.quality, 0);
  
  // Calculate average times
  let totalBedtimeMins = 0;
  let totalWakeMins = 0;
  
  entries.forEach(entry => {
    const bedtime = new Date(entry.bedtime);
    const wakeTime = new Date(entry.wakeTime);
    
    let bedMins = bedtime.getHours() * 60 + bedtime.getMinutes();
    // Adjust for times after midnight (treat as previous day evening)
    if (bedMins < 12 * 60) bedMins += 24 * 60;
    
    totalBedtimeMins += bedMins;
    totalWakeMins += wakeTime.getHours() * 60 + wakeTime.getMinutes();
  });

  const avgBedtimeMins = totalBedtimeMins / entries.length;
  const avgWakeMins = totalWakeMins / entries.length;

  // Format time helper
  const formatTime = (mins: number): string => {
    const normalizedMins = mins % (24 * 60);
    const hours = Math.floor(normalizedMins / 60) % 24;
    const minutes = Math.round(normalizedMins % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate factor frequency
  const factorFrequency: Record<string, number> = {};
  entries.forEach(entry => {
    (entry.factors || []).forEach((factor: string) => {
      factorFrequency[factor] = (factorFrequency[factor] || 0) + 1;
    });
  });

  // Calculate goal achievement rate
  const goal = await getSleepGoal(userId);
  let goalAchievementRate = 0;
  
  if (goal) {
    const achieved = entries.filter(e => e.duration >= goal.targetDuration * 0.9).length;
    goalAchievementRate = Math.round((achieved / entries.length) * 100);
  }

  return {
    averageDuration: Math.round(totalDuration / entries.length),
    averageQuality: parseFloat((totalQuality / entries.length).toFixed(1)),
    averageBedtime: formatTime(avgBedtimeMins),
    averageWakeTime: formatTime(avgWakeMins),
    totalEntries: entries.length,
    goalAchievementRate,
    factorFrequency: factorFrequency as Record<SleepFactor, number>,
  };
};

/**
 * Map MongoDB document to SleepEntry
 */
const mapDocToSleepEntry = (doc: any): SleepEntry => ({
  id: doc._id.toString(),
  userId: doc.userId,
  date: doc.date,
  bedtime: doc.bedtime,
  wakeTime: doc.wakeTime,
  duration: doc.duration,
  quality: doc.quality,
  factors: doc.factors || [],
  notes: doc.notes,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/**
 * Map MongoDB document to SleepGoal
 */
const mapDocToSleepGoal = (doc: any): SleepGoal => ({
  id: doc._id.toString(),
  userId: doc.userId,
  targetBedtime: doc.targetBedtime,
  targetWakeTime: doc.targetWakeTime,
  targetDuration: doc.targetDuration,
  isActive: doc.isActive,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
