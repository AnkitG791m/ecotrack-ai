import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages (Static imports)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages (Lazy loaded)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Tracker = lazy(() => import('./pages/Tracker'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const DailyChallenges = lazy(() => import('./pages/DailyChallenges'));
const Community = lazy(() => import('./pages/Community'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        }>
          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/" element={<LandingPage />} />
            
            <Route 
              path="/login" 
              element={
                <div className="flex flex-col min-h-screen">
                  <Layout>
                    <Login />
                  </Layout>
                </div>
              } 
            />
            <Route 
              path="/register" 
              element={
                <div className="flex flex-col min-h-screen">
                  <Layout>
                    <Register />
                  </Layout>
                </div>
              } 
            />

            {/* Protected Application Pages inside global Shell Layout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calculator />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tracker" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tracker />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Recommendations />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/challenges" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <DailyChallenges />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Community />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Leaderboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Restricted Page */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
