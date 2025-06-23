import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SkillScan from './pages/SkillScan';
import AdaptiveSkillScan from './pages/AdaptiveSkillScan';
import StarMentor from './pages/StarMentor';
import GalaxyQuests from './pages/GalaxyQuests';
import LearningPods from './pages/LearningPods';
import Trajectory from './pages/Trajectory';
import StarRankings from './pages/StarRankings';
import StarBadges from './pages/StarBadges';
import SOSStation from './pages/SOSStation';
import MissionIntel from './pages/MissionIntel';
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
            path="/adaptive-skillscan" 
            element={
              <ProtectedRoute>
                <AdaptiveSkillScan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/starmentor" 
            element={
              <ProtectedRoute>
                <StarMentor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/galaxy-quests" 
            element={
              <ProtectedRoute>
                <GalaxyQuests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning-pods" 
            element={
              <ProtectedRoute>
                <LearningPods />
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
            path="/starrankings" 
            element={
              <ProtectedRoute>
                <StarRankings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/starbadges" 
            element={
              <ProtectedRoute>
                <StarBadges />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sos-station" 
            element={
              <ProtectedRoute>
                <SOSStation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mission-intel" 
            element={
              <ProtectedRoute>
                <MissionIntel />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #333',
          },
          success: {
            style: {
              border: '1px solid #4CAF50',
            },
          },
          error: {
            style: {
              border: '1px solid #ff4444',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;