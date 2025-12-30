# PCOS Tracker - Backend Testing Guide

## 📋 Test Structure

```
backend/tests/
├── setup.ts                    # Test configuration
├── unit/                       # Unit tests
│   ├── password.util.test.ts   # Password hashing tests
│   └── jwt.util.test.ts        # JWT token tests
└── integration/                # API endpoint tests
    ├── health.test.ts          # Health check endpoint
    ├── auth.test.ts            # Authentication endpoints
    ├── mood.test.ts            # Mood tracking endpoints
    ├── sleep.test.ts           # Sleep tracking endpoints
    └── period.test.ts          # Period tracking endpoints
```

## 🚀 Running Tests

### Install Dependencies
```bash
cd backend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## 📊 Test Coverage

| Module | Unit Tests | Integration Tests | Total |
|--------|------------|-------------------|-------|
| Password Utility | 4 | - | 4 |
| JWT Utility | 5 | - | 5 |
| Health Check | - | 3 | 3 |
| Authentication | - | 15 | 15 |
| Mood Tracking | - | 6 | 6 |
| Sleep Tracking | - | 6 | 6 |
| Period Tracking | - | 7 | 7 |
| **Total** | **9** | **37** | **46** |

## 🧪 Test Cases Summary

### Unit Tests

#### Password Utility (4 tests)
- ✅ Hash password successfully
- ✅ Generate different hashes for same password
- ✅ Compare matching passwords
- ✅ Compare non-matching passwords

#### JWT Utility (5 tests)
- ✅ Generate valid JWT token
- ✅ Generate different tokens for different users
- ✅ Verify valid token
- ✅ Reject invalid token
- ✅ Reject tampered token

### Integration Tests

#### Authentication (15 tests)
- ✅ TC-AUTH-001: Register with valid data
- ✅ TC-AUTH-002: Fail registration with existing email
- ✅ TC-AUTH-003: Fail registration with invalid email
- ✅ TC-AUTH-004: Fail registration with short password
- ✅ TC-AUTH-005: Fail registration without email
- ✅ TC-AUTH-006: Login with valid credentials
- ✅ TC-AUTH-007: Fail login with wrong password
- ✅ TC-AUTH-008: Fail login with non-existent email
- ✅ TC-AUTH-009: Fail login with empty password
- ✅ TC-AUTH-010: Fail login with invalid email format
- ✅ TC-AUTH-011: Change password with valid token
- ✅ TC-AUTH-012: Fail change password without token
- ✅ TC-AUTH-013: Fail change password with invalid token
- ✅ TC-AUTH-014: Send OTP for valid email
- ✅ TC-AUTH-015: Fail with invalid email format

#### Mood Tracking (6 tests)
- ✅ TC-MOOD-001: Create mood entry
- ✅ TC-MOOD-002: Fail without authentication
- ✅ TC-MOOD-003: Fail with invalid mood level
- ✅ TC-MOOD-004: Get all mood entries
- ✅ TC-MOOD-005: Fail get without authentication
- ✅ TC-MOOD-006: Get mood statistics

#### Sleep Tracking (6 tests)
- ✅ TC-SLEEP-001: Create sleep entry
- ✅ TC-SLEEP-002: Fail without authentication
- ✅ TC-SLEEP-003: Fail with invalid quality
- ✅ TC-SLEEP-004: Get all sleep entries
- ✅ TC-SLEEP-005: Fail get without authentication
- ✅ TC-SLEEP-006: Get sleep statistics

#### Period Tracking (7 tests)
- ✅ TC-PERIOD-001: Create period entry
- ✅ TC-PERIOD-002: Fail without authentication
- ✅ TC-PERIOD-003: Fail with invalid flow intensity
- ✅ TC-PERIOD-004: Get all period entries
- ✅ TC-PERIOD-005: Fail get without authentication
- ✅ TC-PERIOD-006: Update period with end date
- ✅ TC-PERIOD-007: Get cycle predictions

## ⚙️ Prerequisites

1. **MongoDB** must be running locally or provide test database URI
2. **Node.js** v18+ installed
3. **Environment** file `.env.test` configured

## 📝 Notes

- Integration tests require a running MongoDB instance
- Tests create temporary test users that should be cleaned up
- Use `--runInBand` flag to run tests sequentially
- Test database should be separate from production

---

*Testing documentation for PCOS Tracker Backend*
