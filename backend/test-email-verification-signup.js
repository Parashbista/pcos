/**
 * Test Email Verification Signup Flow
 */

require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123';
const TEST_NAME = 'Test User';

console.log('🧪 EMAIL VERIFICATION SIGNUP TEST');
console.log('='.repeat(60));
console.log(`Test Email: ${TEST_EMAIL}`);
console.log('='.repeat(60));

let verificationCode = '';

async function step1_RequestVerification() {
  console.log('\n📧 Step 1: Request Verification Code');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/request-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Message:', data.message);
      console.log('\n💡 Check your email for the verification code');
      console.log('   (In development, check server logs for the code)');
      return true;
    } else {
      console.log('❌ FAILED');
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n💡 Make sure your backend server is running:');
    console.log('   npm run dev');
    return false;
  }
}

async function step2_VerifyAndRegister(code) {
  console.log('\n✅ Step 2: Verify Code and Complete Registration');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        code: code,
        password: TEST_PASSWORD,
        name: TEST_NAME
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Token:', data.token.substring(0, 20) + '...');
      console.log('User:', data.user);
      return true;
    } else {
      console.log('❌ FAILED');
      console.log('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function testDuplicateEmail() {
  console.log('\n🔒 Step 3: Test Duplicate Email Prevention');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/request-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    
    if (response.status === 409) {
      console.log('✅ SUCCESS! Duplicate email correctly rejected');
      console.log('Error:', data.error);
      return true;
    } else {
      console.log('⚠️  Expected 409 status for duplicate email');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting email verification signup tests...\n');
  
  const step1 = await step1_RequestVerification();
  
  if (!step1) {
    console.log('\n❌ Step 1 failed. Cannot continue.');
    return;
  }

  console.log('\n⏸️  PAUSED - Manual Step Required');
  console.log('='.repeat(60));
  console.log('Please enter the 6-digit verification code from the email:');
  console.log('(Check your email or server logs)');
  console.log('\nTo continue testing:');
  console.log('1. Get the code from email/logs');
  console.log('2. Run: node test-email-verification-manual.js <code>');
  console.log('='.repeat(60));
}

// If code provided as argument, run step 2
if (process.argv[2]) {
  const code = process.argv[2];
  console.log(`\nUsing verification code: ${code}\n`);
  step2_VerifyAndRegister(code).then(success => {
    if (success) {
      testDuplicateEmail();
    }
  });
} else {
  runTests();
}
