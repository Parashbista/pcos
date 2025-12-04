import { ObjectId } from 'mongodb';

/**
 * User document interface representing the structure stored in MongoDB
 */
export interface IUser {
  _id?: ObjectId;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data transfer object (without sensitive fields)
 * Used for API responses
 */
export interface IUserDTO {
  id: string;
  email: string;
  name?: string;
}
