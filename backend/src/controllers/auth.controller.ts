import { Request, Response } from 'express';
import { createUser, findUserByEmail, findUserById, updateUserPassword } from '../services/user.service';
import { generateToken } from '../utils/jwt.util';
import { comparePassword } from '../utils/password.util';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password length (min 8 characters)
    if (!password || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    // Check for existing email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Create user in database (password will be hashed in service)
    const user = await createUser(email, password, name);

    // Generate JWT token
    const token = generateToken(user._id!.toString());

    // Return token and user data (201 response)
    res.status(201).json({
      token,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Login an existing user
 * POST /api/auth/login
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate email and password inputs
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id!.toString());

    // Return token and user data (200 response)
    res.status(200).json({
      token,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Change user password
 * POST /api/auth/change-password
 * Requires authentication
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user ID from authenticated request (set by auth middleware)
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Validate current password and new password inputs
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    // Validate new password length (min 8 characters)
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    // Find user by ID
    const user = await findUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password and update in database
    await updateUserPassword(userId, newPassword);

    // Return success message (200 response)
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
