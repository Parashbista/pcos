/**
 * Quick test for the new API key
 */

const NEW_KEY = 'AIzaSyA6ag-fyzvkWfR4kmZNv6MR6DIsHOkNHQg';

async function testNewKey() {
  console.log('🔑 Testing New API Key');
  console.log('='.repeat(50));
  console.log(`Key: ${NEW_KEY.substring(0, 15)}...`);
  console.log('='.repeat(50));

  // Simple test
  console.log('\n🤖 Testing content generation...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${NEW_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello in 3 words' }] }]
        })
      }
    );
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (response.ok) {
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('\n✅ SUCCESS! Your API key works!');
      console.log('Response:', content);
      console.log('\n🎉 Your chatbot is ready to use!');
    } else {
      console.log('\n❌ FAILED');
      console.log('Error:', JSON.stringify(data, null, 2));
      
      if (data.error?.code === 403) {
        console.log('\n⚠️  IMPORTANT:');
        console.log('The API key still has restrictions.');
        console.log('\nPlease verify:');
        console.log('1. You created the key at: https://aistudio.google.com/app/apikey');
        console.log('2. NOT at: https://console.cloud.google.com/apis/credentials');
        console.log('\nGoogle AI Studio keys are unrestricted by default.');
        console.log('Google Cloud Console keys may have project-level restrictions.');
        console.log('\nTry creating a NEW key at Google AI Studio (first link).');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testNewKey();
