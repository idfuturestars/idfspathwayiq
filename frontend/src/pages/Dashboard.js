import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import axios from 'axios';
import {
  HomeIcon,
  TrophyIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  StarIcon,
  FireIcon,
  LightBulbIcon,
  PlayIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  MapIcon,
  MicrophoneIcon,
  ClockIcon,
  SwatchIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import VoiceToTextLearning from '../components/VoiceToTextLearning';
import HabitTracker from '../components/HabitTracker';
import EmergencyHelpButton from '../components/EmergencyHelpButton';
import LearningBattles from '../components/LearningBattles';
import VirtualClassroomPet from '../components/VirtualClassroomPet';
import ProgressCelebrations from '../components/ProgressCelebrations';
import StudyJournal from '../components/StudyJournal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, changeTheme, availableThemes } = useTheme();
  const { 
    timeLeft, 
    isActive, 
    completedSessions, 
    formatTime, 
    startTimer, 
    pauseTimer, 
    mode, 
    TIMER_MODES 
  } = usePomodoro();
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Start Learning Journey',
      description: 'Begin a new pathway or continue where you left off',
      icon: PlayIcon,
      color: 'bg-gray-600',
      action: () => navigate('/learning-journeys'),
    },
    {
      title: 'Take Assessment',
      description: 'Discover your talents with Talent Compass™',
      icon: LightBulbIcon,
      color: 'bg-gray-500',
      action: () => navigate('/talent-compass'),
    },
    {
      title: 'Join Learning Circle',
      description: 'Connect with fellow learners in your field',
      icon: UserGroupIcon,
      color: 'bg-gray-700',
      action: () => navigate('/learning-circles'),
    },
    {
      title: 'Get Guidance',
      description: 'Chat with your Pathway Guide for personalized advice',
      icon: StarIcon,
      color: 'bg-gray-800',
      action: () => navigate('/pathway-guide'),
    },
  ];

  const achievements = [
    { name: 'First Steps', icon: '🚀', rarity: 'common', earned: true },
    { name: 'Knowledge Seeker', icon: '📚', rarity: 'common', earned: true },
    { name: 'Pathway Navigator', icon: '🗺️', rarity: 'rare', earned: false },
    { name: 'Skill Master', icon: '👑', rarity: 'epic', earned: false },
  ];

  const recentActivities = [
    { type: 'pathway', title: 'Completed JavaScript Fundamentals', time: '2 hours ago', points: 50 },
    { type: 'achievement', title: 'Earned "Code Explorer" achievement', time: '1 day ago', points: 100 },
    { type: 'circle', title: 'Joined Python Learning Circle', time: '2 days ago', points: 25 },
    { type: 'guidance', title: 'Asked Pathway Guide about career options', time: '3 days ago', points: 10 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-300 text-lg">
              Ready to continue your learning pathway?
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-400">{user?.level}</p>
                <p className="text-sm text-gray-400">Level</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-300">{user?.xp}</p>
                <p className="text-sm text-gray-400">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-500">{analytics?.user_stats?.study_groups || 0}</p>
                <p className="text-sm text-gray-400">Circles</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress to Level {user?.level + 1}</span>
            <span className="text-white">{user?.xp % 100}/100 Points</span>
          </div>
          <div className="progress-bar">
            <div 
              className="bg-gray-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(user?.xp % 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="starguide-card hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="starguide-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Modules Completed</p>
                <p className="text-3xl font-bold text-white">{analytics?.user_stats?.total_questions || 0}</p>
              </div>
              <BookOpenIcon className="w-12 h-12 text-gray-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-400">↗ {analytics?.user_stats?.accuracy_rate || 0}%</span>
                <span className="text-gray-400 ml-2">completion rate</span>
              </div>
            </div>
          </div>

          <div className="starguide-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Study Time</p>
                <p className="text-3xl font-bold text-white">{analytics?.user_stats?.total_study_time || 0}h</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-gray-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <FireIcon className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-400">{user?.streak_days || 0} day streak</span>
              </div>
            </div>
          </div>

          <div className="starguide-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Achievements</p>
                <p className="text-3xl font-bold text-white">{analytics?.user_stats?.badges_earned || 0}</p>
              </div>
              <TrophyIcon className="w-12 h-12 text-gray-500" />
            </div>
            <div className="mt-4">
              <button 
                onClick={() => navigate('/pathway-achievements')}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                View all achievements →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`starguide-card text-center ${
                achievement.earned ? 'border-gray-600' : 'opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{achievement.name}</h3>
              <span className={`badge ${
                achievement.rarity === 'epic' ? 'bg-white text-black' :
                achievement.rarity === 'rare' ? 'bg-gray-400 text-black' :
                'bg-gray-600 text-white'
              }`}>
                {achievement.rarity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="starguide-card">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    activity.type === 'pathway' ? 'bg-gray-500' :
                    activity.type === 'achievement' ? 'bg-gray-400' :
                    activity.type === 'circle' ? 'bg-gray-600' : 'bg-gray-700'
                  }`}></div>
                  <div>
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-semibold">+{activity.points} Points</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/trajectory')}
              className="btn-secondary"
            >
              View Full History
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Pathways */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4">Continue Learning</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">JavaScript Advanced Concepts</span>
                <button className="btn-primary text-sm px-3 py-1">Continue</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">React Development Pathway</span>
                <button className="btn-secondary text-sm px-3 py-1">Start</button>
              </div>
            </div>
          </div>

          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4">Join Learning Circles</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-gray-300">Python Career Track</p>
                  <p className="text-gray-500 text-sm">24 members</p>
                </div>
                <button className="btn-primary text-sm px-3 py-1">Join</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-gray-300">Web Development Circle</p>
                  <p className="text-gray-500 text-sm">156 members</p>
                </div>
                <button className="btn-secondary text-sm px-3 py-1">Join</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pathway Categories */}
      <div className="starguide-card">
        <h2 className="text-2xl font-bold text-white mb-6">🗺️ Explore Pathways</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Academic Pathways',
              description: 'K-12, College Prep, Graduate Studies',
              icon: AcademicCapIcon,
              count: '15+ pathways'
            },
            {
              title: 'Career Pathways',
              description: 'Professional skills and industry training',
              icon: BriefcaseIcon,
              count: '25+ pathways'
            },
            {
              title: 'Skill Development',
              description: 'Programming, Design, Data Science',
              icon: BookOpenIcon,
              count: '30+ pathways'
            }
          ].map((pathway, index) => (
            <button 
              key={index}
              onClick={() => navigate('/learning-journeys')}
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors text-left"
            >
              <pathway.icon className="w-8 h-8 text-gray-400 mb-3" />
              <h3 className="font-semibold text-white mb-2">{pathway.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{pathway.description}</p>
              <span className="text-gray-500 text-sm">{pathway.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="starguide-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🚀 Enhanced Features</h2>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="btn-secondary"
          >
            {showFeatures ? 'Hide' : 'Show'} Features
          </button>
        </div>

        {showFeatures && (
          <div className="space-y-6">
            {/* Pomodoro Timer */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ClockIcon className="w-6 h-6 text-blue-400 mr-3" />
                  <h3 className="text-lg font-semibold text-white">Focus Timer</h3>
                </div>
                <div className="text-white text-xl font-mono">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-gray-400">
                  Mode: <span className="text-white capitalize">{mode.replace('_', ' ')}</span>
                </div>
                <div className="text-gray-400">
                  Sessions: <span className="text-orange-400">{completedSessions}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={isActive ? pauseTimer : startTimer}
                  className={`btn-primary ${isActive ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  {isActive ? 'Pause' : 'Start'} Focus
                </button>
                <button
                  onClick={() => navigate('/pomodoro')}
                  className="btn-secondary"
                >
                  Full Timer
                </button>
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <SwatchIcon className="w-6 h-6 text-purple-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Theme & Accessibility</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {availableThemes.map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => changeTheme(themeName)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      theme.name === themeName 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Learning */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MicrophoneIcon className="w-6 h-6 text-green-400 mr-3" />
                  <h3 className="text-lg font-semibold text-white">Voice Learning</h3>
                </div>
                <button
                  onClick={() => setShowVoiceMode(!showVoiceMode)}
                  className="btn-secondary"
                >
                  {showVoiceMode ? 'Hide' : 'Show'} Voice Mode
                </button>
              </div>
              
              {showVoiceMode && (
                <VoiceToTextLearning
                  onQuestion={(question) => console.log('Voice question:', question)}
                  onResponse={(response) => console.log('AI response:', response)}
                />
              )}
            </div>

            {/* Quick Feature Access */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => navigate('/ai-study-buddy')}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg text-center transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <span className="text-white text-sm">AI Study Buddy</span>
                </button>
                
                <button
                  onClick={() => navigate('/habits')}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg text-center transition-colors"
                >
                  <FireIcon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <span className="text-white text-sm">Habit Tracker</span>
                </button>
                
                <button
                  onClick={() => navigate('/learning-battles')}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg text-center transition-colors"
                >
                  <TrophyIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <span className="text-white text-sm">Learning Battles</span>
                </button>
                
                <button
                  onClick={() => navigate('/study-journal')}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg text-center transition-colors"
                >
                  <BookOpenIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <span className="text-white text-sm">Study Journal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habit Tracker Section */}
      <HabitTracker className="mb-8" />
    </div>
  );
};

export default Dashboard;