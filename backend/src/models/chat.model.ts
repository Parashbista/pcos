import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  _id?: ObjectId;
  id?: string;
  userId: string;
  messages: ChatMessage[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatModel {
  private static getCollection(): Collection<ChatConversation> {
    return getDb().collection<ChatConversation>('chat_conversations');
  }

  static async initialize(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ updatedAt: -1 });
    console.log('✓ Chat collection initialized');
  }

  static async getOrCreateConversation(userId: string): Promise<ChatConversation> {
    const collection = this.getCollection();
    
    // Get the most recent conversation from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let conversation = await collection.findOne({
      userId,
      updatedAt: { $gte: today }
    }, { sort: { updatedAt: -1 } });

    if (!conversation) {
      // Create new conversation
      const newConversation: ChatConversation = {
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newConversation);
      conversation = { ...newConversation, _id: result.insertedId };
    }

    return {
      ...conversation,
      id: conversation._id?.toString()
    };
  }

  static async addMessage(
    userId: string,
    conversationId: string,
    message: ChatMessage
  ): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(conversationId), userId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      }
    );
  }

  static async getConversationHistory(
    userId: string,
    limit: number = 10
  ): Promise<ChatConversation[]> {
    const collection = this.getCollection();
    const conversations = await collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    return conversations.map(c => ({
      ...c,
      id: c._id?.toString()
    }));
  }

  static async getConversationById(
    userId: string,
    conversationId: string
  ): Promise<ChatConversation | null> {
    const collection = this.getCollection();
    const conversation = await collection.findOne({
      _id: new ObjectId(conversationId),
      userId
    });

    if (!conversation) return null;

    return {
      ...conversation,
      id: conversation._id?.toString()
    };
  }

  static async deleteConversation(userId: string, conversationId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({
      _id: new ObjectId(conversationId),
      userId
    });
    return result.deletedCount > 0;
  }
}
