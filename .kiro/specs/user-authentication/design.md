# Design Document

## Overview

The authentication system will be built with a RESTful API backend using Express.js and MongoDB, and a React Native frontend using Expo. The system will implement JWT-based authentication with secure password hashing using bcrypt. The design prioritizes simplicity, security, and clean user experience.

## Architecture

### System Architecture

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│                 │ ◄─────────────────────────► │                 │
│  Frontend App   │                             │  Backend API    │
│  (Expo/React    │                             │  (Express.js)   │
│   Native)       │                             │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │                 │
                                                │    MongoDB      │
                                                │                 │
                                                └─────────────────┘
```

### Technology Stack

**Backend:**
- Express.js 5.x for REST API
- MongoDB for data persistence
- bcryptjs for password hashing
- jsonwebtoken for JWT generation and verification
- express-validator for input validation
- cors for cross-origin requests

**Frontend:**
- Expo SDK 54
- React Native 0.81
- NativeWind (Tailwind CSS) for styling
- AsyncStorage for token persistence
- Axios for HTTP requests

## Components and Interfaces

### Backend Components

#### 1. Authentication Routes (`/api/auth`)

**POST /api/auth/register**
- Request Body:
  ```typescript
  {
    email: string;
    password: string;
    name?: string;
  }
  ```
- Response (201):
  ```typescript
  {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
    }
  }
  ```
- Error Responses: 400 (validation), 409 (duplicate email)

**POST /api/auth/login**
- Request Body:
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- Response (200):
  ```typescript
  {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
    }
  }
  ```
- Error Responses: 400 (validation), 401 (invalid credentials)

**POST /api/auth/change-password**
- Headers: `Authorization: Bearer <token>`
- Request Body:
  ```typescript
  {
    currentPassword: string;
    newPassword: string;
  }
  ```
- Response (200):
  ```typescript
  {
    message: string;
  }
  ```
- Error Responses: 400 (validation/wrong password), 401 (unauthorized)

#### 2. Authentication Middleware

**authMiddleware**
- Validates JWT token from Authorization header
- Attaches user information to request object
- Returns 401 if token is invalid or missing

#### 3. Authentication Controller

**registerUser**
- Validates input data
- Checks for existing email
- Hashes password with bcrypt (10 salt rounds)
- Creates user in database
- Generates JWT token
- Returns token and user data

**loginUser**
- Validates input data
- Finds user by email
- Compares password with bcrypt
- Generates JWT token
- Returns token and user data

**changePassword**
- Validates input data
- Verifies current password
- Hashes new password
- Updates user in database
- Returns success message

#### 4. User Service

**createUser(email, password, name?)**
- Creates new user document
- Returns user object

**findUserByEmail(email)**
- Queries database for user
- Returns user object or null

**updateUserPassword(userId, hashedPassword)**
- Updates user password
- Returns updated user

**comparePassword(plainPassword, hashedPassword)**
- Uses bcrypt to compare passwords
- Returns boolean

**generateToken(userId)**
- Creates JWT with user ID payload
- Sets expiration to 7 days
- Returns token string

### Frontend Components

#### 1. Authentication Screens

**RegisterScreen**
- Input fields: email, password, confirm password, name (optional)
- Submit button
- Link to login screen
- Loading state indicator
- Error message display

**LoginScreen**
- Input fields: email, password
- Submit button
- Link to register screen
- Loading state indicator
- Error message display

**ChangePasswordScreen**
- Input fields: current password, new password, confirm new password
- Submit button
- Back navigation
- Loading state indicator
- Error message display

#### 2. Authentication Service

**register(email, password, name?)**
- Makes POST request to /api/auth/register
- Stores token in AsyncStorage
- Returns user data

**login(email, password)**
- Makes POST request to /api/auth/login
- Stores token in AsyncStorage
- Returns user data

**changePassword(currentPassword, newPassword)**
- Gets token from AsyncStorage
- Makes POST request to /api/auth/change-password with Authorization header
- Returns success status

**logout()**
- Removes token from AsyncStorage

**getToken()**
- Retrieves token from AsyncStorage
- Returns token or null

#### 3. Authentication Context

**AuthContext**
- Provides authentication state (user, isAuthenticated, isLoading)
- Provides authentication methods (login, register, logout, changePassword)
- Manages token persistence
- Handles automatic logout on token expiration

## Data Models

### User Model (MongoDB)

```typescript
interface User {
  _id: ObjectId;
  email: string;          // unique, required, lowercase
  password: string;       // hashed with bcrypt, required
  name?: string;          // optional
  createdAt: Date;        // auto-generated
  updatedAt: Date;        // auto-generated
}
```

**Indexes:**
- email: unique index for fast lookups and constraint enforcement

**Validation:**
- email: valid email format, max 255 characters
- password: min 8 characters (before hashing)
- name: max 100 characters

### JWT Payload

```typescript
interface JWTPayload {
  userId: string;
  iat: number;           // issued at
  exp: number;           // expiration (7 days)
}
```

## Error Handling

### Backend Error Handling

**Validation Errors (400)**
- Invalid email format
- Password too short
- Missing required fields
- Malformed request body

**Authentication Errors (401)**
- Invalid credentials
- Missing token
- Expired token
- Invalid token signature

**Conflict Errors (409)**
- Email already registered

**Server Errors (500)**
- Database connection failures
- Unexpected errors

**Error Response Format:**
```typescript
{
  error: string;          // error message
  details?: string[];     // validation details (optional)
}
```

### Frontend Error Handling

**Network Errors**
- Display: "Unable to connect. Please check your internet connection."
- Retry option available

**Validation Errors**
- Display field-specific error messages
- Highlight invalid fields

**Authentication Errors**
- Display: "Invalid email or password"
- Clear password field

**Server Errors**
- Display: "Something went wrong. Please try again."
- Log error for debugging

## Security Considerations

1. **Password Security**
   - Minimum 8 characters
   - Hashed with bcrypt (10 salt rounds)
   - Never returned in API responses

2. **JWT Security**
   - Signed with secret key from environment variable
   - 7-day expiration
   - Stored securely in AsyncStorage (encrypted on device)

3. **Input Validation**
   - Server-side validation for all inputs
   - Email format validation
   - Password strength requirements

4. **CORS Configuration**
   - Allow requests from frontend origin only
   - Credentials included in requests

5. **Rate Limiting** (Future Enhancement)
   - Limit login attempts to prevent brute force attacks

## Testing Strategy

### Backend Testing

**Unit Tests**
- User service methods (create, find, update)
- Password hashing and comparison
- JWT generation and verification
- Input validation

**Integration Tests**
- Registration endpoint with valid/invalid data
- Login endpoint with correct/incorrect credentials
- Change password endpoint with valid token
- Authentication middleware

### Frontend Testing

**Component Tests**
- Form validation
- Error message display
- Loading states
- Navigation between screens

**Integration Tests**
- Complete registration flow
- Complete login flow
- Complete change password flow
- Token persistence and retrieval

### Manual Testing

- Test on iOS and Android devices
- Test with various screen sizes
- Test network error scenarios
- Test token expiration handling

## UI Design Guidelines

### Design Principles

1. **Simplicity**: Minimal, distraction-free interfaces
2. **Clarity**: Clear labels and error messages
3. **Consistency**: Uniform styling across all screens
4. **Accessibility**: Proper contrast ratios and touch targets

### Visual Style

**Colors:**
- Primary: Blue (#3B82F6)
- Error: Red (#EF4444)
- Success: Green (#10B981)
- Background: White (#FFFFFF)
- Text: Dark Gray (#1F2937)
- Input Border: Light Gray (#D1D5DB)

**Typography:**
- Headings: 24px, bold
- Body: 16px, regular
- Labels: 14px, medium
- Errors: 14px, regular, red

**Spacing:**
- Screen padding: 20px
- Input spacing: 16px
- Button height: 48px
- Border radius: 8px

### Screen Layouts

**Common Elements:**
- Centered content with max width
- Large, tappable buttons
- Clear visual hierarchy
- Consistent spacing

**Input Fields:**
- Label above input
- Border on all sides
- Focus state with blue border
- Error state with red border and message below

**Buttons:**
- Full width
- Primary color background
- White text
- Disabled state with reduced opacity
- Loading spinner when processing

## Implementation Notes

1. **Environment Variables**
   - Backend: JWT_SECRET, MONGODB_URI, PORT
   - Frontend: API_BASE_URL

2. **Database Connection**
   - Use connection pooling
   - Handle connection errors gracefully
   - Implement retry logic

3. **API Base URL Configuration**
   - Development: http://localhost:3000
   - Production: Environment-specific URL

4. **Token Refresh** (Future Enhancement)
   - Implement refresh token mechanism
   - Auto-refresh before expiration

5. **Password Reset** (Future Enhancement)
   - Email-based password reset flow
   - Temporary reset tokens
