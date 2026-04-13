# PCOS Health Tracking App

A comprehensive mobile health application for PCOS (Polycystic Ovary Syndrome) management, built with React Native (Expo) and Node.js.

## 📱 Features

- **Period Tracking**: Track menstrual cycles with calendar visualization
- **Mood & Sleep Monitoring**: Log daily mood and sleep patterns
- **Symptom Tracking**: Record PCOS-related symptoms
- **Medication Reminders**: Set and manage medication schedules
- **AI Chatbot**: Get personalized health insights and support
- **Moodboard**: Visual mood tracking with image uploads
- **Partner Sharing**: Share health data with healthcare providers or partners
- **Data Export**: Export health data for medical consultations
- **Profile Management**: Manage personal health information

## 🏗️ Project Structure

```
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth & validation
│   │   └── config/       # Configuration files
│   └── tests/            # Unit & integration tests
│
├── frontend/             # React Native (Expo) app
│   └── my-expo-app/
│       ├── screens/      # App screens
│       ├── components/   # Reusable components
│       ├── navigation/   # Navigation setup
│       ├── services/     # API services
│       ├── config/       # App configuration
│       └── constants/    # Theme & constants
│
└── docs/                 # Documentation
    ├── report/           # FYP report sections
    ├── sprints/          # Sprint documentation
    ├── PROTOTYPE_DOCUMENTATION.md
    ├── LOGSHEETS.md
    └── MILESTONE_4_PROFESSIONALISM_REPORT.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Expo Go app (for mobile testing)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend/my-expo-app
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo:
```bash
npm start
```

4. Scan QR code with Expo Go app on your phone

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test                  # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # With coverage report
```

## 🔧 Tech Stack

### Backend
- Node.js + Express
- MongoDB (Atlas)
- JWT Authentication
- Nodemailer (Email service)
- Google Gemini AI
- Jest (Testing)

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation
- Axios
- NativeWind (Tailwind CSS)
- Expo Notifications
- React Native Calendars

## 📝 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Health Data
- `GET /periods` - Get period records
- `POST /periods` - Log period
- `GET /moods` - Get mood entries
- `POST /moods` - Log mood
- `GET /symptoms` - Get symptoms
- `POST /symptoms` - Log symptom

### AI Features
- `POST /ai/chat` - Chat with AI assistant
- `POST /ai/analyze` - Analyze health data

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- Input validation & sanitization
- CORS configuration

## 📄 License

This project is part of a Final Year Project (FYP) for academic purposes.

## 👤 Author

**Parash Bista**
- Student ID: np03cs4a230009
- Email: parashbista234@gmail.com

## 🙏 Acknowledgments

- Herald College Kathmandu
- Project Supervisor
- MongoDB Atlas
- Google Gemini AI
