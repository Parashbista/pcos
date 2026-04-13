// Test script to list available Gemini models
const API_KEY = 'AIzaSyBUvYwdNPGDW1Cba5UKu-kBI0PVbrNV0tc';

async function listModels() {
  console.log('🔍 Checking available Gemini models...\n');
  
  // Try v1 API
  console.log('Testing v1 API:');
  try {
    const v1Response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
    );
    
    if (v1Response.ok) {
      const v1Data = await v1Response.json();
      console.log('✓ v1 API Models:');
      v1Data.models?.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  - ${model.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log('✗ v1 API failed:', v1Response.status);
    }
  } catch (error) {
    console.log('✗ v1 API error:', error.message);
  }
  
  console.log('\nTesting v1beta API:');
  try {
    const v1betaResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (v1betaResponse.ok) {
      const v1betaData = await v1betaResponse.json();
      console.log('✓ v1beta API Models:');
      v1betaData.models?.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  - ${model.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log('✗ v1beta API failed:', v1betaResponse.status);
    }
  } catch (error) {
    console.log('✗ v1beta API error:', error.message);
  }
  
  // Test a simple generation with gemini-pro
  console.log('\n🧪 Testing gemini-pro model:');
  try {
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello' }] }]
        })
      }
    );
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      const response = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✓ gemini-pro works! Response:', response);
    } else {
      const error = await testResponse.json();
      console.log('✗ gemini-pro failed:', error.error?.message);
    }
  } catch (error) {
    console.log('✗ gemini-pro error:', error.message);
  }
}

listModels();
