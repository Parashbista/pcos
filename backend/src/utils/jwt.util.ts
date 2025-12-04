import jwt from 'jsonwebtoken';

/**
 * JWT payload interface
 */
export interface IJWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 * @param userId - User ID to include in the token payload
 * @returns JWT token string
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload: IJWTPayload = {
    userId
  };

  // Token expires in 7 days
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): IJWTPayload {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret) as IJWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}
