# SPRINT 1: Project Initiation & Planning
**Duration:** Nov 3, 2025 - Nov 17, 2025 (2 weeks)  
**Goal:** Requirements analysis, tech stack setup, UI/UX design, version control  
**Total Story Points:** 9

## Tasks from Gantt Chart:
- Requirement Analysis & Finalize Feature List (Nov 3 - Nov 6)
- Choose Tech Stack & Architecture Design (Nov 6 - Nov 9)
- Create UI/UX Wireframes & Prototype (Nov 8 - Nov 10)
- Set Up Version Control & Project Management (Nov 12 - Nov 17)

---

---

## PCOS-1: Initialize React Native Expo Project
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a developer, I want a properly configured React Native Expo project so that I can start building the mobile application.

**Acceptance Criteria:**
- [ ] Expo project initialized with TypeScript template
- [ ] NativeWind/TailwindCSS configured for styling
- [ ] ESLint and Prettier configured
- [ ] Project runs on iOS simulator and Android emulator
- [ ] Folder structure created:
  - screens/
  - components/
  - services/
  - navigation/
  - contexts/
  - constants/
  - config/

**Technical Notes:**
- Use Expo SDK 54+
- Install: nativewind, tailwindcss, lucide-react-native
- Configure babel.config.js and tailwind.config.js

---

## PCOS-2: Initialize Backend Node.js Project
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a developer, I want a properly configured backend server so that I can build REST APIs.

**Acceptance Criteria:**
- [ ] Express.js server initialized with TypeScript
- [ ] MongoDB connection configured and tested
- [ ] Environment variables setup (.env, .env.example)
- [ ] CORS configured for mobile app access
- [ ] Folder structure created:
  - controllers/
  - routes/
  - models/
  - services/
  - middleware/
  - utils/
  - config/
- [ ] Server runs successfully on port 5000

**Technical Notes:**
- Express 5.x, TypeScript, MongoDB driver
- Install: bcryptjs, jsonwebtoken, cors, dotenv
- Configure nodemon for hot reload

---

## PCOS-3: Configure Navigation Structure
**Type:** Story | **Priority:** High | **Points:** 2

**User Story:**  
As a user, I want seamless navigation between screens.

**Acceptance Criteria:**
- [ ] React Navigation installed (@react-navigation/native, @react-navigation/native-stack)
- [ ] RootNavigator switching between Auth and Main stacks
- [ ] Auth Stack screens: Login, Register, ForgotPassword
- [ ] Main Stack screens: Home (placeholder for now)
- [ ] Navigation types defined in TypeScript (types.ts)
- [ ] Safe area handling configured

**Technical Notes:**
- Install react-native-screens, react-native-safe-area-context
- Create navigation/index.ts, AuthStack.tsx, MainStack.tsx, RootNavigator.tsx

---

## PCOS-T1: Test Project Setup
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Run `npm start` in frontend | Expo dev server starts | ☐ |
| 2 | Open app on iOS simulator | App loads without crash | ☐ |
| 3 | Open app on Android emulator | App loads without crash | ☐ |
| 4 | Run `npm run dev` in backend | Server starts on port 5000 | ☐ |
| 5 | Backend connects to MongoDB | "Connected to MongoDB" logged | ☐ |
| 6 | Navigate between Auth screens | Navigation works smoothly | ☐ |
| 7 | Hot reload on frontend | Changes reflect immediately | ☐ |
| 8 | Hot reload on backend | Server restarts on file save | ☐ |

---

## Sprint 1 Deliverables Checklist
- [ ] Frontend project running
- [ ] Backend server running
- [ ] MongoDB connected
- [ ] Navigation structure in place
- [ ] Code pushed to repository
- [ ] Sprint demo ready
