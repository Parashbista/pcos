import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 * Checks for validation errors and returns 400 if any exist
 */
export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({
      error: 'Validation failed',
      details: errorMessages
    });
    return;
  }

  next();
}
