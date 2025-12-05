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
    name,
    authProvider: 'local'
  });

  return user;
}

/**
 * Create or find user from Google OAuth
 */
export async function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  name?: string
): Promise<IUser> {
  // Check if user exists with this Google ID
  let user = await UserModel.findByGoogleId(googleId);
  
  if (user) {
    return user;
  }

  // Check if user exists with this email
  user = await UserModel.findByEmail(email);
  
  if (user) {
    // Link Google account to existing user
    await UserModel.update(user._id!.toString(), { googleId, authProvider: 'google' });
    return { ...user, googleId, authProvider: 'google' };
  }

  // Create new user
  return await UserModel.create({
    email,
    password: '', // No password for Google users
    name,
    googleId,
    authProvider: 'google'
  });
}

/**
 * Set password reset token for user
 */
export async function setPasswordResetToken(email: string, token: string): Promise<IUser | null> {
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return await UserModel.setResetToken(email, token, expires);
}

/**
 * Verify reset token and reset password
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const user = await UserModel.findByResetToken(token);
  
  if (!user) {
    return false;
  }

  const hashedPassword = await hashPassword(newPassword);
  await UserModel.updatePassword(user._id!.toString(), hashedPassword);
  await UserModel.clearResetToken(user._id!.toString());
  
  return true;
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
