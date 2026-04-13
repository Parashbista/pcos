/**
 * Comprehensive Chatbot System Test
 * Tests the full AI service with Gemini API
 */

require('dotenv').config();

const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

console.log('🧪 CHATBOT SYSTEM TEST');
console.log('='.repeat(50));
console.log(`Model: ${MODEL}`);
console.log(`API Key: ${API_KEY?.substring(0, 10)}...`);
console.log('='.repeat(50));

async function testGeminiAPI() {
  console.log('\n📡 Test 1: Direct Gemini API Call');
  console.log('-'.repeat(50));
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello from Gemini!" in one sentence.' }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ FAILED:', error.error?.message);
      return false;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      console.log('✅ SUCCESS!');
      console.log('Response:', content);
      return true;
    } else {
      console.log('❌ FAILED: Empty response');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function testPCOSQuestion() {
  console.log('\n🩺 Test 2: PCOS Health Question');
  console.log('-'.repeat(50));
  
  try {
    const prompt = `You are a friendly PCOS health assistant.

RESPONSE FORMAT - ALWAYS follow this:
• Keep answers SHORT and CONCISE (max 3-4 bullet points)
• Use bullet points (•) for clarity
• Each point should be 1-2 sentences max

User question: What are common PCOS symptoms?`;

    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ FAILED:', error.error?.message);
      return false;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      console.log('✅ SUCCESS!');
      console.log('Response:\n', content);
      return true;
    } else {
      console.log('❌ FAILED: Empty response');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function testModelAvailability() {
  console.log('\n🔍 Test 3: Verify Model Availability');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.log('❌ FAILED: Cannot list models');
      return false;
    }

    const data = await response.json();
    const availableModels = data.models
      ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
    
    const isAvailable = availableModels?.includes(MODEL);
    
    if (isAvailable) {
      console.log(`✅ SUCCESS! ${MODEL} is available`);
      console.log('\nAll available models:');
      availableModels.forEach(m => console.log(`  • ${m}`));
      return true;
    } else {
      console.log(`❌ FAILED: ${MODEL} not found`);
      console.log('Available models:', availableModels);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting comprehensive tests...\n');
  
  const results = {
    modelAvailability: await testModelAvailability(),
    directAPI: await testGeminiAPI(),
    pcosQuestion: await testPCOSQuestion()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Model Availability: ${results.modelAvailability ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Direct API Call:    ${results.directAPI ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PCOS Question:      ${results.pcosQuestion ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Your chatbot is ready to use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  return allPassed;
}

runAllTests();
