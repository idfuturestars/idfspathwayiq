import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const LearningPods = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-pods');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    subject: '',
    max_members: 20,
    is_private: false
  });

  // Mock data for demonstration
  const mockStudyGroups = [
    {
      id: '1',
      name: 'JavaScript Beginners Circle',
      description: 'A supportive community for those starting their JavaScript journey',
      subject: 'JavaScript',
      members: ['user1', 'user2', 'user3', 'user4'],
      max_members: 20,
      is_private: false,
      created_by: 'instructor1',
      created_at: new Date('2024-01-15'),
      activity_level: 'high',
      last_message: 'Anyone working on async/await?',
      creator_name: 'Alex Johnson'
    },
    {
      id: '2',
      name: 'React Developers Hub',
      description: 'Share knowledge, projects, and best practices for React development',
      subject: 'React',
      members: ['user1', 'user5', 'user6'],
      max_members: 15,
      is_private: false,
      created_by: 'instructor2',
      created_at: new Date('2024-01-10'),
      activity_level: 'medium',
      last_message: 'Check out this new hook pattern!',
      creator_name: 'Sarah Chen'
    },
    {
      id: '3',
      name: 'Python Data Science Team',
      description: 'Exploring data science concepts and libraries with Python',
      subject: 'Python',
      members: ['user1', 'user7', 'user8', 'user9', 'user10'],
      max_members: 12,
      is_private: true,
      created_by: user?.id,
      created_at: new Date('2024-01-20'),
      activity_level: 'high',
      last_message: 'New pandas tutorial uploaded!',
      creator_name: user?.username || 'You'
    }
  ];

  useEffect(() => {
    loadStudyGroups();
  }, [activeTab]);

  const loadStudyGroups = async () => {
    setLoading(true);
    try {
      // For demo purposes, using mock data
      setTimeout(() => {
        if (activeTab === 'my-pods') {
          setStudyGroups(mockStudyGroups.filter(group => 
            group.members.includes(user?.id) || group.created_by === user?.id
          ));
        } else {
          setStudyGroups(mockStudyGroups.filter(group => !group.is_private));
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load study groups:', error);
      setStudyGroups(mockStudyGroups);
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/study-groups`,
        createForm
      );
      setStudyGroups([response.data, ...studyGroups]);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        subject: '',
        max_members: 20,
        is_private: false
      });
    } catch (error) {
      console.error('Failed to create study group:', error);
      alert('Failed to create study group. Please try again.');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/study-groups/${groupId}/join`);
      loadStudyGroups();
      alert('Successfully joined the learning pod!');
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Failed to join group. Please try again.');
    }
  };

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActivityColor = (level) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const StudyGroupCard = ({ group }) => {
    const isCreator = group.created_by === user?.id;
    const isMember = group.members.includes(user?.id);
    
    return (
      <div className="starguide-card group hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                {group.name}
              </h3>
              {group.is_private && (
                <LockClosedIcon className="w-5 h-5 text-yellow-500 ml-2" />
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">{group.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="badge badge-info">{group.subject}</span>
              <div className="flex items-center text-gray-400 text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${getActivityColor(group.activity_level)}`}></div>
                {group.activity_level} activity
              </div>
              <span className="text-gray-500 text-sm">
                Created {group.created_at.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
            Latest message:
          </div>
          <p className="text-gray-300 text-sm italic">"{group.last_message}"</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400 text-sm">
              <UsersIcon className="w-4 h-4 mr-1" />
              {group.members.length}/{group.max_members}
            </div>
            
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map((member, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-bold"
                >
                  {member.charAt(0).toUpperCase()}
                </div>
              ))}
              {group.members.length > 4 && (
                <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {isCreator && (
              <button className="btn-secondary text-sm px-3 py-1">
                <ShareIcon className="w-4 h-4 mr-1" />
                Manage
              </button>
            )}
            
            {!isMember && !isCreator ? (
              <button
                onClick={() => handleJoinGroup(group.id)}
                className="btn-primary text-sm px-4 py-2"
                disabled={group.members.length >= group.max_members}
              >
                Join Pod
              </button>
            ) : (
              <button className="btn-primary text-sm px-4 py-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                Enter
              </button>
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
            <UserGroupIcon className="w-8 h-8 text-purple-500 mr-3" />
            Learning Pods
          </h1>
          <p className="text-gray-400">Collaborate and learn together</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Pod
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'my-pods', label: 'My Pods', icon: UserGroupIcon },
          { id: 'discover', label: 'Discover', icon: GlobeAltIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="starguide-card">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search learning pods by name, subject, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Study Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <StudyGroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {!loading && filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No learning pods found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : activeTab === 'my-pods'
              ? 'Join or create your first learning pod!'
              : 'No public pods available right now'}
          </p>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="starguide-card text-center">
          <BookOpenIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">12</h3>
          <p className="text-gray-400">Active Subjects</p>
        </div>
        
        <div className="starguide-card text-center">
          <UsersIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">247</h3>
          <p className="text-gray-400">Total Members</p>
        </div>
        
        <div className="starguide-card text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">1,543</h3>
          <p className="text-gray-400">Messages Today</p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create Learning Pod</h2>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Pod Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter pod name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  required
                  className="form-input"
                  rows="3"
                  placeholder="Describe your learning pod"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  required
                  className="form-input"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({...createForm, subject: e.target.value})}
                >
                  <option value="">Select subject</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="React">React</option>
                  <option value="CSS">CSS</option>
                  <option value="Node.js">Node.js</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Members</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  className="form-input"
                  value={createForm.max_members}
                  onChange={(e) => setCreateForm({...createForm, max_members: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_private"
                  className="mr-2"
                  checked={createForm.is_private}
                  onChange={(e) => setCreateForm({...createForm, is_private: e.target.checked})}
                />
                <label htmlFor="is_private" className="text-gray-300">Make this pod private</label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Pod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPods;