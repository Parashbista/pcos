import dotenv from 'dotenv';
import { app } from './server';
import { connectDB } from './config/database';
import { initializeSleepCollections } from './models/sleep.model';
import { initializeMoodCollections } from './models/mood.model';
import { initializePeriodCollections } from './models/period.model';
import { initializeSymptomCollections } from './models/symptom.model';
import { ReminderModel } from './models/reminder.model';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Bootstrap the application
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize collections (create indexes)
    await initializeSleepCollections();
    await initializeMoodCollections();
    await initializePeriodCollections();
    await initializeSymptomCollections();
    await ReminderModel.initialize();
    console.log('✓ Collections initialized');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('✗ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('✗ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the application
startServer();
