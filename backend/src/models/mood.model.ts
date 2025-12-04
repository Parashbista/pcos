import { Collection } from 'mongodb';
import { getDb } from '../config/database';

/**
 * Get mood entries collection
 */
export function getMoodEntriesCollection(): Collection {
  return getDb().collection('mood_entries');
}

/**
 * Initialize mood collections with indexes
 */
export async function initializeMoodCollections(): Promise<void> {
  const collection = getMoodEntriesCollection();

  // Create indexes
  await collection.createIndex({ userId: 1, date: -1 });
  await collection.createIndex({ userId: 1, date: 1 }, { unique: true });

  console.log('✓ Mood collections indexes created');
}
