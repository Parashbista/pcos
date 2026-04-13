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
      email: userData.email.toLowerCase(),
      authProvider: userData.authProvider || 'local',
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
   * Find a user by Google ID
   */
  static async findByGoogleId(googleId: string): Promise<IUser | null> {
    const collection = this.getCollection();
    return await collection.findOne({ googleId });
  }

  /**
   * Set password reset token
   */
  static async setResetToken(email: string, token: string, expires: Date): Promise<IUser | null> {
    const collection = this.getCollection();
    const result = await collection.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          resetPasswordToken: token,
          resetPasswordExpires: expires,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  /**
   * Find user by reset token
   */
  static async findByResetToken(token: string): Promise<IUser | null> {
    const collection = this.getCollection();
    return await collection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
  }

  /**
   * Clear reset token after password reset
   */
  static async clearResetToken(userId: string | ObjectId): Promise<void> {
    const collection = this.getCollection();
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    await collection.updateOne(
      { _id: objectId },
      { 
        $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Set email verification code for signup
   */
  static async setVerificationCode(email: string, code: string, expires: Date): Promise<void> {
    const collection = this.getCollection();
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // User exists, just update the verification code
      await collection.updateOne(
        { email: email.toLowerCase() },
        { 
          $set: { 
            emailVerificationCode: code,
            emailVerificationExpires: expires,
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Create a temporary user document with just email and verification code
      // This will be completed when they verify
      await collection.insertOne({
        email: email.toLowerCase(),
        password: '', // Empty password - will be set during verification
        emailVerificationCode: code,
        emailVerificationExpires: expires,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } as IUser);
    }
  }

  /**
   * Verify email with code and mark as verified
   */
  static async verifyEmailWithCode(email: string, code: string): Promise<IUser | null> {
    const collection = this.getCollection();
    
    console.log('[UserModel] Verifying email:', email);
    console.log('[UserModel] Looking for code:', code);
    
    const user = await collection.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() }
    });

    console.log('[UserModel] User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('[UserModel] User email:', user.email);
      console.log('[UserModel] Stored code:', user.emailVerificationCode);
      console.log('[UserModel] Code expires:', user.emailVerificationExpires);
      console.log('[UserModel] Current time:', new Date());
    }

    if (!user) {
      // Check if user exists without code match
      const userWithoutCode = await collection.findOne({ email: email.toLowerCase() });
      if (userWithoutCode) {
        console.log('[UserModel] User exists but code mismatch');
        console.log('[UserModel] Stored code:', userWithoutCode.emailVerificationCode);
        console.log('[UserModel] Provided code:', code);
        console.log('[UserModel] Expires:', userWithoutCode.emailVerificationExpires);
      } else {
        console.log('[UserModel] No user found with this email');
      }
      return null;
    }

    // Mark email as verified and clear verification code
    const result = await collection.findOneAndUpdate(
      { _id: user._id },
      { 
        $set: { 
          isEmailVerified: true,
          updatedAt: new Date()
        },
        $unset: { emailVerificationCode: '', emailVerificationExpires: '' }
      },
      { returnDocument: 'after' }
    );

    return result || null;
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
