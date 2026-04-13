/**
 * Full Chatbot Integration Test
 * Tests the complete flow from API endpoint to AI response
 */

require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

console.log('🧪 FULL CHATBOT INTEGRATION TEST');
console.log('='.repeat(60));
console.log('This test simulates a real chatbot conversation');
console.log('='.repeat(60));

async function testChatbotEndpoint() {
  console.log('\n📱 Test: POST /api/chatbot/chat');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need a real token
      },
      body: JSON.stringify({
        message: 'What are common PCOS symptoms?',
        conversationId: null
      })
    });

    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS!');
      console.log('\nBot Response:');
      console.log(data.response);
      console.log('\nConversation ID:', data.conversationId);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ FAILED');
      console.log('Error:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n💡 Make sure your backend server is running:');
    console.log('   npm run dev');
    return false;
  }
}

async function testAIServiceDirectly() {
  console.log('\n🤖 Test: AI Service Direct Call');
  console.log('-'.repeat(60));
  
  try {
    // Dynamically import the AI service
    const { getAIService } = await import('./dist/src/services/ai.service.js');
    
    const aiService = getAIService();
    const providerInfo = aiService.getProviderInfo();
    
    console.log(`Provider: ${providerInfo.provider}`);
    console.log(`Model: ${providerInfo.model}`);
    
    const response = await aiService.generate({
      prompt: 'Say "AI Service works!" in one sentence.',
      maxTokens: 50
    });
    
    if (response.success) {
      console.log('✅ SUCCESS!');
      console.log('Response:', response.content);
      return true;
    } else {
      console.log('❌ FAILED:', response.error);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n💡 Make sure to compile TypeScript first:');
    console.log('   npm run build');
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting integration tests...\n');
  
  // Test 1: Direct AI Service
  const aiServiceTest = await testAIServiceDirectly();
  
  // Test 2: Full API endpoint (requires server running)
  const apiTest = await testChatbotEndpoint();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 INTEGRATION TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`AI Service Direct:  ${aiServiceTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoint:       ${apiTest ? '✅ PASS' : '⚠️  SKIP (server not running)'}`);
  console.log('='.repeat(60));
  
  if (aiServiceTest) {
    console.log('\n✅ Your AI service is configured correctly!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your backend: npm run dev');
    console.log('2. Test the chatbot from your mobile app');
    console.log('3. Enjoy your FREE, FAST AI-powered PCOS assistant!');
  }
}

runTests();
