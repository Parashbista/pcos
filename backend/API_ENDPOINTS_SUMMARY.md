# API Endpoints Summary

## Authentication Endpoints

### New Email Verification Signup (Recommended)

#### 1. Request Verification Code
```
POST /api/auth/request-verification
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

#### 2. Verify and Register
```
POST /api/auth/verify-and-register
```
**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "password123",
  "name": "John Doe"
}
```

### Existing Endpoints

#### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register (Old Method - Still Works)
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

#### Reset Password
```
POST /api/auth/reset-password
```
**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

#### Change Password (Requires Auth)
```
POST /api/auth/change-password
Headers: Authorization: Bearer <token>
```
**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Update Profile (Requires Auth)
```
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
```
**Body:**
```json
{
  "name": "New Name"
}
```

#### Google Sign-In
```
POST /api/auth/google
```
**Body:**
```json
{
  "idToken": "google_id_token_here"
}
```

## What Changed?

✅ Added email verification for signup
✅ 2-step registration process
✅ More secure user onboarding
✅ Old endpoints still work (backward compatible)

## Next Steps for Frontend

1. Update signup screen to use 2-step flow
2. Add verification code input screen
3. Handle email sending confirmation
4. Show code expiration timer (10 minutes)
