import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const PathwayAchievements = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  const achievements = [
    // Learning Pathway Achievements
    {
      id: 1,
      name: 'First Steps',
      description: 'Begin your learning journey',
      icon: '🚀',
      category: 'pathway',
      rarity: 'common',
      requirement: 'Complete first assessment',
      earned: true,
      earnedDate: '2024-01-15',
      progress: 1,
      maxProgress: 1,
      progressPoints: 25
    },
    {
      id: 2,
      name: 'Knowledge Seeker',
      description: 'Complete 10 learning modules',
      icon: '📚',
      category: 'pathway',
      rarity: 'common',
      requirement: 'Complete 10 learning modules',
      earned: true,
      earnedDate: '2024-01-18',
      progress: 10,
      maxProgress: 10,
      progressPoints: 50
    },
    {
      id: 3,
      name: 'Pathway Navigator',
      description: 'Explore 3 different learning pathways',
      icon: '🗺️',
      category: 'pathway',
      rarity: 'rare',
      requirement: 'Explore 3 different pathways',
      earned: false,
      progress: 2,
      maxProgress: 3,
      progressPoints: 100
    },
    {
      id: 4,
      name: 'Skill Builder',
      description: 'Master 5 core skills',
      icon: '🔧',
      category: 'pathway',
      rarity: 'rare',
      requirement: 'Master 5 core skills',
      earned: false,
      progress: 3,
      maxProgress: 5,
      progressPoints: 150
    },
    {
      id: 5,
      name: 'Pathway Master',
      description: 'Complete an entire learning pathway',
      icon: '👑',
      category: 'pathway',
      rarity: 'epic',
      requirement: 'Complete full pathway',
      earned: false,
      progress: 0,
      maxProgress: 1,
      progressPoints: 500
    },

    // Career Development Achievements
    {
      id: 6,
      name: 'Career Explorer',
      description: 'Research 5 career options',
      icon: '🔍',
      category: 'career',
      rarity: 'common',
      requirement: 'Research 5 career options',
      earned: true,
      earnedDate: '2024-01-17',
      progress: 5,
      maxProgress: 5,
      progressPoints: 75
    },
    {
      id: 7,
      name: 'Industry Insider',
      description: 'Connect with 3 professionals in your field',
      icon: '🤝',
      category: 'career',
      rarity: 'rare',
      requirement: 'Connect with 3 professionals',
      earned: false,
      progress: 1,
      maxProgress: 3,
      progressPoints: 125
    },
    {
      id: 8,
      name: 'Career Changer',
      description: 'Successfully transition to a new career path',
      icon: '🔄',
      category: 'career',
      rarity: 'epic',
      requirement: 'Complete career transition',
      earned: false,
      progress: 0,
      maxProgress: 1,
      progressPoints: 400
    },

    // Social Learning Achievements
    {
      id: 9,
      name: 'Circle Member',
      description: 'Join your first learning circle',
      icon: '👥',
      category: 'social',
      rarity: 'common',
      requirement: 'Join 1 learning circle',
      earned: true,
      earnedDate: '2024-01-20',
      progress: 1,
      maxProgress: 1,
      progressPoints: 50
    },
    {
      id: 10,
      name: 'Community Builder',
      description: 'Create a learning circle',
      icon: '🏗️',
      category: 'social',
      rarity: 'rare',
      requirement: 'Create 1 learning circle',
      earned: false,
      progress: 0,
      maxProgress: 1,
      progressPoints: 150
    },
    {
      id: 11,
      name: 'Mentor',
      description: 'Help 10 fellow learners',
      icon: '🎯',
      category: 'social',
      rarity: 'epic',
      requirement: 'Mentor 10 learners',
      earned: false,
      progress: 3,
      maxProgress: 10,
      progressPoints: 300
    },

    // Academic Achievements
    {
      id: 12,
      name: 'Academic Achiever',
      description: 'Maintain 90% average on assessments',
      icon: '🎓',
      category: 'academic',
      rarity: 'rare',
      requirement: 'Maintain 90% average',
      earned: true,
      earnedDate: '2024-01-19',
      progress: 92,
      maxProgress: 90,
      progressPoints: 200
    },
    {
      id: 13,
      name: 'Research Scholar',
      description: 'Complete advanced research project',
      icon: '🔬',
      category: 'academic',
      rarity: 'epic',
      requirement: 'Complete research project',
      earned: false,
      progress: 0,
      maxProgress: 1,
      progressPoints: 350
    },

    // Consistency Achievements
    {
      id: 14,
      name: 'Consistency Champion',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      category: 'consistency',
      rarity: 'common',
      requirement: 'Learn for 7 consecutive days',
      earned: true,
      earnedDate: '2024-01-22',
      progress: 7,
      maxProgress: 7,
      progressPoints: 100
    },
    {
      id: 15,
      name: 'Dedicated Learner',
      description: 'Maintain a 30-day learning streak',
      icon: '💪',
      category: 'consistency',
      rarity: 'rare',
      requirement: 'Learn for 30 consecutive days',
      earned: false,
      progress: user?.streak_days || 12,
      maxProgress: 30,
      progressPoints: 250
    },
    {
      id: 16,
      name: 'Lifetime Learner',
      description: 'Maintain a 100-day learning streak',
      icon: '⭐',
      category: 'consistency',
      rarity: 'legendary',
      requirement: 'Learn for 100 consecutive days',
      earned: false,
      progress: user?.streak_days || 12,
      maxProgress: 100,
      progressPoints: 1000
    }
  ];

  const categories = [
    { id: 'all', label: 'All Achievements', icon: TrophyIcon },
    { id: 'pathway', label: 'Learning Pathways', icon: MapIcon },
    { id: 'career', label: 'Career Development', icon: BriefcaseIcon },
    { id: 'social', label: 'Social Learning', icon: UserGroupIcon },
    { id: 'academic', label: 'Academic Excellence', icon: AcademicCapIcon },
    { id: 'consistency', label: 'Consistency', icon: FireIcon }
  ];

  const rarities = [
    { id: 'all', label: 'All Rarities' },
    { id: 'common', label: 'Common', color: 'bg-gray-500' },
    { id: 'rare', label: 'Rare', color: 'bg-gray-400' },
    { id: 'epic', label: 'Epic', color: 'bg-white' },
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
      case 'legendary': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'epic': return 'bg-gradient-to-br from-white to-gray-200';
      case 'rare': return 'bg-gradient-to-br from-gray-400 to-gray-500';
      case 'common': return 'bg-gradient-to-br from-gray-500 to-gray-600';
      default: return 'bg-gray-700';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-white';
      case 'rare': return 'border-gray-400';
      case 'common': return 'border-gray-500';
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
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
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
          achievement.rarity === 'epic' ? 'bg-white/20 text-white' :
          achievement.rarity === 'rare' ? 'bg-gray-400/20 text-gray-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
        </div>

        {achievement.earned ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-gray-400 text-sm">
              <TrophyIcon className="w-4 h-4 mr-1" />
              Earned {achievement.earnedDate}
            </div>
            <div className="text-gray-300 text-sm">
              +{achievement.progressPoints} Points
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
                    className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <div className="text-gray-500 text-sm">
              Reward: +{achievement.progressPoints} Points
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
            <TrophyIcon className="w-8 h-8 text-gray-400 mr-3" />
            Pathway Achievements
          </h1>
          <p className="text-gray-400">Showcase your learning milestones and unlock new challenges</p>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{earnedAchievements.length}/{totalAchievements}</p>
          <p className="text-gray-400 text-sm">Achievements Earned</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="starguide-card">
        <h2 className="text-xl font-semibold text-white mb-4">Achievement Progress</h2>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white">{earnedAchievements.length}/{totalAchievements} achievements</span>
          </div>
          <div className="progress-bar">
            <div 
              className="bg-gray-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(earnedAchievements.length / totalAchievements) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rarities.slice(1).map(rarity => {
            const earned = earnedAchievements.filter(a => a.rarity === rarity.id).length;
            const total = achievements.filter(a => a.rarity === rarity.id).length;
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
                      ? 'bg-gray-600 text-white'
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
          <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">{earnedAchievements.length}</h3>
          <p className="text-gray-400">Achievements Earned</p>
        </div>
        
        <div className="starguide-card text-center">
          <RocketLaunchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {earnedAchievements.reduce((sum, achievement) => sum + achievement.progressPoints, 0)}
          </h3>
          <p className="text-gray-400">Points from Achievements</p>
        </div>
        
        <div className="starguide-card text-center">
          <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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