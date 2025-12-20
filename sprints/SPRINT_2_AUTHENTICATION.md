# SPRINT 2: Foundation & Authentication
**Duration:** Nov 17, 2025 - Nov 30, 2025 (2 weeks)  
**Goal:** Backend setup, user authentication, basic profile management  
**Total Story Points:** 22

## Tasks from Gantt Chart:
- Set Up Backend Server & Database (Nov 17 - Nov 21)
- Implement User Registration & Login (Nov 19 - Nov 24)
- Develop Basic User Profile Management (Nov 24 - Nov 27)
- Testing (Nov 27 - Nov 30)

---

---

## PCOS-4: User Registration API
**Type:** Story | **Priority:** Highest | **Points:** 5

**User Story:**  
As a new user, I want to create an account with my email and password so that I can access the app's features.

**Acceptance Criteria:**
- [ ] POST /api/auth/register endpoint created
- [ ] Request validation using express-validator:
  - Name: required, min 2 chars
  - Email: required, valid format, unique
  - Password: required, min 8 chars
- [ ] Password hashed using bcrypt (salt rounds: 10)
- [ ] User document created in MongoDB users collection
- [ ] JWT token generated (expires in 7 days)
- [ ] Response includes token and user object (no password)
- [ ] Proper error responses (400, 409, 500)

**API Contract:**
```
POST /api/auth/register
Headers: Content-Type: application/json

Request Body:
{
  "name": "string",
  "email": "string", 
  "password": "string"
}

Success Response (201):
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com"
  }
}

Error Response (400):
{
  "error": "Validation failed",
  "details": [{ "field": "email", "message": "Invalid email format" }]
}

Error Response (409):
{
  "error": "Email already registered"
}
```

---

## PCOS-5: User Login API
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a registered user, I want to log in with my email and password so that I can access my personal data.

**Acceptance Criteria:**
- [ ] POST /api/auth/login endpoint created
- [ ] Email and password validation
- [ ] Find user by email in database
- [ ] Compare password with bcrypt
- [ ] Generate JWT token on success
- [ ] Return token and user data
- [ ] Return 401 for invalid credentials

**API Contract:**
```
POST /api/auth/login
Headers: Content-Type: application/json

Request Body:
{
  "email": "string",
  "password": "string"
}

Success Response (200):
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@email.com"
  }
}

Error Response (401):
{
  "error": "Invalid email or password"
}
```

---

## PCOS-6: Registration Screen (Frontend)
**Type:** Story | **Priority:** Highest | **Points:** 5

**User Story:**  
As a new user, I want a registration form so that I can create my account easily.

**Acceptance Criteria:**
- [ ] Screen layout with app branding/header
- [ ] Form fields:
  - Full Name (TextInput)
  - Email (TextInput, keyboardType: email-address)
  - Password (TextInput, secureTextEntry)
  - Confirm Password (TextInput, secureTextEntry)
- [ ] Password visibility toggle (eye icon)
- [ ] Real-time validation:
  - Name required
  - Valid email format
  - Password min 8 characters
  - Passwords match
- [ ] Validation error messages below fields
- [ ] Register button (disabled when invalid)
- [ ] Loading spinner during API call
- [ ] API error display (Alert or inline)
- [ ] On success: store token, navigate to Home
- [ ] "Already have an account? Login" link

**UI/UX Notes:**
- Pink/purple theme consistent with app
- Rounded input fields
- Clear visual feedback on errors

---

## PCOS-7: Login Screen (Frontend)
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a registered user, I want a login form so that I can access my account.

**Acceptance Criteria:**
- [ ] Screen layout with app branding
- [ ] Form fields:
  - Email (TextInput)
  - Password (TextInput, secureTextEntry)
- [ ] Password visibility toggle
- [ ] Form validation
- [ ] Login button with loading state
- [ ] Error message display
- [ ] On success: store token, navigate to Home
- [ ] "Don't have an account? Register" link
- [ ] "Forgot Password?" link

---

## PCOS-10: Auth Context & Token Management
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a user, I want my login state to persist so that I don't have to log in every time I open the app.

**Acceptance Criteria:**
- [ ] AuthContext.tsx created with React Context
- [ ] Context provides:
  - user: User | null
  - token: string | null
  - isLoading: boolean
  - isAuthenticated: boolean
  - login(email, password): Promise
  - register(name, email, password): Promise
  - logout(): void
- [ ] Token stored in AsyncStorage on login/register
- [ ] Token loaded from AsyncStorage on app start
- [ ] Auto-login if valid token exists
- [ ] Logout clears AsyncStorage and resets state
- [ ] API service (api.ts) with axios interceptor:
  - Adds Authorization header automatically
  - Handles 401 responses (logout user)

**Technical Notes:**
```typescript
// AuthContext state
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

---

## PCOS-T2: Test Authentication Flow
**Type:** Test | **Priority:** Highest | **Points:** 3

**Test Cases:**
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Register - valid data | Enter valid name, email, password | Account created, redirected to Home | ☐ |
| 2 | Register - existing email | Use already registered email | Error: "Email already registered" | ☐ |
| 3 | Register - invalid email | Enter "notanemail" | Validation error shown | ☐ |
| 4 | Register - weak password | Enter "123" as password | Validation error: min 8 chars | ☐ |
| 5 | Register - password mismatch | Different password/confirm | Validation error: passwords don't match | ☐ |
| 6 | Login - valid credentials | Enter correct email/password | Logged in, redirected to Home | ☐ |
| 7 | Login - wrong password | Enter incorrect password | Error: "Invalid email or password" | ☐ |
| 8 | Login - non-existent email | Enter unregistered email | Error: "Invalid email or password" | ☐ |
| 9 | Token persistence | Login, close app, reopen | Still logged in (auto-login) | ☐ |
| 10 | Logout | Tap logout button | Token cleared, redirected to Login | ☐ |
| 11 | Protected route | Access Home without login | Redirected to Login screen | ☐ |
| 12 | API auth header | Make authenticated request | Token included in header | ☐ |

---

## Sprint 2 Deliverables Checklist
- [ ] Registration API working
- [ ] Login API working
- [ ] Registration screen complete
- [ ] Login screen complete
- [ ] Auth context managing state
- [ ] Token persistence working
- [ ] All test cases passing
- [ ] Code reviewed and merged
- [ ] Sprint demo ready
