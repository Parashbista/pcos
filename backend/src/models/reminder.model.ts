import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { IReminder } from './reminder.types';

export class ReminderModel {
  private static collectionName = 'reminders';

  private static getCollection(): Collection<IReminder> {
    return getDb().collection<IReminder>(this.collectionName);
  }

  static async initialize(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ userId: 1, type: 1 });
    console.log('✓ Reminder collection indexes created');
  }

  static async create(data: Omit<IReminder, '_id' | 'createdAt' | 'updatedAt'>): Promise<IReminder> {
    const collection = this.getCollection();
    const now = new Date();
    const reminder: Omit<IReminder, '_id'> = { ...data, createdAt: now, updatedAt: now };
    const result = await collection.insertOne(reminder as IReminder);
    return { _id: result.insertedId, ...reminder };
  }

  static async findByUserId(userId: string): Promise<IReminder[]> {
    const collection = this.getCollection();
    return await collection.find({ userId: new ObjectId(userId) }).sort({ time: 1 }).toArray();
  }

  static async findById(id: string, userId: string): Promise<IReminder | null> {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
  }

  static async update(id: string, userId: string, updates: Partial<IReminder>): Promise<IReminder | null> {
    const collection = this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    return result.deletedCount > 0;
  }

  static async toggleActive(id: string, userId: string): Promise<IReminder | null> {
    const collection = this.getCollection();
    const reminder = await this.findById(id, userId);
    if (!reminder) return null;
    return await this.update(id, userId, { isActive: !reminder.isActive });
  }
}
