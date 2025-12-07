import { Request, Response } from 'express';
import { createUser, findUserByEmail, findUserById, updateUserPassword, findOrCreateGoogleUser, setPasswordResetToken, resetPasswordWithToken } from '../services/user.service';
import { generateToken } from '../utils/jwt.util';
import { comparePassword } from '../utils/password.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendPasswordResetEmail, generateOTP } from '../services/email.service';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        name: user.name,
        createdAt: user.createdAt
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
        name: user.name,
        createdAt: user.createdAt
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

/**
 * Request password reset (send OTP)
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      res.status(200).json({ message: 'If the email exists, a reset code has been sent' });
      return;
    }

    if (user.authProvider === 'google') {
      res.status(400).json({ error: 'This account uses Google Sign-In. Please login with Google.' });
      return;
    }

    const otp = generateOTP();
    await setPasswordResetToken(email, otp);
    
    try {
      await sendPasswordResetEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
      return;
    }

    res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Verify OTP and reset password
 * POST /api/auth/reset-password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ error: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    const success = await resetPasswordWithToken(otp, newPassword);
    
    if (!success) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Google Sign-In
 * POST /api/auth/google
 */
export async function googleSignIn(req: Request, res: Response): Promise<void> {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const { sub: googleId, email, name } = payload;

    // Find or create user
    const user = await findOrCreateGoogleUser(googleId, email, name);

    // Generate JWT token
    const token = generateToken(user._id!.toString());

    res.status(200).json({
      token,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
}
