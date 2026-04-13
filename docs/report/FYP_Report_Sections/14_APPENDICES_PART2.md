# 14. APPENDICES (Part 2)

## Appendix D: API Documentation

### D.1 Authentication Endpoints

**POST /api/auth/register**

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Jane Doe"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "Jane Doe",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: Validation error (invalid email, weak password)
- 409: Email already exists

---

**POST /api/auth/login**

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 404: User not found

---

**POST /api/auth/forgot-password**

Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

