import { ObjectId } from 'mongodb';

export interface IReminder {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'food' | 'supplement' | 'medication';
  name: string;
  description?: string;
  time: string; // HH:mm format
  days: string[]; // ['monday', 'tuesday', etc.] or ['everyday']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReminderDTO {
  id: string;
  type: 'food' | 'supplement' | 'medication';
  name: string;
  description?: string;
  time: string;
  days: string[];
  isActive: boolean;
}
