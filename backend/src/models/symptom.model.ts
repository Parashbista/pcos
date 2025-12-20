import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { SymptomEntry } from './symptom.types';

/**
 * Get symptom entries collection
 */
export function getSymptomEntriesCollection(): Collection {
  return getDb().collection('symptom_entries');
}

/**
 * Initialize symptom collections with indexes
 */
export async function initializeSymptomCollections(): Promise<void> {
  const collection = getSymptomEntriesCollection();

  // Create indexes for symptom entries
  await collection.createIndex({ userId: 1, date: -1 });
  await collection.createIndex({ userId: 1, date: 1 }, { unique: true });

  console.log('✓ Symptom collections indexes created');
}
