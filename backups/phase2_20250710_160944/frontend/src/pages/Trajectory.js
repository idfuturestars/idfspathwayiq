import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Trajectory = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('xp');

  // Mock analytics data
  const analyticsData = {
    week: {
      xp: [20, 45, 30, 60, 40, 80, 65],
      questions: [5, 8, 6, 12, 8, 15, 10],
      study_time: [30, 45, 25, 60, 40, 90, 75],
      accuracy: [80, 85, 75, 90, 85, 95, 88]
    },
    month: {
      xp: [150, 200, 180, 250, 220, 300, 280, 320],
      questions: [25, 35, 30, 45, 40, 55, 50, 60],
      study_time: [120, 180, 150, 240, 200, 300, 280, 350],
      accuracy: [82, 85, 83, 88, 86, 90, 89, 91]
    }
  };

  const achievements = [
    {
      id: 1,
      title: 'JavaScript Master',
      description: 'Completed 50 JavaScript questions',
      icon: '🏆',
      date: '2024-01-15',
      xp: 200,
      rarity: 'epic'
    },
    {
      id: 2,
      title: 'Study Streak',
      description: '7 days consecutive learning',
      icon: '🔥',
      date: '2024-01-12',
      xp: 150,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Team Player',
      description: 'Joined 3 study groups',
      icon: '🤝',
      date: '2024-01-10',
      xp: 100,
      rarity: 'common'
    },
    {
      id: 4,
      title: 'Quick Learner',
      description: 'Answered 10 questions in under 5 minutes',
      icon: '⚡',
      date: '2024-01-08',
      xp: 75,
      rarity: 'rare'
    }
  ];

  const recentActivity = [
    {
      type: 'quest',
      title: 'Completed React Hooks Quest',
      time: '2 hours ago',
      xp: 150,
      subject: 'React'
    },
    {
      type: 'mentor',
      title: 'Asked StarMentor about closures',
      time: '4 hours ago',
      xp: 25,
      subject: 'JavaScript'
    },
    {
      type: 'group',
      title: 'Joined Python Beginners Pod',
      time: '6 hours ago',
      xp: 50,
      subject: 'Python'
    },
    {
      type: 'badge',
      title: 'Earned "Quick Learner" badge',
      time: '1 day ago',
      xp: 75,
      subject: 'General'
    },
    {
      type: 'assessment',
      title: 'Completed JavaScript SkillScan',
      time: '1 day ago',
      xp: 200,
      subject: 'JavaScript'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quest': return <TrophyIcon className="w-5 h-5" />;
      case 'mentor': return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'group': return <UserGroupIcon className="w-5 h-5" />;
      case 'badge': return <StarIcon className="w-5 h-5" />;
      case 'assessment': return <BookOpenIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'quest': return 'text-yellow-500 bg-yellow-500/10';
      case 'mentor': return 'text-purple-500 bg-purple-500/10';
      case 'group': return 'text-blue-500 bg-blue-500/10';
      case 'badge': return 'text-green-500 bg-green-500/10';
      case 'assessment': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'common': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const MetricCard = ({ title, value, change, icon, color }) => (
    <div className="starguide-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}% vs last {timeframe}
          </p>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
            Learning Trajectory
          </h1>
          <p className="text-gray-400">Track your progress and achievements</p>
        </div>
        
        <div className="flex space-x-2">
          {['week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total XP Earned"
          value={user?.xp || 0}
          change={12}
          icon={<StarIcon className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
        <MetricCard
          title="Current Level"
          value={user?.level || 1}
          change={5}
          icon={<TrophyIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Study Streak"
          value={`${user?.streak_days || 0} days`}
          change={3}
          icon={<FireIcon className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
        <MetricCard
          title="Learning Hours"
          value="42h"
          change={18}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Progress Chart */}
      <div className="starguide-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Progress Overview</h2>
          <div className="flex space-x-2">
            {[
              { key: 'xp', label: 'XP Gained', color: 'bg-yellow-500' },
              { key: 'questions', label: 'Questions', color: 'bg-blue-500' },
              { key: 'study_time', label: 'Study Time', color: 'bg-green-500' },
              { key: 'accuracy', label: 'Accuracy %', color: 'bg-purple-500' }
            ].map((metric) => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedMetric === metric.key
                    ? `${metric.color} text-white`
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="h-64 flex items-end space-x-2">
          {analyticsData[timeframe][selectedMetric].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-400"
                style={{
                  height: `${(value / Math.max(...analyticsData[timeframe][selectedMetric])) * 200}px`
                }}
              />
              <div className="text-xs text-gray-400 mt-2">
                {timeframe === 'week' ? 
                  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] :
                  `W${index + 1}`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Timeline */}
      <div className="starguide-card">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <TrophyIcon className="w-6 h-6 text-yellow-500 mr-2" />
          Recent Achievements
        </h2>
        
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center p-4 bg-gray-800 rounded-lg">
              <div className={`w-12 h-12 rounded-lg ${getRarityColor(achievement.rarity)} flex items-center justify-center text-2xl mr-4`}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-semibold">{achievement.title}</h3>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
                <div className="flex items-center mt-1 space-x-3">
                  <span className="text-green-500 text-sm font-medium">+{achievement.xp} XP</span>
                  <span className="text-gray-500 text-sm">{achievement.date}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="starguide-card">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <CalendarIcon className="w-6 h-6 text-blue-500 mr-2" />
          Recent Activity
        </h2>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-800 rounded-lg">
              <div className={`p-2 rounded-lg mr-4 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-medium">{activity.title}</h3>
                <div className="flex items-center mt-1 space-x-3">
                  <span className="text-gray-400 text-sm">{activity.time}</span>
                  <span className="badge badge-info">{activity.subject}</span>
                  <span className="text-green-500 text-sm font-medium">+{activity.xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      <div className="starguide-card">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <ArrowTrendingUpIcon className="w-6 h-6 text-green-500 mr-2" />
          Learning Goals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Weekly Goals</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Complete 20 questions</span>
                  <span className="text-white">15/20</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Study 10 hours</span>
                  <span className="text-white">7/10</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Join 2 study groups</span>
                  <span className="text-white">2/2</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Monthly Goals</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Reach Level 5</span>
                  <span className="text-white">Level {user?.level || 1}/5</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${((user?.level || 1) / 5) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Earn 1000 XP</span>
                  <span className="text-white">{user?.xp || 0}/1000</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${((user?.xp || 0) / 1000) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Complete 3 subjects</span>
                  <span className="text-white">1/3</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '33%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trajectory;