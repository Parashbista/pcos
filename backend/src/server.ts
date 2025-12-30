import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import sleepRouter from './routes/sleep.routes';
import moodRouter from './routes/mood.routes';
import periodRouter from './routes/period.routes';
import reminderRouter from './routes/reminder.routes';
import symptomRouter from './routes/symptom.routes';
import supplementRouter from './routes/supplement.routes';
import aiRouter from './routes/ai.routes';

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

// Mount sleep router on /api/sleep path
app.use('/api/sleep', sleepRouter);

// Mount mood router on /api/mood path
app.use('/api/mood', moodRouter);

// Mount period router on /api/period path
app.use('/api/period', periodRouter);

// Mount reminder router on /api/reminders path
app.use('/api/reminders', reminderRouter);

// Mount symptom router on /api/symptoms path
app.use('/api/symptoms', symptomRouter);

// Mount supplement router on /api/supplements path
app.use('/api/supplements', supplementRouter);

// Mount AI router on /api/ai path
console.log('✓ AI routes loaded');
app.use('/api/ai', aiRouter);

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
