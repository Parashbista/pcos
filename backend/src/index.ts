// Load environment variables FIRST - before any other imports
import dotenv from 'dotenv';
dotenv.config();

import { app } from './server';
import { connectDB } from './config/database';
import { initializeSleepCollections } from './models/sleep.model';
import { initializeMoodCollections } from './models/mood.model';
import { initializePeriodCollections } from './models/period.model';
import { initializeSymptomCollections } from './models/symptom.model';
import { ReminderModel } from './models/reminder.model';
import { ChatModel } from './models/chat.model';
import { PartnerSharingModel, PartnerConnectionModel } from './models/partner.model';
import { getAIService } from './services/ai.service';

const PORT = Number(process.env.PORT) || 3000;

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
    await ChatModel.initialize();
    await PartnerSharingModel.initialize();
    await PartnerConnectionModel.initialize();
    console.log('✓ Collections initialized');

    // Test AI service connection
    console.log('\n🤖 Testing AI Service...');
    try {
      const aiService = getAIService();
      const testResult = await aiService.generate({
        prompt: 'Say hello',
        maxTokens: 50,
        temperature: 0.5
      });
      
      if (testResult.success) {
        console.log('✓ AI Service is working!');
        console.log(`  Response: "${testResult.content.substring(0, 100)}"`);
      } else {
        console.error('✗ AI Service test failed:', testResult.error);
        console.error('  The chatbot may not work properly.');
      }
    } catch (error) {
      console.error('✗ AI Service initialization error:', error);
      console.error('  The chatbot may not work properly.');
    }

    // Start Express server on 0.0.0.0 to allow connections from mobile devices
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ AI Provider: ${process.env.AI_PROVIDER || 'not set'}`);
      console.log(`✓ AI Model: ${process.env.AI_MODEL || 'default (gemini-1.5-flash)'}`);
      console.log(`✓ Server accessible at:`);
      console.log(`   - Local: http://localhost:${PORT}`);
      console.log(`   - Network: http://0.0.0.0:${PORT}`);
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
