import { MongoClient, Db } from 'mongodb';
import { UserModel } from '../models/user.model';

let client: MongoClient;
let db: Db;

/**
 * Establishes connection to MongoDB Atlas
 * Reads MONGODB_URI from environment variables
 */
export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Create MongoDB client with connection options
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    // Connect to MongoDB
    await client.connect();

    // Get database instance
    db = client.db();

    console.log('✓ Successfully connected to MongoDB Atlas');

    // Initialize models (create indexes, etc.)
    await UserModel.initialize();
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Returns the database instance
 * Must be called after connectDB()
 */
export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * Returns the MongoDB client instance
 * Must be called after connectDB()
 */
export function getClient(): MongoClient {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectDB() first.');
  }
  return client;
}

/**
 * Closes the database connection
 */
export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('✓ MongoDB connection closed');
  }
}
