/**
 * Test API Key Status and Restrictions
 */

require('dotenv').config();

const API_KEY = process.env.AI_API_KEY;

async function checkAPIKeyStatus() {
  console.log('🔑 Checking API Key Status');
  console.log('='.repeat(50));
  console.log(`API Key: ${API_KEY?.substring(0, 15)}...`);
  console.log('='.repeat(50));

  // Test 1: List models (this worked before)
  console.log('\n📋 Test 1: List Models (Read-only)');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
    );
    console.log(`Status: ${response.status}`);
    if (response.ok) {
      console.log('✅ List models: SUCCESS');
    } else {
      const error = await response.json();
      console.log('❌ List models: FAILED');
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Generate content (this is failing)
  console.log('\n🤖 Test 2: Generate Content (Write operation)');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hi' }] }]
        })
      }
    );
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Generate content: SUCCESS');
      console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log('❌ Generate content: FAILED');
      console.log('Error:', JSON.stringify(data, null, 2));
      
      // Provide helpful guidance
      if (data.error?.message?.includes('denied access')) {
        console.log('\n💡 SOLUTION:');
        console.log('Your API key has restricted access. This usually means:');
        console.log('1. The API key is restricted to specific APIs');
        console.log('2. The Generative Language API is not enabled');
        console.log('3. There are IP/referrer restrictions');
        console.log('\nTo fix this:');
        console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
        console.log('2. Find your API key');
        console.log('3. Click "Edit API key"');
        console.log('4. Under "API restrictions":');
        console.log('   - Select "Don\'t restrict key" OR');
        console.log('   - Select "Restrict key" and add "Generative Language API"');
        console.log('5. Save changes');
        console.log('\nOR create a new unrestricted API key at:');
        console.log('https://aistudio.google.com/app/apikey');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkAPIKeyStatus();
