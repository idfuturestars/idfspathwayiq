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
  AcademicCapIcon,
  BriefcaseIcon
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
      name: 'Web Development Pathway',
      description: 'Complete journey from HTML basics to full-stack development',
      subject: 'Web Development',
      difficulty: 'beginner',
      max_participants: 25,
      participants: ['user1', 'user2', 'user3'],
      milestones: 12,
      estimated_duration: '8 weeks',
      created_by: 'instructor1',
      is_active: true,
      pathway_code: 'WEB001',
      creator_name: 'Prof. Chen',
      estimated_time: '45 min per session',
      progress_points: 200,
      pathway_type: 'career'
    },
    {
      id: '2',
      name: 'Data Science Discovery',
      description: 'Explore data science fundamentals and career opportunities',
      subject: 'Data Science',
      difficulty: 'intermediate',
      max_participants: 20,
      participants: ['user4', 'user5'],
      milestones: 15,
      estimated_duration: '10 weeks',
      created_by: 'instructor2',
      is_active: true,
      pathway_code: 'DS002',
      creator_name: 'Dr. Rodriguez',
      estimated_time: '60 min per session',
      progress_points: 350,
      pathway_type: 'career'
    },
    {
      id: '3',
      name: 'College Preparation Track',
      description: 'Comprehensive preparation for college applications and entrance exams',
      subject: 'Academic Prep',
      difficulty: 'intermediate',
      max_participants: 30,
      participants: ['user6', 'user7', 'user8', 'user9'],
      milestones: 20,
      estimated_duration: '16 weeks',
      created_by: 'instructor3',
      is_active: true,
      pathway_code: 'PREP003',
      creator_name: 'Prof. Johnson',
      estimated_time: '90 min per session',
      progress_points: 500,
      pathway_type: 'academic'
    }
  ];

  useEffect(() => {
    loadJourneys();
  }, [activeTab]);

  const loadJourneys = async () => {
    setLoading(true);
    try {
      // Use mock data for now
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

  const handleJoinJourney = async (journeyId, pathwayCode) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/learning-journeys/${pathwayCode}/join`);
      alert(`Successfully joined learning journey! Pathway code: ${pathwayCode}`);
    } catch (error) {
      console.error('Failed to join journey:', error);
      alert('Failed to join learning journey. Please try again.');
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
      case 'beginner': return 'bg-gray-600';
      case 'intermediate': return 'bg-gray-500';
      case 'advanced': return 'bg-gray-400';
      case 'expert': return 'bg-white text-black';
      default: return 'bg-gray-600';
    }
  };

  const getPathwayTypeIcon = (type) => {
    return type === 'academic' ? AcademicCapIcon : BriefcaseIcon;
  };

  const JourneyCard = ({ journey }) => {
    const TypeIcon = getPathwayTypeIcon(journey.pathway_type);
    
    return (
      <div className="starguide-card group hover:border-gray-500 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gray-300 transition-colors">
              {journey.name}
            </h3>
            <p className="text-gray-400 text-sm mb-3">{journey.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className={`badge ${getDifficultyColor(journey.difficulty)}`}>
                {journey.difficulty}
              </span>
              <span className="badge bg-gray-700 text-gray-300">{journey.subject}</span>
              <span className="text-gray-400 text-sm">by {journey.creator_name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-gray-300 font-bold text-lg">+{journey.progress_points} Points</div>
            <div className="text-gray-400 text-sm flex items-center mt-1">
              <TypeIcon className="w-4 h-4 mr-1" />
              {journey.pathway_type}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div className="flex items-center text-gray-400">
            <UsersIcon className="w-4 h-4 mr-1" />
            {journey.participants.length}/{journey.max_participants}
          </div>
          <div className="flex items-center text-gray-400">
            <ClockIcon className="w-4 h-4 mr-1" />
            {journey.estimated_duration}
          </div>
          <div className="flex items-center text-gray-400">
            <TrophyIcon className="w-4 h-4 mr-1" />
            {journey.milestones} milestones
          </div>
          <div className="text-gray-400">
            Code: <span className="font-mono text-white">{journey.pathway_code}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {journey.participants.slice(0, 3).map((participant, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-bold"
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
            onClick={() => handleJoinJourney(journey.id, journey.pathway_code)}
            disabled={journey.participants.length >= journey.max_participants}
            className="btn-primary"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Join Journey
          </button>
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
            <MapIcon className="w-8 h-8 text-gray-400 mr-3" />
            Learning Journeys
          </h1>
          <p className="text-gray-400">Structured pathways for educational and career development</p>
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
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-600 px-2 py-0.5 rounded-full text-xs">
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
                placeholder="Search learning journeys..."
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
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Academic Prep">Academic Prep</option>
              <option value="Programming">Programming</option>
              <option value="Career Planning">Career Planning</option>
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
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No learning journeys found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedDifficulty || selectedSubject
              ? 'Try adjusting your filters to find more journeys'
              : 'Be the first to create a learning journey!'}
          </p>
        </div>
      )}

      {/* Featured Pathways Section */}
      <div className="starguide-card">
        <h2 className="text-2xl font-bold text-white mb-6">🗺️ Featured Pathways</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Career Transition',
              description: 'Switch careers with confidence',
              participants: 89,
              reward: '400 Points'
            },
            {
              title: 'College Success',
              description: 'Excel in higher education',
              participants: 156,
              reward: '350 Points'
            },
            {
              title: 'Skill Mastery',
              description: 'Deep dive into expertise',
              participants: 67,
              reward: '500 Points'
            }
          ].map((pathway, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">{pathway.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{pathway.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{pathway.participants} enrolled</span>
                <span className="text-gray-400 font-medium">{pathway.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningJourneys;