import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';

// Initialize Express app
export const app: Express = express();

// CORS configuration - allow frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount auth router on /api/auth path
app.use('/api/auth', authRouter);

// Error handling middleware for authentication errors
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  // Default error response
  res.status(500).json({ error: 'Internal server error' });
});
