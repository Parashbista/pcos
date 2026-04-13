import { ObjectId } from 'mongodb';

/**
 * Partner sharing document interface
 */
export interface IPartnerSharing {
  _id?: ObjectId;
  userId: ObjectId;
  shareCode: string;
  isEnabled: boolean;
  sharePeriod: boolean;
  shareMood: boolean;
  shareSleep: boolean;
  connectedPartners: ObjectId[]; // Array of user IDs who are connected
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Optional expiration for share code
}

/**
 * Partner connection document
 */
export interface IPartnerConnection {
  _id?: ObjectId;
  userId: ObjectId; // The person viewing
  partnerId: ObjectId; // The person being viewed
  partnerName?: string;
  connectedAt: Date;
}
