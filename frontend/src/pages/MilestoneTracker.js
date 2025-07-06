import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrophyIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UsersIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MilestoneTracker = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockMilestones = [
    {
      id: 1,
      user_id: user?.id,
      username: user?.username,
      milestone_type: 'course_completion',
      title: 'Web Development Fundamentals',
      description: 'Completed comprehensive web development course',
      points_earned: 250,
      date_achieved: '2024-01-25',
      category: 'academic',
      difficulty: 'intermediate',
      verification_status: 'verified'
    },
    {
      id: 2,
      user_id: user?.id,
      username: user?.username,
      milestone_type: 'skill_mastery',
      title: 'JavaScript Proficiency',
      description: 'Demonstrated advanced JavaScript skills',
      points_earned: 200,
      date_achieved: '2024-01-20',
      category: 'technical',
      difficulty: 'advanced',
      verification_status: 'verified'
    },
    {
      id: 3,
      user_id: user?.id,
      username: user?.username,
      milestone_type: 'learning_streak',
      title: '30-Day Learning Streak',
      description: 'Maintained consistent daily learning for 30 days',
      points_earned: 150,
      date_achieved: '2024-01-15',
      category: 'personal',
      difficulty: 'beginner',
      verification_status: 'verified'
    }
  ];

  const mockLeaderboard = [
    { rank: 1, username: 'Alex Chen', total_points: 2850, milestones_count: 15, avatar: '👨‍💻' },
    { rank: 2, username: 'Sarah Johnson', total_points: 2640, milestones_count: 13, avatar: '👩‍🎓' },
    { rank: 3, username: user?.username || 'You', total_points: 2400, milestones_count: 12, avatar: '🎯' },
    { rank: 4, username: 'Miguel Rodriguez', total_points: 2200, milestones_count: 11, avatar: '🚀' },
    { rank: 5, username: 'Emily Davis', total_points: 2050, milestones_count: 10, avatar: '⭐' },
    { rank: 6, username: 'David Park', total_points: 1900, milestones_count: 9, avatar: '🎨' },
    { rank: 7, username: 'Lisa Wang', total_points: 1750, milestones_count: 8, avatar: '📊' },
    { rank: 8, username: 'James Wilson', total_points: 1600, milestones_count: 7, avatar: '💡' }
  ];

  useEffect(() => {
    loadMilestones();
    loadLeaderboard();
  }, [selectedTimeframe, selectedCategory]);

  const loadMilestones = async () => {
    try {
      // Use mock data for now
      setMilestones(mockMilestones);
    } catch (error) {
      console.error('Failed to load milestones:', error);
      setMilestones(mockMilestones);
    }
  };

  const loadLeaderboard = async () => {
    try {
      // Use mock data for now
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard(mockLeaderboard);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic': return AcademicCapIcon;
      case 'technical': return BriefcaseIcon;
      case 'personal': return StarIcon;
      default: return TrophyIcon;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-gray-600';
      case 'intermediate': return 'bg-gray-500';
      case 'advanced': return 'bg-gray-400';
      default: return 'bg-gray-600';
    }
  };

  const MilestoneCard = ({ milestone }) => {
    const CategoryIcon = getCategoryIcon(milestone.category);
    
    return (
      <div className="starguide-card hover:border-gray-500 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center mb-2">
            <CategoryIcon className="w-6 h-6 text-gray-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
              <p className="text-gray-400 text-sm">{milestone.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-gray-300 font-bold text-lg">+{milestone.points_earned}</div>
            <div className="text-gray-400 text-sm">Points</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`badge ${getDifficultyColor(milestone.difficulty)}`}>
              {milestone.difficulty}
            </span>
            <span className="badge bg-gray-700 text-gray-300">{milestone.category}</span>
            {milestone.verification_status === 'verified' && (
              <span className="text-gray-400 text-sm flex items-center">
                <StarIcon className="w-4 h-4 mr-1" />
                Verified
              </span>
            )}
          </div>
          
          <div className="text-gray-400 text-sm flex items-center">
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            {new Date(milestone.date_achieved).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  const LeaderboardCard = ({ entry }) => (
    <div className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
      entry.username === user?.username 
        ? 'bg-gray-700 border border-gray-600' 
        : 'bg-gray-800 hover:bg-gray-750'
    }`}>
      <div className="flex items-center flex-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
          entry.rank <= 3 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gray-700'
        }`}>
          <span className="text-lg">{entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}</span>
        </div>
        
        <div className="text-2xl mr-3">{entry.avatar}</div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className={`font-semibold ${
              entry.username === user?.username ? 'text-white' : 'text-gray-300'
            }`}>
              {entry.username}
            </span>
            {entry.username === user?.username && (
              <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">You</span>
            )}
          </div>
          <div className="text-gray-400 text-sm">{entry.milestones_count} milestones</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-gray-300 font-bold">{entry.total_points.toLocaleString()}</div>
        <div className="text-gray-400 text-sm">points</div>
      </div>
    </div>
  );

  const totalPoints = milestones.reduce((sum, milestone) => sum + milestone.points_earned, 0);
  const userRank = leaderboard.findIndex(entry => entry.username === user?.username) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <TrophyIcon className="w-8 h-8 text-gray-400 mr-3" />
            Milestone Tracker
          </h1>
          <p className="text-gray-400">Track your learning achievements and compare with peers</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{totalPoints}</div>
          <div className="text-gray-400 text-sm">Total Points</div>
        </div>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="starguide-card text-center">
          <TrophyIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">{milestones.length}</h3>
          <p className="text-gray-400 text-sm">Milestones Achieved</p>
        </div>
        
        <div className="starguide-card text-center">
          <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">#{userRank}</h3>
          <p className="text-gray-400 text-sm">Current Rank</p>
        </div>
        
        <div className="starguide-card text-center">
          <StarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">{totalPoints}</h3>
          <p className="text-gray-400 text-sm">Total Points</p>
        </div>
        
        <div className="starguide-card text-center">
          <FireIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">{user?.streak_days || 5}</h3>
          <p className="text-gray-400 text-sm">Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Milestones</h2>
            
            <div className="flex gap-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="form-input"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="technical">Technical</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))
            ) : (
              <div className="text-center py-12">
                <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No milestones yet</h3>
                <p className="text-gray-500">Start learning to earn your first milestone!</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 text-gray-400 mr-2" />
            Leaderboard
          </h2>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <LeaderboardCard key={index} entry={entry} />
            ))}
          </div>
          
          <div className="mt-6 starguide-card text-center">
            <div className="text-gray-400 text-sm mb-2">Your Progress</div>
            <div className="text-white font-semibold">Rank #{userRank} of {leaderboard.length}</div>
            <div className="text-gray-400 text-sm mt-1">
              {userRank > 1 && leaderboard[userRank - 2] && (
                <>
                  {leaderboard[userRank - 2].total_points - (leaderboard.find(e => e.username === user?.username)?.total_points || 0)} points to next rank
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Categories */}
      <div className="starguide-card">
        <h2 className="text-2xl font-bold text-white mb-6">Milestone Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              category: 'Academic',
              icon: AcademicCapIcon,
              count: milestones.filter(m => m.category === 'academic').length,
              points: milestones.filter(m => m.category === 'academic').reduce((sum, m) => sum + m.points_earned, 0),
              description: 'Course completions, certifications, academic achievements'
            },
            {
              category: 'Technical',
              icon: BriefcaseIcon,
              count: milestones.filter(m => m.category === 'technical').length,
              points: milestones.filter(m => m.category === 'technical').reduce((sum, m) => sum + m.points_earned, 0),
              description: 'Skill mastery, project completions, technical proficiency'
            },
            {
              category: 'Personal',
              icon: StarIcon,
              count: milestones.filter(m => m.category === 'personal').length,
              points: milestones.filter(m => m.category === 'personal').reduce((sum, m) => sum + m.points_earned, 0),
              description: 'Learning streaks, personal development, consistency'
            }
          ].map((cat, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <cat.icon className="w-8 h-8 text-gray-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">{cat.category}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xl font-bold text-white">{cat.count}</div>
                  <div className="text-gray-400 text-sm">Milestones</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{cat.points}</div>
                  <div className="text-gray-400 text-sm">Points</div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilestoneTracker;