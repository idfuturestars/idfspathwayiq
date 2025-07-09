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

const LearningJourneys = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockJourneys = [
    {
      id: '1',
      name: 'JavaScript Mastery Path',
      description: 'Master JavaScript fundamentals through hands-on challenges and projects',
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
      achievement_reward: 'JavaScript Explorer'
    },
    {
      id: '2',
      name: 'React Development Journey',
      description: 'Build modern web applications with React and component-based architecture',
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
      achievement_reward: 'React Champion'
    },
    {
      id: '3',
      name: 'Python Data Science Path',
      description: 'Explore data science concepts and machine learning with Python',
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
      achievement_reward: 'Python Master'
    }
  ];

  useEffect(() => {
    loadJourneys();
  }, [activeTab]);

  const loadJourneys = async () => {
    setLoading(true);
    try {
      // For now, use mock data since backend might not have journey data yet
      setTimeout(() => {
        setJourneys(mockJourneys);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load journeys:', error);
      setJourneys(mockJourneys);
      setLoading(false);
    }
  };

  const handleJoinJourney = async (journeyId, roomCode) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/quiz-rooms/${roomCode}/join`);
      // Redirect to journey room or update UI
      alert(`Successfully joined journey! Room code: ${roomCode}`);
    } catch (error) {
      console.error('Failed to join journey:', error);
      alert('Failed to join journey. Please try again.');
    }
  };

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = journey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journey.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || journey.difficulty === selectedDifficulty;
    const matchesSubject = !selectedSubject || journey.subject === selectedSubject;
    
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

  const JourneyCard = ({ journey }) => (
    <div className="starguide-card group hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {journey.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3">{journey.description}</p>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className={`badge ${getDifficultyColor(journey.difficulty)} text-white`}>
              {journey.difficulty}
            </span>
            <span className="badge badge-info">{journey.subject}</span>
            <span className="text-gray-400 text-sm">by {journey.creator_name}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-blue-500 font-bold text-lg">+{journey.xp_reward} XP</div>
          {journey.achievement_reward && (
            <div className="text-yellow-500 text-sm flex items-center mt-1">
              <StarIcon className="w-4 h-4 mr-1" />
              {journey.achievement_reward}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
        <div className="flex items-center text-gray-400">
          <UsersIcon className="w-4 h-4 mr-1" />
          {journey.participants.length}/{journey.max_participants}
        </div>
        <div className="flex items-center text-gray-400">
          <ClockIcon className="w-4 h-4 mr-1" />
          {journey.estimated_time}
        </div>
        <div className="flex items-center text-gray-400">
          <TrophyIcon className="w-4 h-4 mr-1" />
          {journey.questions_per_game} questions
        </div>
        <div className="text-gray-400">
          Code: <span className="font-mono text-white">{journey.room_code}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {journey.participants.slice(0, 3).map((participant, index) => (
            <div
              key={index}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-bold"
            >
              {participant.charAt(0).toUpperCase()}
            </div>
          ))}
          {journey.participants.length > 3 && (
            <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs">
              +{journey.participants.length - 3}
            </div>
          )}
        </div>

        <button
          onClick={() => handleJoinJourney(journey.id, journey.room_code)}
          disabled={journey.participants.length >= journey.max_participants}
          className="btn-primary"
        >
          <PlayIcon className="w-4 h-4 mr-2" />
          Start Journey
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
            Learning Journeys
          </h1>
          <p className="text-gray-400">Navigate your path to mastery</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Journey
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'public', label: 'Public Journeys', count: filteredJourneys.length },
          { id: 'joined', label: 'My Journeys', count: 0 },
          { id: 'created', label: 'Created by Me', count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
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
                placeholder="Search journeys by name or description..."
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

      {/* Journey Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}

      {!loading && filteredJourneys.length === 0 && (
        <div className="text-center py-12">
          <MapIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No journeys found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedDifficulty || selectedSubject
              ? 'Try adjusting your filters to find more journeys'
              : 'Be the first to create a learning journey!'}
          </p>
        </div>
      )}

      {/* Featured Journeys Section */}
      <div className="starguide-card">
        <h2 className="text-2xl font-bold text-white mb-6">🌟 Featured Journeys</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Weekly Challenge',
              description: 'Algorithm mastery journey',
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
          ].map((journey, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">{journey.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{journey.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{journey.participants} joined</span>
                <span className="text-blue-500 font-medium">{journey.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningJourneys;