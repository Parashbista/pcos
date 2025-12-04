import { UserModel } from '../models/user.model';
import { IUser, IUserDTO } from '../models/user.types';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';

/**
 * Create a new user in the database
 * @param email - User email
 * @param password - Plain text password (will be hashed)
 * @param name - Optional user name
 * @returns Created user object
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<IUser> {
  // Hash the password before storing
  const hashedPassword = await hashPassword(password);

  // Create user in database
  const user = await UserModel.create({
    email,
    password: hashedPassword,
    name
  });

  return user;
}

/**
 * Find a user by email address
 * @param email - User email to search for
 * @returns User object or null if not found
 */
export async function findUserByEmail(email: string): Promise<IUser | null> {
  return await UserModel.findByEmail(email);
}

/**
 * Find a user by ID
 * @param userId - User ID to search for
 * @returns User object or null if not found
 */
export async function findUserById(userId: string): Promise<IUser | null> {
  return await UserModel.findById(userId);
}

/**
 * Update a user's password
 * @param userId - User ID
 * @param newPassword - New plain text password (will be hashed)
 * @returns Updated user object or null if user not found
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<IUser | null> {
  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password in database
  return await UserModel.updatePassword(userId, hashedPassword);
}

/**
 * Verify user credentials and generate authentication token
 * @param email - User email
 * @param password - Plain text password
 * @returns Object containing token and user data, or null if credentials invalid
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ token: string; user: IUserDTO } | null> {
  // Find user by email
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    return null;
  }

  // Generate JWT token
  const token = generateToken(user._id!.toString());

  // Return token and user data (without password)
  return {
    token,
    user: {
      id: user._id!.toString(),
      email: user.email,
      name: user.name
    }
  };
}
