import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  MapIcon,
  TrophyIcon,
  UsersIcon,
  ClockIcon,
  PlayIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FilterIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const GalaxyQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockQuests = [
    {
      id: '1',
      name: 'JavaScript Galaxy Adventure',
      description: 'Master the fundamentals of JavaScript through interactive challenges',
      subject: 'JavaScript',
      difficulty: 'beginner',
      max_participants: 20,
      participants: ['user1', 'user2', 'user3'],
      questions_per_game: 15,
      time_per_question: 30,
      created_by: 'instructor1',
      is_active: true,
      room_code: 'JS001',
      creator_name: 'Prof. Smith',
      estimated_time: '25 min',
      xp_reward: 150,
      badge_reward: 'JavaScript Explorer'
    },
    {
      id: '2',
      name: 'React Reactor Challenge',
      description: 'Build and test your React component knowledge',
      subject: 'React',
      difficulty: 'intermediate',
      max_participants: 15,
      participants: ['user4', 'user5'],
      questions_per_game: 20,
      time_per_question: 45,
      created_by: 'instructor2',
      is_active: true,
      room_code: 'REACT02',
      creator_name: 'Dr. Johnson',
      estimated_time: '35 min',
      xp_reward: 250,
      badge_reward: 'React Champion'
    },
    {
      id: '3',
      name: 'Python Planet Exploration',
      description: 'Explore Python concepts from basics to advanced topics',
      subject: 'Python',
      difficulty: 'advanced',
      max_participants: 10,
      participants: ['user6', 'user7', 'user8', 'user9'],
      questions_per_game: 25,
      time_per_question: 60,
      created_by: 'instructor3',
      is_active: true,
      room_code: 'PY003',
      creator_name: 'Prof. Williams',
      estimated_time: '45 min',
      xp_reward: 350,
      badge_reward: 'Python Master'
    }
  ];

  useEffect(() => {
    loadQuests();
  }, [activeTab]);

  const loadQuests = async () => {
    setLoading(true);
    try {
      // For now, use mock data since backend might not have quest data yet
      setTimeout(() => {
        setQuests(mockQuests);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load quests:', error);
      setQuests(mockQuests);
      setLoading(false);
    }
  };

  const handleJoinQuest = async (questId, roomCode) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/quiz-rooms/${roomCode}/join`);
      // Redirect to quest room or update UI
      alert(`Successfully joined quest! Room code: ${roomCode}`);
    } catch (error) {
      console.error('Failed to join quest:', error);
      alert('Failed to join quest. Please try again.');
    }
  };

  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || quest.difficulty === selectedDifficulty;
    const matchesSubject = !selectedSubject || quest.subject === selectedSubject;
    
    return matchesSearch && matchesDifficulty && matchesSubject;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      case 'expert': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const QuestCard = ({ quest }) => (
    <div className="starguide-card group hover:border-green-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
            {quest.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className={`badge ${getDifficultyColor(quest.difficulty)} text-white`}>
              {quest.difficulty}
            </span>
            <span className="badge badge-info">{quest.subject}</span>
            <span className="text-gray-400 text-sm">by {quest.creator_name}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-green-500 font-bold text-lg">+{quest.xp_reward} XP</div>
          {quest.badge_reward && (
            <div className="text-yellow-500 text-sm flex items-center mt-1">
              <StarIcon className="w-4 h-4 mr-1" />
              {quest.badge_reward}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
        <div className="flex items-center text-gray-400">
          <UsersIcon className="w-4 h-4 mr-1" />
          {quest.participants.length}/{quest.max_participants}
        </div>
        <div className="flex items-center text-gray-400">
          <ClockIcon className="w-4 h-4 mr-1" />
          {quest.estimated_time}
        </div>
        <div className="flex items-center text-gray-400">
          <TrophyIcon className="w-4 h-4 mr-1" />
          {quest.questions_per_game} questions
        </div>
        <div className="text-gray-400">
          Code: <span className="font-mono text-white">{quest.room_code}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {quest.participants.slice(0, 3).map((participant, index) => (
            <div
              key={index}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-bold"
            >
              {participant.charAt(0).toUpperCase()}
            </div>
          ))}
          {quest.participants.length > 3 && (
            <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs">
              +{quest.participants.length - 3}
            </div>
          )}
        </div>

        <button
          onClick={() => handleJoinQuest(quest.id, quest.room_code)}
          disabled={quest.participants.length >= quest.max_participants}
          className="btn-primary"
        >
          <PlayIcon className="w-4 h-4 mr-2" />
          Join Quest
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <MapIcon className="w-8 h-8 text-blue-500 mr-3" />
            Galaxy Quests
          </h1>
          <p className="text-gray-400">Embark on epic learning adventures</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Quest
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'public', label: 'Public Quests', count: filteredQuests.length },
          { id: 'joined', label: 'My Quests', count: 0 },
          { id: 'created', label: 'Created by Me', count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="starguide-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search quests by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-input"
            >
              <option value="">All Subjects</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="CSS">CSS</option>
              <option value="Node.js">Node.js</option>
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="form-input"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quest Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}

      {!loading && filteredQuests.length === 0 && (
        <div className="text-center py-12">
          <MapIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No quests found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedDifficulty || selectedSubject
              ? 'Try adjusting your filters to find more quests'
              : 'Be the first to create a quest!'}
          </p>
        </div>
      )}

      {/* Featured Quests Section */}
      <div className="starguide-card">
        <h2 className="text-2xl font-bold text-white mb-6">🌟 Featured Quests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Weekly Challenge',
              description: 'Algorithm mastery quest',
              participants: 156,
              reward: '500 XP'
            },
            {
              title: 'Beginner Bootcamp',
              description: 'Perfect for newcomers',
              participants: 89,
              reward: '200 XP'
            },
            {
              title: 'Expert Arena',
              description: 'Advanced concepts only',
              participants: 23,
              reward: '1000 XP'
            }
          ].map((quest, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">{quest.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{quest.participants} joined</span>
                <span className="text-green-500 font-medium">{quest.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalaxyQuests;