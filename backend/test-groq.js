/**
 * Test Groq API Setup
 */

require('dotenv').config();

const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

console.log('🚀 GROQ API TEST');
console.log('='.repeat(50));
console.log(`Model: ${MODEL}`);
console.log(`API Key: ${API_KEY?.substring(0, 10)}...`);
console.log('='.repeat(50));

async function testGroqAPI() {
  console.log('\n📡 Test 1: Simple Generation');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Say "Hello from Groq!" in one sentence.' }],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ FAILED:', error.error?.message || 'Unknown error');
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ FAILED:', error.error?.message || 'Unknown error');
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
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

async function runAllTests() {
  console.log('\n🚀 Starting tests...\n');
  
  if (!API_KEY || !API_KEY.startsWith('gsk_')) {
    console.log('❌ Invalid API key format. Groq keys start with "gsk_"');
    console.log('\n📖 Setup Instructions:');
    console.log('1. Go to: https://console.groq.com/');
    console.log('2. Sign up (free)');
    console.log('3. Create an API key');
    console.log('4. Update .env file:');
    console.log('   AI_PROVIDER=groq');
    console.log('   AI_API_KEY=gsk_your_key_here');
    console.log('   AI_MODEL=llama-3.3-70b-versatile');
    return;
  }
  
  const results = {
    simpleTest: await testGroqAPI(),
    pcosQuestion: await testPCOSQuestion()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Simple Test:    ${results.simpleTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PCOS Question:  ${results.pcosQuestion ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Your chatbot is ready!');
    console.log('\nGroq is FAST and FREE - perfect for your PCOS app!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

runAllTests();
