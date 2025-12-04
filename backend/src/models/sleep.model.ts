import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { SleepEntry, SleepGoal } from './sleep.types';

/**
 * Get sleep entries collection
 */
export function getSleepEntriesCollection(): Collection {
  return getDb().collection('sleep_entries');
}

/**
 * Get sleep goals collection
 */
export function getSleepGoalsCollection(): Collection {
  return getDb().collection('sleep_goals');
}

/**
 * Initialize sleep collections with indexes
 */
export async function initializeSleepCollections(): Promise<void> {
  const entriesCollection = getSleepEntriesCollection();
  const goalsCollection = getSleepGoalsCollection();

  // Create indexes for sleep entries
  await entriesCollection.createIndex({ userId: 1, date: -1 });
  await entriesCollection.createIndex({ userId: 1, date: 1 }, { unique: true });

  // Create index for sleep goals
  await goalsCollection.createIndex({ userId: 1, isActive: 1 });

  console.log('✓ Sleep collections indexes created');
}
