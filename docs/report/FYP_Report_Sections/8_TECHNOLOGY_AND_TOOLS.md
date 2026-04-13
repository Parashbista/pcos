# 8. TECHNOLOGY AND TOOLS USED

## 8.1 Technology Selection Justification

### 8.1.1 React Native with Expo
React Native was selected to enable cross-platform development for both iOS and Android from a single codebase, reducing development time by approximately 60% compared to native development. Expo was chosen for its managed workflow, providing essential features (camera, notifications, file system) without complex native configuration, enabling rapid prototyping and testing via Expo Go.

### 8.1.2 TypeScript
TypeScript was implemented across both frontend and backend to provide compile-time type checking, preventing runtime errors in a healthcare application handling sensitive data. This ensured early detection of data structure mismatches and improved code maintainability for solo development.

### 8.1.3 Node.js with Express.js
Node.js with Express.js maintained full-stack JavaScript/TypeScript consistency, reducing context switching and enabling code reuse. The non-blocking I/O model suited the application's I/O-heavy operations (database queries, API calls, email sending), while Express.js provided a lightweight framework for custom MVC architecture.

### 8.1.4 MongoDB Atlas
MongoDB was selected for its schema flexibility, allowing field additions without migrations during iterative development. The document-based structure naturally accommodated nested health data (period entries, mood factors, sleep quality), and Atlas provided managed hosting with automatic backups and security features.

### 8.1.5 JWT Authentication
JWT with bcryptjs provided stateless authentication suitable for mobile applications, allowing local authentication state without constant server communication. Google OAuth integration reduced signup friction and eliminated password management concerns.

### 8.1.6 Axios
Axios was chosen for its automatic request/response transformation, interceptor support for global authentication tokens, and superior error handling compared to fetch API, reducing code duplication across API calls.

## 8.2 Programming Languages and Frameworks

**Programming Language:** TypeScript 5.9.x (frontend and backend) for type safety and reduced runtime errors.

**Frontend Framework:**
- React Native 0.81.5 - Cross-platform mobile framework
- Expo SDK 54.0.0 - Managed workflow with pre-built native modules
- React Navigation 7.x - Screen navigation and routing
- NativeWind - Tailwind CSS for React Native styling

**Backend Framework:**
- Node.js - JavaScript runtime environment
- Express.js 5.1.0 - RESTful API framework with middleware support
- Express Validator 7.3.1 - Input validation and sanitization

## 8.3 Development Tools

**IDE:** Visual Studio Code - TypeScript support, integrated terminal, Git integration, and React Native debugging.

**Version Control:** Git with GitHub for source code management, issue tracking, and sprint planning.

**API Testing:** Postman for endpoint testing, API documentation, and request collections.

**Database Management:** MongoDB Compass for visual schema exploration, query testing, and data management.

## 8.4 UI/UX Design Elements

**Icon Package:** Lucide React Native 0.555.0 - Modern, tree-shakeable icon library with extensive health tracking icons (calendar, heart, moon, pill).

**Typography:** Native platform fonts (San Francisco on iOS, Roboto on Android) for platform consistency and reduced bundle size.

**Styling:** NativeWind with Tailwind CSS 3.4.0 for utility-first styling and consistent design system.

## 8.5 Testing Frameworks

**Unit Testing:** Jest 29.7.0 with ts-jest 29.4.6 for TypeScript support, built-in mocking, and code coverage reporting.

**Integration Testing:** Supertest 7.1.4 for HTTP assertion testing of Express.js APIs without starting actual server.

**Test Organization:**
- Unit tests (`tests/unit/`) - Individual functions and utilities
- Integration tests (`tests/integration/`) - API endpoints with database interactions

## 8.6 Package Manager and Build Tools

**Package Manager:** NPM (Node Package Manager) for dependency management, script execution, and security audits.

**Build Tools:**
- TypeScript Compiler (tsc) - Transpiles TypeScript to JavaScript
- ts-node 10.9.2 - Direct TypeScript execution during development
- Nodemon 3.1.11 - Auto-restart server on file changes

**Code Quality:**
- ESLint 9.25.1 - Code linting and static analysis
- Prettier 3.2.5 - Automatic code formatting
- prettier-plugin-tailwindcss 0.5.11 - Tailwind class sorting

**Environment Configuration:** dotenv 17.2.3 for environment variable management and secure credential storage.

## 8.7 Key Libraries

**Authentication & Security:**
- bcryptjs 3.0.3 - Password hashing
- jsonwebtoken 9.0.2 - JWT token generation
- google-auth-library 10.5.0 - Google OAuth

**Communication:**
- Nodemailer 7.0.11 - Email notifications
- axios 1.13.2 - HTTP client with interceptors
- cors 2.8.5 - Cross-origin resource sharing

**Mobile Features:**
- @react-native-async-storage/async-storage 2.2.0 - Persistent storage
- @react-native-community/datetimepicker 8.5.1 - Date/time picker
- expo-notifications 0.32.13 - Push notifications
- expo-image-picker 17.0.9 - Camera and gallery access
- expo-file-system 19.0.20 - File system operations
- react-native-calendars 1.1313.0 - Calendar visualization

**Database:**
- mongodb 7.0.0 - Official MongoDB driver

## 8.8 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React Native | 0.81.5 | Cross-platform mobile UI |
| Frontend Platform | Expo | 54.0.0 | Development tooling |
| Language | TypeScript | 5.9.x | Type-safe code |
| Backend Framework | Express.js | 5.1.0 | RESTful API |
| Backend Runtime | Node.js | LTS | Server execution |
| Database | MongoDB Atlas | 7.0 | NoSQL database |
| Authentication | JWT + bcrypt | 9.0.2 / 3.0.3 | User authentication |
| Testing | Jest | 29.7.0 | Unit/integration testing |
| Package Manager | NPM | Latest | Dependency management |
| Version Control | Git + GitHub | Latest | Source control |
| IDE | VS Code | Latest | Development environment |