import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const LearningCircles = () => {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockCircles = [
    {
      id: '1',
      name: 'Web Development Study Circle',
      description: 'Collaborative learning for aspiring web developers',
      category: 'technology',
      level: 'beginner',
      members: 24,
      max_members: 30,
      activity_score: 95,
      created_date: '2024-01-15',
      creator: 'Sarah Chen',
      study_hours_week: 8,
      next_session: '2024-02-01T18:00:00Z',
      topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
      private: false
    },
    {
      id: '2',
      name: 'Data Science Pathway Circle',
      description: 'Exploring data science careers and building foundational skills',
      category: 'career',
      level: 'intermediate',
      members: 18,
      max_members: 25,
      activity_score: 88,
      created_date: '2024-01-20',
      creator: 'Dr. Rodriguez',
      study_hours_week: 10,
      next_session: '2024-02-02T19:00:00Z',
      topics: ['Python', 'Statistics', 'Machine Learning', 'SQL'],
      private: false
    },
    {
      id: '3',
      name: 'College Prep Support Group',
      description: 'High school students preparing for college applications',
      category: 'academic',
      level: 'beginner',
      members: 32,
      max_members: 35,
      activity_score: 92,
      created_date: '2024-01-10',
      creator: 'Ms. Johnson',
      study_hours_week: 6,
      next_session: '2024-02-01T16:00:00Z',
      topics: ['SAT Prep', 'Essay Writing', 'College Search', 'Financial Aid'],
      private: false
    },
    {
      id: '4',
      name: 'Career Transition Network',
      description: 'Supporting professionals making career changes',
      category: 'career',
      level: 'advanced',
      members: 15,
      max_members: 20,
      activity_score: 85,
      created_date: '2024-01-25',
      creator: 'Michael Park',
      study_hours_week: 5,
      next_session: '2024-02-03T17:00:00Z',
      topics: ['Resume Building', 'Interview Skills', 'Networking', 'Skill Assessment'],
      private: true
    }
  ];

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    setLoading(true);
    try {
      // Use mock data for now
      setTimeout(() => {
        setCircles(mockCircles);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load learning circles:', error);
      setCircles(mockCircles);
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId) => {
    try {
      // API call would go here
      alert(`Successfully joined learning circle!`);
    } catch (error) {
      console.error('Failed to join circle:', error);
      alert('Failed to join learning circle. Please try again.');
    }
  };

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || circle.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic': return AcademicCapIcon;
      case 'career': return BriefcaseIcon;
      case 'technology': return BookOpenIcon;
      default: return UserGroupIcon;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-gray-600';
      case 'intermediate': return 'bg-gray-500';
      case 'advanced': return 'bg-gray-400';
      default: return 'bg-gray-600';
    }
  };

  const CircleCard = ({ circle }) => {
    const CategoryIcon = getCategoryIcon(circle.category);
    const nextSession = new Date(circle.next_session);
    
    return (
      <div className="starguide-card hover:border-gray-500 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <CategoryIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-xl font-semibold text-white">{circle.name}</h3>
              {circle.private && (
                <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Private</span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">{circle.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className={`badge ${getLevelColor(circle.level)}`}>
                {circle.level}
              </span>
              <span className="badge bg-gray-700 text-gray-300">{circle.category}</span>
              <span className="text-gray-400 text-sm">by {circle.creator}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-gray-300 font-bold text-lg">{circle.activity_score}%</div>
            <div className="text-gray-400 text-sm">Activity</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-400">
            <UsersIcon className="w-4 h-4 mr-1" />
            {circle.members}/{circle.max_members} members
          </div>
          <div className="flex items-center text-gray-400">
            <ClockIcon className="w-4 h-4 mr-1" />
            {circle.study_hours_week}h/week
          </div>
          <div className="flex items-center text-gray-400">
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
            Next: {nextSession.toLocaleDateString()}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Focus Areas:</div>
          <div className="flex flex-wrap gap-2">
            {circle.topics.map((topic, index) => (
              <span key={index} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            Active community
          </div>

          <button
            onClick={() => handleJoinCircle(circle.id)}
            disabled={circle.members >= circle.max_members}
            className="btn-primary"
          >
            <UserGroupIcon className="w-4 h-4 mr-2" />
            Join Circle
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
            <UserGroupIcon className="w-8 h-8 text-purple-500 mr-3" />
            Learning Circles
          </h1>
          <p className="text-gray-400">Collaborate and learn together in supportive communities</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Circle
        </button>
      </div>

      {/* Filters */}
      <div className="starguide-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search learning circles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="career">Career</option>
              <option value="technology">Technology</option>
              <option value="personal">Personal Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Circle Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCircles.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </div>
      )}

      {!loading && filteredCircles.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No learning circles found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters to find more circles'
              : 'Be the first to create a learning circle!'}
          </p>
        </div>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="starguide-card text-center">
          <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">{circles.length}</h3>
          <p className="text-gray-400 text-sm">Active Circles</p>
        </div>
        
        <div className="starguide-card text-center">
          <UsersIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">
            {circles.reduce((sum, circle) => sum + circle.members, 0)}
          </h3>
          <p className="text-gray-400 text-sm">Total Members</p>
        </div>
        
        <div className="starguide-card text-center">
          <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">
            {Math.round(circles.reduce((sum, circle) => sum + circle.study_hours_week, 0) / circles.length) || 0}
          </h3>
          <p className="text-gray-400 text-sm">Avg Hours/Week</p>
        </div>
        
        <div className="starguide-card text-center">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white mb-1">
            {Math.round(circles.reduce((sum, circle) => sum + circle.activity_score, 0) / circles.length) || 0}%
          </h3>
          <p className="text-gray-400 text-sm">Avg Activity</p>
        </div>
      </div>
    </div>
  );
};

export default LearningCircles;