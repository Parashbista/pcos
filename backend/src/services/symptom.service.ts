import { ObjectId } from 'mongodb';
import { getSymptomEntriesCollection } from '../models/symptom.model';
import {
  SymptomEntry,
  CreateSymptomEntryData,
  UpdateSymptomEntryData,
  SymptomStats,
  SymptomName,
  SymptomSeverity,
  SymptomCategory,
} from '../models/symptom.types';

/**
 * Create or update symptom entry for a date
 */
export async function createSymptomEntry(
  userId: string,
  data: CreateSymptomEntryData
): Promise<SymptomEntry> {
  const collection = getSymptomEntriesCollection();
  const now = new Date();

  // Check if entry exists for this date
  const existing = await collection.findOne({
    userId: new ObjectId(userId),
    date: data.date,
  });

  if (existing) {
    // Update existing entry
    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          symptoms: data.symptoms,
          notes: data.notes,
          updatedAt: now,
        },
      }
    );

    return {
      id: existing._id.toString(),
      userId,
      date: data.date,
      symptoms: data.symptoms,
      notes: data.notes,
      createdAt: existing.createdAt,
      updatedAt: now,
    };
  }

  // Create new entry
  const entry = {
    userId: new ObjectId(userId),
    date: data.date,
    symptoms: data.symptoms,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(entry);

  return {
    id: result.insertedId.toString(),
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get symptom entries for a user within date range
 */
export async function getSymptomEntries(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<SymptomEntry[]> {
  const collection = getSymptomEntriesCollection();

  const query: any = { userId: new ObjectId(userId) };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const entries = await collection
    .find(query)
    .sort({ date: -1 })
    .toArray();

  return entries.map((entry) => ({
    id: entry._id.toString(),
    userId: entry.userId.toString(),
    date: entry.date,
    symptoms: entry.symptoms,
    notes: entry.notes,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }));
}

/**
 * Get symptom entry by date
 */
export async function getSymptomEntryByDate(
  userId: string,
  date: string
): Promise<SymptomEntry | null> {
  const collection = getSymptomEntriesCollection();

  const entry = await collection.findOne({
    userId: new ObjectId(userId),
    date,
  });

  if (!entry) return null;

  return {
    id: entry._id.toString(),
    userId: entry.userId.toString(),
    date: entry.date,
    symptoms: entry.symptoms,
    notes: entry.notes,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

/**
 * Update symptom entry
 */
export async function updateSymptomEntry(
  userId: string,
  entryId: string,
  data: UpdateSymptomEntryData
): Promise<SymptomEntry | null> {
  const collection = getSymptomEntriesCollection();

  const result = await collection.findOneAndUpdate(
    {
      _id: new ObjectId(entryId),
      userId: new ObjectId(userId),
    },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    id: result._id.toString(),
    userId: result.userId.toString(),
    date: result.date,
    symptoms: result.symptoms,
    notes: result.notes,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Delete symptom entry
 */
export async function deleteSymptomEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  const collection = getSymptomEntriesCollection();

  const result = await collection.deleteOne({
    _id: new ObjectId(entryId),
    userId: new ObjectId(userId),
  });

  return result.deletedCount > 0;
}

/**
 * Get symptom statistics
 */
export async function getSymptomStats(
  userId: string,
  days: number = 30
): Promise<SymptomStats> {
  const collection = getSymptomEntriesCollection();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const entries = await collection
    .find({
      userId: new ObjectId(userId),
      date: { $gte: startDateStr },
    })
    .toArray();

  // Calculate statistics
  const symptomCounts: Record<string, number> = {};
  const severityCounts: Record<SymptomSeverity, number> = {
    mild: 0,
    moderate: 0,
    severe: 0,
  };
  const categoryCounts: Record<SymptomCategory, number> = {
    physical: 0,
    hormonal: 0,
    emotional: 0,
    digestive: 0,
  };

  entries.forEach((entry) => {
    entry.symptoms.forEach((symptom: any) => {
      // Count symptoms
      symptomCounts[symptom.name] = (symptomCounts[symptom.name] || 0) + 1;
      // Count severities
      severityCounts[symptom.severity as SymptomSeverity]++;
      // Count categories
      categoryCounts[symptom.category as SymptomCategory]++;
    });
  });

  // Sort symptoms by count
  const mostCommonSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name: name as SymptomName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEntries: entries.length,
    mostCommonSymptoms,
    severityDistribution: severityCounts,
    categoryDistribution: categoryCounts,
  };
}
