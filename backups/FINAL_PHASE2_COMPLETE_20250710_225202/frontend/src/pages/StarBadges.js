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

const StarBadges = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  // Mock badges data
  const badges = [
    // Learning Badges
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
      name: 'Scholar',
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
      name: 'Knowledge Seeker',
      description: 'Answer 500 questions correctly',
      icon: '🔍',
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
      name: 'Master Scholar',
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

    // Streak Badges
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

    // Social Badges
    {
      id: 9,
      name: 'Team Player',
      description: 'Join your first study group',
      icon: '🤝',
      category: 'social',
      rarity: 'common',
      requirement: 'Join 1 study group',
      earned: true,
      earnedDate: '2024-01-20',
      progress: 1,
      maxProgress: 1,
      xpReward: 50
    },
    {
      id: 10,
      name: 'Collaborator',
      description: 'Join 5 study groups',
      icon: '👥',
      category: 'social',
      rarity: 'rare',
      requirement: 'Join 5 study groups',
      earned: false,
      progress: 3,
      maxProgress: 5,
      xpReward: 150
    },

    // Skill Badges
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

    // Special Badges
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
      description: 'Get 100% on a SkillScan assessment',
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
      name: 'Mentor Helper',
      description: 'Have 50 conversations with StarMentor',
      icon: '🧠',
      category: 'special',
      rarity: 'rare',
      requirement: 'Chat with StarMentor 50 times',
      earned: false,
      progress: 23,
      maxProgress: 50,
      xpReward: 250
    }
  ];

  const categories = [
    { id: 'all', label: 'All Badges', icon: StarIcon },
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

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalBadges = badges.length;

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

  const BadgeCard = ({ badge }) => (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
        badge.earned
          ? `${getRarityBorder(badge.rarity)} bg-gray-800 shadow-lg`
          : 'border-gray-700 bg-gray-900 opacity-60'
      }`}
    >
      {badge.earned && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
          badge.earned ? getRarityColor(badge.rarity) : 'bg-gray-700'
        }`}>
          {badge.earned ? badge.icon : '🔒'}
        </div>

        <h3 className={`text-lg font-bold mb-2 ${badge.earned ? 'text-white' : 'text-gray-400'}`}>
          {badge.name}
        </h3>

        <p className={`text-sm mb-4 ${badge.earned ? 'text-gray-300' : 'text-gray-500'}`}>
          {badge.description}
        </p>

        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
          badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
          badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
          badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
        </div>

        {badge.earned ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-green-500 text-sm">
              <TrophyIcon className="w-4 h-4 mr-1" />
              Earned {badge.earnedDate}
            </div>
            <div className="text-blue-400 text-sm">
              +{badge.xpReward} XP
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-gray-400 text-sm">
              {badge.requirement}
            </div>
            {badge.maxProgress > 1 && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{badge.progress}/{badge.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <div className="text-gray-500 text-sm">
              Reward: +{badge.xpReward} XP
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
            StarBadges™
          </h1>
          <p className="text-gray-400">Showcase your achievements and unlock new challenges</p>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{earnedBadges.length}/{totalBadges}</p>
          <p className="text-gray-400 text-sm">Badges Earned</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="starguide-card">
        <h2 className="text-xl font-semibold text-white mb-4">Badge Collection Progress</h2>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white">{earnedBadges.length}/{totalBadges} badges</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rarities.slice(1).map(rarity => {
            const earned = earnedBadges.filter(b => b.rarity === rarity.id).length;
            const total = badges.filter(b => b.rarity === rarity.id).length;
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
                      ? 'bg-yellow-500 text-black'
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

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>

      {/* Badge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="starguide-card text-center">
          <TrophyIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">{earnedBadges.length}</h3>
          <p className="text-gray-400">Badges Earned</p>
        </div>
        
        <div className="starguide-card text-center">
          <RocketLaunchIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {earnedBadges.reduce((sum, badge) => sum + badge.xpReward, 0)}
          </h3>
          <p className="text-gray-400">XP from Badges</p>
        </div>
        
        <div className="starguide-card text-center">
          <GlobeAltIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {Math.round((earnedBadges.length / totalBadges) * 100)}%
          </h3>
          <p className="text-gray-400">Collection Complete</p>
        </div>
      </div>

      {/* Recently Earned */}
      {earnedBadges.length > 0 && (
        <div className="starguide-card">
          <h2 className="text-2xl font-semibold text-white mb-6">Recently Earned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {earnedBadges.slice(-4).reverse().map(badge => (
              <div key={badge.id} className="flex items-center p-4 bg-gray-800 rounded-lg">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 ${getRarityColor(badge.rarity)}`}>
                  {badge.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{badge.name}</h3>
                  <p className="text-gray-400 text-sm">{badge.earnedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StarBadges;