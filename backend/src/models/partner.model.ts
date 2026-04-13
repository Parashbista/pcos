import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { IPartnerSharing, IPartnerConnection } from './partner.types';

export class PartnerSharingModel {
  private static collectionName = 'partner_sharing';

  private static getCollection(): Collection<IPartnerSharing> {
    return getDb().collection<IPartnerSharing>(this.collectionName);
  }

  /**
   * Initialize indexes
   */
  static async initialize(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1 }, { unique: true });
    await collection.createIndex({ shareCode: 1 });
    console.log('✓ Partner sharing indexes created');
  }

  /**
   * Create or update partner sharing settings
   */
  static async upsertSettings(
    userId: string,
    settings: Partial<IPartnerSharing>
  ): Promise<IPartnerSharing> {
    const collection = this.getCollection();
    const userObjectId = new ObjectId(userId);
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      { userId: userObjectId },
      {
        $set: {
          ...settings,
          userId: userObjectId,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
          connectedPartners: [],
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return result!;
  }

  /**
   * Get sharing settings by user ID
   */
  static async getByUserId(userId: string): Promise<IPartnerSharing | null> {
    const collection = this.getCollection();
    return await collection.findOne({ userId: new ObjectId(userId) });
  }

  /**
   * Get sharing settings by share code
   */
  static async getByShareCode(shareCode: string): Promise<IPartnerSharing | null> {
    const collection = this.getCollection();
    return await collection.findOne({ shareCode, isEnabled: true });
  }

  /**
   * Add connected partner
   */
  static async addConnectedPartner(userId: string, partnerId: string): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $addToSet: { connectedPartners: new ObjectId(partnerId) },
        $set: { updatedAt: new Date() },
      }
    );
  }

  /**
   * Remove connected partner
   */
  static async removeConnectedPartner(userId: string, partnerId: string): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $pull: { connectedPartners: new ObjectId(partnerId) },
        $set: { updatedAt: new Date() },
      }
    );
  }
}

export class PartnerConnectionModel {
  private static collectionName = 'partner_connections';

  private static getCollection(): Collection<IPartnerConnection> {
    return getDb().collection<IPartnerConnection>(this.collectionName);
  }

  /**
   * Initialize indexes
   */
  static async initialize(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1, partnerId: 1 }, { unique: true });
    console.log('✓ Partner connections indexes created');
  }

  /**
   * Create connection
   */
  static async createConnection(
    userId: string,
    partnerId: string,
    partnerName?: string
  ): Promise<IPartnerConnection> {
    const collection = this.getCollection();
    const connection: IPartnerConnection = {
      userId: new ObjectId(userId),
      partnerId: new ObjectId(partnerId),
      partnerName,
      connectedAt: new Date(),
    };

    const result = await collection.insertOne(connection);
    return { ...connection, _id: result.insertedId };
  }

  /**
   * Get user's connections
   */
  static async getUserConnections(userId: string): Promise<IPartnerConnection[]> {
    const collection = this.getCollection();
    return await collection.find({ userId: new ObjectId(userId) }).toArray();
  }

  /**
   * Remove connection
   */
  static async removeConnection(userId: string, partnerId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({
      userId: new ObjectId(userId),
      partnerId: new ObjectId(partnerId),
    });
    return result.deletedCount > 0;
  }
}
