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
import chatbotRouter from './routes/chatbot.routes';

// Initialize Express app
export const app: Express = express();

// CORS configuration - allow frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Middleware
app.use(express.json());

// Request logging middleware - logs every incoming request
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`\n📥 [${timestamp}] ${method} ${url}`);
  console.log(`   From: ${ip}`);
  if (req.headers.authorization) {
    console.log(`   Auth: Bearer token present`);
  }
  if (Object.keys(req.body || {}).length > 0) {
    console.log(`   Body: ${JSON.stringify(req.body).substring(0, 200)}`);
  }
  
  // Log response when it finishes
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} [${timestamp}] ${method} ${url} -> ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

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

// Mount Chatbot router on /api/chatbot path
console.log('✓ Chatbot routes loaded');
app.use('/api/chatbot', chatbotRouter);

// TEMPORARY FIX: Also mount chatbot routes without /api prefix
// This handles cases where frontend might be calling without the prefix
app.use('/chatbot', chatbotRouter);
console.log('✓ Chatbot routes also mounted at /chatbot (fallback)');

// Debug endpoint to list all registered routes
app.get('/api/debug/routes', (_req: Request, res: Response) => {
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          routes.push(`${methods} ${path}`);
        }
      });
    }
  });
  res.json({ routes });
});

// Catch-all for unmatched routes - helps debug 404s
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`⚠️  404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.url,
    hint: 'Check /api/debug/routes for available endpoints'
  });
});

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
