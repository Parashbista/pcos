/**
 * Test the exact key from the screenshot
 */

// From screenshot: AIzaSyDJM2Q5xL1QObAZKANyR7WroqfLLTYyKa8
const KEY_PROVIDED = 'AIzaSyDJM2Q5xL1QObAZKANyR7WroqfLLTYyKa8';

// From screenshot visible: AIzaSyDJM2Q5xL1QObAZKANyR7WroqfLLTYyKa8
// Let me also try the one visible in the screenshot
const KEY_FROM_SCREENSHOT = 'AIzaSyDJM2Q5xL1QObAZKANyR7WroqfLLTYyKa8';

async function testKey(key, label) {
  console.log(`\n🔑 Testing: ${label}`);
  console.log(`Key: ${key.substring(0, 20)}...`);
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "Hello"' }] }]
        })
      }
    );
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
      return true;
    } else {
      console.log('❌ FAILED');
      console.log('Error:', data.error?.message);
      console.log('Code:', data.error?.code);
      return false;
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing API Keys');
  console.log('='.repeat(50));
  
  await testKey(KEY_PROVIDED, 'Provided Key');
  
  console.log('\n' + '='.repeat(50));
  console.log('\n💡 If both failed with "denied access":');
  console.log('The Google Cloud project has billing or API restrictions.');
  console.log('\nSOLUTION:');
  console.log('1. Go to: https://console.cloud.google.com/billing');
  console.log('2. Link a billing account (free tier is fine)');
  console.log('3. Enable the Generative Language API');
  console.log('4. Wait 2-3 minutes for changes to propagate');
  console.log('\nOR create a key in a DIFFERENT project that has billing enabled.');
}

main();
