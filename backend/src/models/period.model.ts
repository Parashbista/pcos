import { Collection } from 'mongodb';
import { getDb } from '../config/database';

/**
 * Get period entries collection
 */
export function getPeriodEntriesCollection(): Collection {
  return getDb().collection('period_entries');
}

/**
 * Get period settings collection
 */
export function getPeriodSettingsCollection(): Collection {
  return getDb().collection('period_settings');
}

/**
 * Initialize period collections with indexes
 */
export async function initializePeriodCollections(): Promise<void> {
  const entriesCollection = getPeriodEntriesCollection();
  const settingsCollection = getPeriodSettingsCollection();

  // Create indexes for period entries
  await entriesCollection.createIndex({ userId: 1, startDate: -1 });
  await entriesCollection.createIndex({ userId: 1, startDate: 1 }, { unique: true });

  // Create index for period settings
  await settingsCollection.createIndex({ userId: 1 }, { unique: true });

  console.log('✓ Period collections indexes created');
}
