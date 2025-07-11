import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ResponsiveProvider } from './contexts/ResponsiveContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PomodoroProvider } from './contexts/PomodoroContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SkillScan from './pages/SkillScan';
import AdaptiveSkillScan from './pages/AdaptiveSkillScan';
import PathwayGuide from './pages/PathwayGuide';
import LearningJourneys from './pages/LearningJourneys';
import LearningCircles from './pages/LearningCircles';
import Trajectory from './pages/Trajectory';
import MilestoneTracker from './pages/MilestoneTracker';
import PathwayAchievements from './pages/PathwayAchievements';
import NavigatorHub from './pages/NavigatorHub';
import CareerInsights from './pages/CareerInsights';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
};

function AppContent() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/skillscan" 
            element={
              <ProtectedRoute>
                <SkillScan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/talent-compass" 
            element={
              <ProtectedRoute>
                <AdaptiveSkillScan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pathway-guide" 
            element={
              <ProtectedRoute>
                <PathwayGuide />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning-journeys" 
            element={
              <ProtectedRoute>
                <LearningJourneys />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning-circles" 
            element={
              <ProtectedRoute>
                <LearningCircles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trajectory" 
            element={
              <ProtectedRoute>
                <Trajectory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/milestone-tracker" 
            element={
              <ProtectedRoute>
                <MilestoneTracker />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pathway-achievements" 
            element={
              <ProtectedRoute>
                <PathwayAchievements />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/navigator-hub" 
            element={
              <ProtectedRoute>
                <NavigatorHub />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/career-insights" 
            element={
              <ProtectedRoute>
                <CareerInsights />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy route redirects for backward compatibility */}
          <Route path="/adaptive-skillscan" element={<Navigate to="/talent-compass" replace />} />
          <Route path="/starmentor" element={<Navigate to="/pathway-guide" replace />} />
          <Route path="/galaxy-quests" element={<Navigate to="/learning-journeys" replace />} />
          <Route path="/learning-pods" element={<Navigate to="/learning-circles" replace />} />
          <Route path="/starrankings" element={<Navigate to="/milestone-tracker" replace />} />
          <Route path="/starbadges" element={<Navigate to="/pathway-achievements" replace />} />
          <Route path="/sos-station" element={<Navigate to="/navigator-hub" replace />} />
          <Route path="/mission-intel" element={<Navigate to="/career-insights" replace />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      
      {/* Toast notifications with dark minimalist theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '8px',
          },
          success: {
            style: {
              border: '1px solid #6b7280',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ResponsiveProvider>
        <AuthProvider>
          <PomodoroProvider>
            <AppContent />
          </PomodoroProvider>
        </AuthProvider>
      </ResponsiveProvider>
    </ThemeProvider>
  );
}

export default App;