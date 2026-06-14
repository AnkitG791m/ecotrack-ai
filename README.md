# 🌍 EcoTrack AI - Smart Carbon Footprint Assistant

> An AI-powered platform that helps users track, understand, 
> and reduce their carbon footprint through intelligent 
> recommendations and gamified sustainability challenges.

## 🌐 Live Platform (GCP Cloud Run)
* **Frontend Web App**: [https://ecotrack-frontend-882111542264.us-central1.run.app](https://ecotrack-frontend-882111542264.us-central1.run.app)
* **Backend API Server**: [https://ecotrack-backend-882111542264.us-central1.run.app](https://ecotrack-backend-882111542264.us-central1.run.app)


## 🎯 Challenge Vertical
**Smart Dynamic Assistant** - EcoTrack AI acts as a personal 
environmental consultant that understands user context 
(lifestyle, location, habits) and provides personalized, 
actionable recommendations to reduce carbon footprint.

## 🧠 How the Assistant Works
1. User inputs daily activities (transport, energy, food, waste)
2. AI calculates precise carbon footprint using scientific coefficients
3. Gemini AI analyzes patterns and generates personalized recommendations
4. Assistant adapts advice based on user's history and progress
5. Gamification (points, badges, challenges) keeps users engaged

## ✨ Features
- 📊 Multi-step carbon calculator
- 🤖 AI-powered recommendations (Gemini API)
- 💬 Eco chatbot with conversation memory
- 📸 Waste image analyzer
- 🏆 Gamified leaderboard
- 👥 Community feed
- 📈 Progress tracking with charts
- 🎯 Daily challenges

## 🛠 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Framer Motion + Chart.js
- **Backend:** Node.js + Express + MongoDB Atlas
- **AI:** Google Gemini API (gemini-1.5-flash)
- **Auth:** Firebase Google Authentication
- **Deploy:** Google Cloud Run

## 🚀 Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in your env vars
npm start

# Frontend  
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables
See .env.example for required variables.
Never commit .env files!

## 🧪 Testing
```bash
cd backend
npm test
```

## 📁 Project Structure
```text
.
├── backend/
│   ├── config/
│   │   ├── constants.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── calculatorController.js
│   │   ├── challengeController.js
│   │   ├── communityController.js
│   │   ├── habitController.js
│   │   └── leaderboardController.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Achievement.js
│   │   ├── AIReport.js
│   │   ├── CarbonReport.js
│   │   ├── Challenge.js
│   │   ├── Comment.js
│   │   ├── Habit.js
│   │   ├── Leaderboard.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── calculatorRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── habitRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── tests/
│   │   └── api.test.js
│   ├── utils/
│   │   ├── carbonCalc.js
│   │   └── gemini.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CalculatorResults.jsx
    │   │   ├── ChatBot.jsx
    │   │   ├── GlassCard.jsx
    │   │   ├── ImageAnalyzer.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── TrackerOffsets.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminPanel.jsx
    │   │   ├── Calculator.jsx
    │   │   ├── Community.jsx
    │   │   ├── DailyChallenges.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── Leaderboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Recommendations.jsx
    │   │   ├── Register.jsx
    │   │   └── Tracker.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```
