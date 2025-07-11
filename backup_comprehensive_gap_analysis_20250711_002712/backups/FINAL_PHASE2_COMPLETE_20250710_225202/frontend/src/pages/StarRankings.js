import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const StarRankings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overall');
  const [timeframe, setTimeframe] = useState('week');

  // Mock leaderboard data
  const leaderboards = {
    overall: [
      { id: 1, username: 'CodeMaster2024', level: 15, xp: 12500, streak: 45, avatar: '👑' },
      { id: 2, username: 'JSNinja', level: 12, xp: 9800, streak: 23, avatar: '🥷' },
      { id: 3, username: 'PythonGuru', level: 11, xp: 8600, streak: 67, avatar: '🐍' },
      { id: 4, username: 'ReactQueen', level: 10, xp: 7900, streak: 12, avatar: '👸' },
      { id: 5, username: 'AlgoWizard', level: 9, xp: 7200, streak: 34, avatar: '🧙' },
      { id: 6, username: user?.username || 'You', level: user?.level || 3, xp: user?.xp || 1250, streak: user?.streak_days || 5, avatar: '⭐' },
      { id: 7, username: 'CSSArtist', level: 8, xp: 6100, streak: 18, avatar: '🎨' },
      { id: 8, username: 'DataSci101', level: 8, xp: 5900, streak: 9, avatar: '📊' },
      { id: 9, username: 'WebDev_Pro', level: 7, xp: 5400, streak: 21, avatar: '💻' },
      { id: 10, username: 'NodeNinja', level: 7, xp: 5100, streak: 15, avatar: '🔧' }
    ],
    weekly: [
      { id: 1, username: 'WeeklyChamp', xp_gained: 850, questions: 45, time: 180 },
      { id: 2, username: 'SpeedRunner', xp_gained: 720, questions: 38, time: 120 },
      { id: 3, username: user?.username || 'You', xp_gained: 650, questions: 32, time: 150 },
      { id: 4, username: 'StudyBot', xp_gained: 590, questions: 29, time: 200 },
      { id: 5, username: 'QuizMaster', xp_gained: 540, questions: 27, time: 90 }
    ],
    subject: {
      JavaScript: [
        { id: 1, username: 'JSExpert', score: 98, questions: 120, accuracy: 96 },
        { id: 2, username: 'CodeNinja', score: 95, questions: 89, accuracy: 94 },
        { id: 3, username: user?.username || 'You', score: 87, questions: 67, accuracy: 89 }
      ],
      Python: [
        { id: 1, username: 'SnakeMaster', score: 99, questions: 150, accuracy: 98 },
        { id: 2, username: 'DataGuru', score: 93, questions: 78, accuracy: 91 }
      ],
      React: [
        { id: 1, username: 'HookMaster', score: 96, questions: 85, accuracy: 95 },
        { id: 2, username: 'ComponentKing', score: 91, questions: 65, accuracy: 88 }
      ]
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-gray-400';
    }
  };

  const LeaderboardCard = ({ entry, rank, type = 'overall' }) => {
    const isCurrentUser = entry.username === user?.username || entry.username === 'You';
    
    return (
      <div className={`p-4 rounded-lg border transition-all ${
        isCurrentUser 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`text-2xl font-bold ${getRankColor(rank)} min-w-[3rem] text-center`}>
              {getRankIcon(rank)}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                {entry.avatar || entry.username.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h3 className={`font-semibold ${isCurrentUser ? 'text-green-400' : 'text-white'}`}>
                  {entry.username}
                  {isCurrentUser && <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded">YOU</span>}
                </h3>
                
                {type === 'overall' && (
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span>Level {entry.level}</span>
                    <span className="flex items-center">
                      <FireIcon className="w-4 h-4 mr-1 text-orange-500" />
                      {entry.streak} days
                    </span>
                  </div>
                )}
                
                {type === 'weekly' && (
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span>{entry.questions} questions</span>
                    <span>{entry.time} min</span>
                  </div>
                )}
                
                {type === 'subject' && (
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <span>{entry.accuracy}% accuracy</span>
                    <span>{entry.questions} questions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {type === 'overall' && (
              <div>
                <p className="text-xl font-bold text-blue-500">{entry.xp.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">XP</p>
              </div>
            )}
            
            {type === 'weekly' && (
              <div>
                <p className="text-xl font-bold text-green-500">+{entry.xp_gained}</p>
                <p className="text-gray-400 text-sm">XP this week</p>
              </div>
            )}
            
            {type === 'subject' && (
              <div>
                <p className="text-xl font-bold text-purple-500">{entry.score}%</p>
                <p className="text-gray-400 text-sm">Score</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <TrophyIcon className="w-8 h-8 text-yellow-500 mr-3" />
            StarRankings
          </h1>
          <p className="text-gray-400">Compete with learners across the galaxy</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">#{leaderboards.overall.findIndex(u => u.username === user?.username || u.username === 'You') + 1}</p>
            <p className="text-gray-400 text-sm">Your Rank</p>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="starguide-card">
        <h2 className="text-xl font-semibold text-white mb-4">Your Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <StarIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{user?.level || 1}</p>
            <p className="text-gray-400 text-sm">Level</p>
          </div>
          <div className="text-center">
            <TrophyIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{user?.xp || 0}</p>
            <p className="text-gray-400 text-sm">Total XP</p>
          </div>
          <div className="text-center">
            <FireIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{user?.streak_days || 0}</p>
            <p className="text-gray-400 text-sm">Day Streak</p>
          </div>
          <div className="text-center">
            <UsersIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-gray-400 text-sm">Study Groups</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overall', label: 'Overall Rankings', icon: TrophyIcon },
          { id: 'weekly', label: 'Weekly Leaders', icon: ChartBarIcon },
          { id: 'subject', label: 'Subject Masters', icon: BookOpenIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overall Rankings */}
      {activeTab === 'overall' && (
        <div className="starguide-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Overall Rankings</h2>
            <span className="text-gray-400 text-sm">Based on total XP earned</span>
          </div>
          
          <div className="space-y-3">
            {leaderboards.overall.map((entry, index) => (
              <LeaderboardCard key={entry.id} entry={entry} rank={index + 1} type="overall" />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Leaders */}
      {activeTab === 'weekly' && (
        <div className="starguide-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Weekly Leaders</h2>
            <span className="text-gray-400 text-sm">XP gained this week</span>
          </div>
          
          <div className="space-y-3">
            {leaderboards.weekly.map((entry, index) => (
              <LeaderboardCard key={entry.id} entry={entry} rank={index + 1} type="weekly" />
            ))}
          </div>
        </div>
      )}

      {/* Subject Masters */}
      {activeTab === 'subject' && (
        <div className="space-y-6">
          {Object.entries(leaderboards.subject).map(([subject, entries]) => (
            <div key={subject} className="starguide-card">
              <h2 className="text-2xl font-semibold text-white mb-4">{subject} Masters</h2>
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <LeaderboardCard key={entry.id} entry={entry} rank={index + 1} type="subject" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Competition Calendar */}
      <div className="starguide-card">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <ClockIcon className="w-6 h-6 text-green-500 mr-2" />
          Upcoming Competitions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Weekly JavaScript Challenge',
              description: 'Test your JS skills in a timed competition',
              date: 'Starts in 2 days',
              prize: '500 XP + Badge',
              participants: 124
            },
            {
              title: 'Python Algorithm Sprint',
              description: 'Solve complex algorithms under pressure',
              date: 'Starts in 5 days',
              prize: '1000 XP + Badge',
              participants: 89
            },
            {
              title: 'React Component Battle',
              description: 'Build the best React components',
              date: 'Starts in 1 week',
              prize: '750 XP + Badge',
              participants: 67
            }
          ].map((competition, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-2">{competition.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{competition.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Starts:</span>
                  <span className="text-white">{competition.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prize:</span>
                  <span className="text-green-500">{competition.prize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered:</span>
                  <span className="text-blue-500">{competition.participants}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 btn-primary text-sm">
                Register Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hall of Fame */}
      <div className="starguide-card">
        <h2 className="text-2xl font-semibold text-white mb-6">🏆 Hall of Fame</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-lg border border-yellow-500/30">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">CodeMaster2024</h3>
            <p className="text-gray-400 mb-2">Current Champion</p>
            <p className="text-2xl font-bold text-white">12,500 XP</p>
            <p className="text-yellow-500 text-sm mt-2">45-day streak</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-b from-purple-500/20 to-transparent rounded-lg border border-purple-500/30">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Most Improved</h3>
            <p className="text-gray-400 mb-2">SpeedLearner99</p>
            <p className="text-2xl font-bold text-white">+2,500 XP</p>
            <p className="text-purple-500 text-sm mt-2">This month</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-b from-green-500/20 to-transparent rounded-lg border border-green-500/30">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Longest Streak</h3>
            <p className="text-gray-400 mb-2">PythonGuru</p>
            <p className="text-2xl font-bold text-white">67 Days</p>
            <p className="text-green-500 text-sm mt-2">Still going!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarRankings;