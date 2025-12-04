import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

/**
 * Extended Request interface to include authenticated user ID
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header, verifies it, and attaches user ID to request
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is missing' });
      return;
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization header format. Expected: Bearer <token>' });
      return;
    }

    const token = parts[1];

    // Verify token and extract payload
    const payload = verifyToken(token);

    // Attach user ID to request object
    req.userId = payload.userId;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle token verification errors
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
}
