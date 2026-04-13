# Email Verification Signup Flow

Your signup now requires email verification for better security.

## How It Works

### Step 1: User Requests Verification Code
```
POST /api/auth/request-verification
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent to your email",
  "email": "user@example.com"
}
```

**What Happens:**
- System generates a 6-digit code
- Code is valid for 10 minutes
- Email sent to user with the code
- If email already registered → 409 error

### Step 2: User Verifies Code and Completes Registration
```
POST /api/auth/verify-and-register
```

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-04-12T10:30:00.000Z"
  }
}
```

**What Happens:**
- System verifies the code
- If valid, creates user account
- Password is hashed and stored
- Email marked as verified
- JWT token generated
- User can immediately login

## Frontend Implementation

### React Native Example

```typescript
// Step 1: Request verification code
const requestVerification = async (email: string) => {
  const response = await fetch('http://your-api/api/auth/request-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (response.ok) {
    // Show code input screen
    navigation.navigate('VerifyEmail', { email });
  } else {
    const error = await response.json();
    Alert.alert('Error', error.error);
  }
};

// Step 2: Verify and register
const verifyAndRegister = async (email: string, code: string, password: string, name: string) => {
  const response = await fetch('http://your-api/api/auth/verify-and-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password, name })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Save token and navigate to app
    await AsyncStorage.setItem('token', data.token);
    navigation.navigate('Home');
  } else {
    const error = await response.json();
    Alert.alert('Error', error.error);
  }
};
```

## UI Flow

```
┌─────────────────┐
│  Enter Email    │
│  [email input]  │
│  [Send Code]    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Verify Email   │
│  Code sent to:  │
│  user@email.com │
│  [6-digit code] │
│  [Password]     │
│  [Name]         │
│  [Register]     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Welcome!       │
│  Account Created│
└─────────────────┘
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Invalid email | 400 | "Invalid email format" |
| Email exists | 409 | "Email already registered" |
| Invalid code | 400 | "Invalid or expired verification code" |
| Code expired | 400 | "Invalid or expired verification code" |
| Weak password | 400 | "Password must be at least 8 characters long" |

## Security Features

✅ Code expires after 10 minutes
✅ One-time use codes
✅ Email verification required
✅ Password hashing (bcrypt)
✅ Prevents duplicate registrations
✅ Rate limiting recommended

## Testing

Run the test:
```bash
node test-email-verification-signup.js
```

Check server logs for the verification code during development.

## Migration from Old Signup

The old `/api/auth/register` endpoint still works for backward compatibility, but new apps should use the 2-step verification flow.

## Email Template

Users receive a beautiful email with:
- Welcome message
- 6-digit code (large, easy to read)
- 10-minute expiration notice
- PCOS Tracker branding

---

**Your signup is now more secure with email verification! 🔒**
