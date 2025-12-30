import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { Supplement, SupplementLog, DietGoal, DietLog } from './supplement.types';

/**
 * Get supplements collection
 */
export function getSupplementsCollection(): Collection {
  return getDb().collection('supplements');
}

/**
 * Get supplement logs collection
 */
export function getSupplementLogsCollection(): Collection {
  return getDb().collection('supplement_logs');
}

/**
 * Get diet goals collection
 */
export function getDietGoalsCollection(): Collection {
  return getDb().collection('diet_goals');
}

/**
 * Get diet logs collection
 */
export function getDietLogsCollection(): Collection {
  return getDb().collection('diet_logs');
}

/**
 * Initialize supplement collections with indexes
 */
export async function initializeSupplementCollections(): Promise<void> {
  const supplementsCol = getSupplementsCollection();
  const logsCol = getSupplementLogsCollection();
  const dietGoalsCol = getDietGoalsCollection();
  const dietLogsCol = getDietLogsCollection();

  // Supplements indexes
  await supplementsCol.createIndex({ userId: 1 });
  await supplementsCol.createIndex({ userId: 1, isActive: 1 });

  // Supplement logs indexes
  await logsCol.createIndex({ odId: 1, date: -1 });
  await logsCol.createIndex({ supplementId: 1, date: -1 });
  await logsCol.createIndex({ odId: 1, supplementId: 1, date: 1 }, { unique: true });

  // Diet goals indexes
  await dietGoalsCol.createIndex({ userId: 1 });

  // Diet logs indexes
  await dietLogsCol.createIndex({ userId: 1, date: -1 });
  await dietLogsCol.createIndex({ userId: 1, date: 1, mealType: 1 });

  console.log('✓ Supplement collections indexes created');
}

// ============================================
// Supplement CRUD Operations
// ============================================

export async function createSupplement(
  userId: string,
  data: Omit<Supplement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Supplement> {
  const collection = getSupplementsCollection();
  const now = new Date();

  const doc = {
    userId: new ObjectId(userId),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getSupplements(userId: string, activeOnly = false): Promise<Supplement[]> {
  const collection = getSupplementsCollection();
  const query: any = { userId: new ObjectId(userId) };
  if (activeOnly) query.isActive = true;

  const docs = await collection.find(query).sort({ createdAt: -1 }).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    customName: doc.customName,
    dosage: doc.dosage,
    frequency: doc.frequency,
    timeOfDay: doc.timeOfDay,
    instruction: doc.instruction,
    notes: doc.notes,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function updateSupplement(
  userId: string,
  supplementId: string,
  data: Partial<Supplement>
): Promise<Supplement | null> {
  const collection = getSupplementsCollection();

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(supplementId), userId: new ObjectId(userId) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    id: result._id.toString(),
    userId: result.userId.toString(),
    name: result.name,
    customName: result.customName,
    dosage: result.dosage,
    frequency: result.frequency,
    timeOfDay: result.timeOfDay,
    instruction: result.instruction,
    notes: result.notes,
    isActive: result.isActive,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

export async function deleteSupplement(userId: string, supplementId: string): Promise<boolean> {
  const collection = getSupplementsCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(supplementId),
    userId: new ObjectId(userId),
  });
  return result.deletedCount > 0;
}

// ============================================
// Supplement Log Operations
// ============================================

export async function logSupplementIntake(
  userId: string,
  data: {
    supplementId: string;
    supplementName: string;
    date: string;
    time: string;
    taken: boolean;
    takenWithFood: boolean;
    notes?: string;
  }
): Promise<SupplementLog> {
  const collection = getSupplementLogsCollection();
  const now = new Date();

  // Upsert - update if exists for same supplement and date
  const result = await collection.findOneAndUpdate(
    {
      odId: new ObjectId(userId),
      supplementId: new ObjectId(data.supplementId),
      date: data.date,
    },
    {
      $set: {
        supplementName: data.supplementName,
        time: data.time,
        taken: data.taken,
        takenWithFood: data.takenWithFood,
        notes: data.notes,
      },
      $setOnInsert: {
        odId: new ObjectId(userId),
        supplementId: new ObjectId(data.supplementId),
        date: data.date,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return {
    id: result!._id.toString(),
    odId: userId,
    supplementId: data.supplementId,
    supplementName: data.supplementName,
    date: data.date,
    time: data.time,
    taken: data.taken,
    takenWithFood: data.takenWithFood,
    notes: data.notes,
    createdAt: result!.createdAt || now,
  };
}

export async function getSupplementLogs(
  userId: string,
  startDate: string,
  endDate: string,
  supplementId?: string
): Promise<SupplementLog[]> {
  const collection = getSupplementLogsCollection();

  const query: any = {
    odId: new ObjectId(userId),
    date: { $gte: startDate, $lte: endDate },
  };

  if (supplementId) {
    query.supplementId = new ObjectId(supplementId);
  }

  const docs = await collection.find(query).sort({ date: -1, time: -1 }).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    odId: doc.odId.toString(),
    supplementId: doc.supplementId.toString(),
    supplementName: doc.supplementName,
    date: doc.date,
    time: doc.time,
    taken: doc.taken,
    takenWithFood: doc.takenWithFood,
    notes: doc.notes,
    createdAt: doc.createdAt,
  }));
}

export async function getTodayLogs(userId: string): Promise<SupplementLog[]> {
  const today = new Date().toISOString().split('T')[0];
  return getSupplementLogs(userId, today, today);
}

// ============================================
// Diet Goal & Log Operations
// ============================================

export async function createDietGoal(
  userId: string,
  data: { name: string; description?: string; targetMeals: string[] }
): Promise<DietGoal> {
  const collection = getDietGoalsCollection();
  const now = new Date();

  const doc = {
    userId: new ObjectId(userId),
    name: data.name,
    description: data.description,
    targetMeals: data.targetMeals,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    userId,
    name: data.name,
    description: data.description,
    targetMeals: data.targetMeals as any,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getDietGoals(userId: string): Promise<DietGoal[]> {
  const collection = getDietGoalsCollection();
  const docs = await collection.find({ userId: new ObjectId(userId) }).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    description: doc.description,
    targetMeals: doc.targetMeals,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
}

export async function logDiet(
  userId: string,
  data: {
    date: string;
    mealType: string;
    description: string;
    isHealthy: boolean;
    tags: string[];
    notes?: string;
  }
): Promise<DietLog> {
  const collection = getDietLogsCollection();
  const now = new Date();

  const doc = {
    userId: new ObjectId(userId),
    ...data,
    createdAt: now,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    userId,
    date: data.date,
    mealType: data.mealType as any,
    description: data.description,
    isHealthy: data.isHealthy,
    tags: data.tags,
    notes: data.notes,
    createdAt: now,
  };
}

export async function getDietLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DietLog[]> {
  const collection = getDietLogsCollection();

  const docs = await collection
    .find({
      userId: new ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    })
    .sort({ date: -1, createdAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    date: doc.date,
    mealType: doc.mealType,
    description: doc.description,
    isHealthy: doc.isHealthy,
    tags: doc.tags,
    notes: doc.notes,
    createdAt: doc.createdAt,
  }));
}
