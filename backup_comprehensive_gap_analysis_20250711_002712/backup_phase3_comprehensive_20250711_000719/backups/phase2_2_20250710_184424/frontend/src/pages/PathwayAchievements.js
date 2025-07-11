import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  StarIcon,
  TrophyIcon,
  FireIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const PathwayAchievements = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Mock achievements data
  const achievements = [
    // Learning Achievements
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first question',
      icon: '🚀',
      category: 'learning',
      rarity: 'common',
      requirement: 'Answer 1 question',
      earned: true,
      earnedDate: '2024-01-15',
      progress: 1,
      maxProgress: 1,
      xpReward: 25
    },
    {
      id: 2,
      name: 'Quick Learner',
      description: 'Answer 10 questions correctly',
      icon: '⚡',
      category: 'learning',
      rarity: 'common',
      requirement: 'Answer 10 questions correctly',
      earned: true,
      earnedDate: '2024-01-18',
      progress: 10,
      maxProgress: 10,
      xpReward: 50
    },
    {
      id: 3,
      name: 'Knowledge Seeker',
      description: 'Answer 100 questions correctly',
      icon: '📚',
      category: 'learning',
      rarity: 'rare',
      requirement: 'Answer 100 questions correctly',
      earned: false,
      progress: 67,
      maxProgress: 100,
      xpReward: 200
    },
    {
      id: 4,
      name: 'Pathway Navigator',
      description: 'Answer 500 questions correctly',
      icon: '🗺️',
      category: 'learning',
      rarity: 'epic',
      requirement: 'Answer 500 questions correctly',
      earned: false,
      progress: 67,
      maxProgress: 500,
      xpReward: 500
    },
    {
      id: 5,
      name: 'Master Navigator',
      description: 'Answer 1000 questions correctly',
      icon: '👑',
      category: 'learning',
      rarity: 'legendary',
      requirement: 'Answer 1000 questions correctly',
      earned: false,
      progress: 67,
      maxProgress: 1000,
      xpReward: 1000
    },

    // Streak Achievements
    {
      id: 6,
      name: 'Consistency',
      description: 'Maintain a 3-day learning streak',
      icon: '🔥',
      category: 'streak',
      rarity: 'common',
      requirement: 'Learn for 3 consecutive days',
      earned: true,
      earnedDate: '2024-01-17',
      progress: 3,
      maxProgress: 3,
      xpReward: 75
    },
    {
      id: 7,
      name: 'Dedicated',
      description: 'Maintain a 7-day learning streak',
      icon: '🌟',
      category: 'streak',
      rarity: 'rare',
      requirement: 'Learn for 7 consecutive days',
      earned: false,
      progress: user?.streak_days || 5,
      maxProgress: 7,
      xpReward: 150
    },
    {
      id: 8,
      name: 'Unstoppable',
      description: 'Maintain a 30-day learning streak',
      icon: '💪',
      category: 'streak',
      rarity: 'epic',
      requirement: 'Learn for 30 consecutive days',
      earned: false,
      progress: user?.streak_days || 5,
      maxProgress: 30,
      xpReward: 500
    },

    // Social Achievements
    {
      id: 9,
      name: 'Team Player',
      description: 'Join your first learning circle',
      icon: '🤝',
      category: 'social',
      rarity: 'common',
      requirement: 'Join 1 learning circle',
      earned: true,
      earnedDate: '2024-01-20',
      progress: 1,
      maxProgress: 1,
      xpReward: 50
    },
    {
      id: 10,
      name: 'Collaborator',
      description: 'Join 5 learning circles',
      icon: '👥',
      category: 'social',
      rarity: 'rare',
      requirement: 'Join 5 learning circles',
      earned: false,
      progress: 3,
      maxProgress: 5,
      xpReward: 150
    },

    // Skill Achievements
    {
      id: 11,
      name: 'JavaScript Novice',
      description: 'Complete 25 JavaScript questions',
      icon: '📜',
      category: 'skill',
      rarity: 'common',
      requirement: 'Complete 25 JavaScript questions',
      earned: true,
      earnedDate: '2024-01-19',
      progress: 25,
      maxProgress: 25,
      xpReward: 100
    },
    {
      id: 12,
      name: 'Python Explorer',
      description: 'Complete 25 Python questions',
      icon: '🐍',
      category: 'skill',
      rarity: 'common',
      requirement: 'Complete 25 Python questions',
      earned: false,
      progress: 12,
      maxProgress: 25,
      xpReward: 100
    },
    {
      id: 13,
      name: 'React Warrior',
      description: 'Complete 50 React questions',
      icon: '⚛️',
      category: 'skill',
      rarity: 'rare',
      requirement: 'Complete 50 React questions',
      earned: false,
      progress: 8,
      maxProgress: 50,
      xpReward: 200
    },

    // Special Achievements
    {
      id: 14,
      name: 'Speed Demon',
      description: 'Answer 10 questions in under 5 minutes',
      icon: '⚡',
      category: 'special',
      rarity: 'rare',
      requirement: 'Answer 10 questions in under 5 minutes',
      earned: false,
      progress: 0,
      maxProgress: 1,
      xpReward: 200
    },
    {
      id: 15,
      name: 'Perfect Score',
      description: 'Get 100% on a Talent Compass assessment',
      icon: '💯',
      category: 'special',
      rarity: 'epic',
      requirement: 'Score 100% on any assessment',
      earned: false,
      progress: 0,
      maxProgress: 1,
      xpReward: 300
    },
    {
      id: 16,
      name: 'Guide Helper',
      description: 'Have 50 conversations with Pathway Guide',
      icon: '🧠',
      category: 'special',
      rarity: 'rare',
      requirement: 'Chat with Pathway Guide 50 times',
      earned: false,
      progress: 23,
      maxProgress: 50,
      xpReward: 250
    }
  ];

  const categories = [
    { id: 'all', label: 'All Achievements', icon: StarIcon },
    { id: 'learning', label: 'Learning', icon: BookOpenIcon },
    { id: 'streak', label: 'Streaks', icon: FireIcon },
    { id: 'social', label: 'Social', icon: UserGroupIcon },
    { id: 'skill', label: 'Skills', icon: LightBulbIcon },
    { id: 'special', label: 'Special', icon: TrophyIcon }
  ];

  const rarities = [
    { id: 'all', label: 'All Rarities' },
    { id: 'common', label: 'Common', color: 'bg-gray-500' },
    { id: 'rare', label: 'Rare', color: 'bg-blue-500' },
    { id: 'epic', label: 'Epic', color: 'bg-purple-500' },
    { id: 'legendary', label: 'Legendary', color: 'bg-yellow-500' }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const earnedAchievements = achievements.filter(achievement => achievement.earned);
  const totalAchievements = achievements.length;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-br from-blue-500 to-cyan-500';
      case 'common': return 'bg-gradient-to-br from-gray-500 to-gray-600';
      default: return 'bg-gray-700';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-400/20';
      case 'epic': return 'border-purple-500 shadow-purple-500/20';
      case 'rare': return 'border-blue-500 shadow-blue-500/20';
      case 'common': return 'border-gray-500 shadow-gray-500/20';
      default: return 'border-gray-700';
    }
  };

  const AchievementCard = ({ achievement }) => (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
        achievement.earned
          ? `${getRarityBorder(achievement.rarity)} bg-gray-800 shadow-lg`
          : 'border-gray-700 bg-gray-900 opacity-60'
      }`}
    >
      {achievement.earned && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
          achievement.earned ? getRarityColor(achievement.rarity) : 'bg-gray-700'
        }`}>
          {achievement.earned ? achievement.icon : '🔒'}
        </div>

        <h3 className={`text-lg font-bold mb-2 ${achievement.earned ? 'text-white' : 'text-gray-400'}`}>
          {achievement.name}
        </h3>

        <p className={`text-sm mb-4 ${achievement.earned ? 'text-gray-300' : 'text-gray-500'}`}>
          {achievement.description}
        </p>

        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
          achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
          achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
          achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
        </div>

        {achievement.earned ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-green-500 text-sm">
              <TrophyIcon className="w-4 h-4 mr-1" />
              Earned {achievement.earnedDate}
            </div>
            <div className="text-blue-400 text-sm">
              +{achievement.xpReward} XP
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-gray-400 text-sm">
              {achievement.requirement}
            </div>
            {achievement.maxProgress > 1 && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <div className="text-gray-500 text-sm">
              Reward: +{achievement.xpReward} XP
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <StarIcon className="w-8 h-8 text-yellow-500 mr-3" />
            Pathway Achievements™
          </h1>
          <p className="text-gray-400">Showcase your learning journey milestones</p>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{earnedAchievements.length}/{totalAchievements}</p>
          <p className="text-gray-400 text-sm">Achievements Earned</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="starguide-card">
        <h2 className="text-xl font-semibold text-white mb-4">Achievement Collection Progress</h2>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white">{earnedAchievements.length}/{totalAchievements} achievements</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(earnedAchievements.length / totalAchievements) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rarities.slice(1).map(rarity => {
            const earned = earnedAchievements.filter(b => b.rarity === rarity.id).length;
            const total = achievements.filter(b => b.rarity === rarity.id).length;
            return (
              <div key={rarity.id} className="text-center">
                <div className={`w-4 h-4 ${rarity.color} rounded-full mx-auto mb-2`} />
                <p className="text-white font-medium">{earned}/{total}</p>
                <p className="text-gray-400 text-sm">{rarity.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="starguide-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="form-label mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="form-label mb-2">Rarity</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="form-input"
            >
              {rarities.map(rarity => (
                <option key={rarity.id} value={rarity.id}>{rarity.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {/* Achievement Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="starguide-card text-center">
          <TrophyIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">{earnedAchievements.length}</h3>
          <p className="text-gray-400">Achievements Earned</p>
        </div>
        
        <div className="starguide-card text-center">
          <RocketLaunchIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {earnedAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0)}
          </h3>
          <p className="text-gray-400">XP from Achievements</p>
        </div>
        
        <div className="starguide-card text-center">
          <GlobeAltIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {Math.round((earnedAchievements.length / totalAchievements) * 100)}%
          </h3>
          <p className="text-gray-400">Collection Complete</p>
        </div>
      </div>

      {/* Recently Earned */}
      {earnedAchievements.length > 0 && (
        <div className="starguide-card">
          <h2 className="text-2xl font-semibold text-white mb-6">Recently Earned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {earnedAchievements.slice(-4).reverse().map(achievement => (
              <div key={achievement.id} className="flex items-center p-4 bg-gray-800 rounded-lg">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 ${getRarityColor(achievement.rarity)}`}>
                  {achievement.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{achievement.name}</h3>
                  <p className="text-gray-400 text-sm">{achievement.earnedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PathwayAchievements;