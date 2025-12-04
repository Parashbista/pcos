import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { IUser } from './user.types';

/**
 * User model class for MongoDB operations
 * Provides methods for CRUD operations and schema validation
 */
export class UserModel {
  private static collectionName = 'users';

  /**
   * Get the users collection with proper typing
   */
  private static getCollection(): Collection<IUser> {
    return getDb().collection<IUser>(this.collectionName);
  }

  /**
   * Initialize the User collection with indexes and validation
   * Should be called once during application startup
   */
  static async initialize(): Promise<void> {
    try {
      const collection = this.getCollection();

      // Create unique index on email field
      await collection.createIndex(
        { email: 1 },
        { 
          unique: true,
          name: 'email_unique_index'
        }
      );

      console.log('✓ User model initialized with indexes');
    } catch (error) {
      console.error('✗ Failed to initialize User model:', error);
      throw error;
    }
  }

  /**
   * Validate user data before insertion/update
   */
  private static validateUser(user: Partial<IUser>): void {
    // Email validation
    if (user.email !== undefined) {
      if (!user.email || typeof user.email !== 'string') {
        throw new Error('Email is required and must be a string');
      }
      if (user.email.length > 255) {
        throw new Error('Email must not exceed 255 characters');
      }
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error('Invalid email format');
      }
    }

    // Password validation
    if (user.password !== undefined) {
      if (!user.password || typeof user.password !== 'string') {
        throw new Error('Password is required and must be a string');
      }
    }

    // Name validation
    if (user.name !== undefined && user.name !== null) {
      if (typeof user.name !== 'string') {
        throw new Error('Name must be a string');
      }
      if (user.name.length > 100) {
        throw new Error('Name must not exceed 100 characters');
      }
    }
  }

  /**
   * Create a new user document
   */
  static async create(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    this.validateUser(userData);

    const collection = this.getCollection();
    const now = new Date();

    const user: Omit<IUser, '_id'> = {
      ...userData,
      email: userData.email.toLowerCase(), // Store email in lowercase
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(user as IUser);
    
    return {
      _id: result.insertedId,
      ...user
    };
  }

  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    const collection = this.getCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find a user by ID
   */
  static async findById(id: string | ObjectId): Promise<IUser | null> {
    const collection = this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string | ObjectId, hashedPassword: string): Promise<IUser | null> {
    const collection = this.getCollection();
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  /**
   * Update user data
   */
  static async update(
    userId: string | ObjectId, 
    updates: Partial<Omit<IUser, '_id' | 'createdAt'>>
  ): Promise<IUser | null> {
    this.validateUser(updates);

    const collection = this.getCollection();
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    // Ensure email is lowercase if being updated
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  /**
   * Delete a user
   */
  static async delete(userId: string | ObjectId): Promise<boolean> {
    const collection = this.getCollection();
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }
}
