import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  InformationCircleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShareIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const MissionIntel = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock knowledge base data
  const resources = [
    {
      id: 1,
      title: 'JavaScript Fundamentals: Variables and Data Types',
      description: 'Learn the basics of JavaScript variables, including var, let, const, and different data types.',
      type: 'article',
      category: 'JavaScript',
      difficulty: 'beginner',
      author: 'Prof. Smith',
      createdAt: '2024-01-15',
      readTime: '8 min read',
      likes: 156,
      views: 1240,
      tags: ['variables', 'data-types', 'fundamentals'],
      content: 'In JavaScript, variables are containers for storing data values...'
    },
    {
      id: 2,
      title: 'Understanding React Hooks',
      description: 'A comprehensive guide to React Hooks including useState, useEffect, and custom hooks.',
      type: 'video',
      category: 'React',
      difficulty: 'intermediate',
      author: 'Dr. Johnson',
      createdAt: '2024-01-18',
      readTime: '25 min watch',
      likes: 203,
      views: 1890,
      tags: ['hooks', 'useState', 'useEffect', 'react'],
      content: 'React Hooks were introduced in React 16.8...'
    },
    {
      id: 3,
      title: 'Python List Comprehensions Explained',
      description: 'Master the art of list comprehensions in Python with practical examples and best practices.',
      type: 'tutorial',
      category: 'Python',
      difficulty: 'intermediate',
      author: 'Prof. Williams',
      createdAt: '2024-01-20',
      readTime: '12 min read',
      likes: 89,
      views: 567,
      tags: ['list-comprehension', 'python', 'loops'],
      content: 'List comprehensions provide a concise way to create lists...'
    },
    {
      id: 4,
      title: 'CSS Grid Layout Complete Guide',
      description: 'Everything you need to know about CSS Grid, from basic concepts to advanced techniques.',
      type: 'guide',
      category: 'CSS',
      difficulty: 'intermediate',
      author: 'Design Team',
      createdAt: '2024-01-12',
      readTime: '20 min read',
      likes: 234,
      views: 1456,
      tags: ['css-grid', 'layout', 'responsive'],
      content: 'CSS Grid Layout is a powerful layout system available in CSS...'
    },
    {
      id: 5,
      title: 'Algorithm Complexity: Big O Notation',
      description: 'Understand time and space complexity with Big O notation through visual examples.',
      type: 'article',
      category: 'Algorithms',
      difficulty: 'advanced',
      author: 'Dr. Algorithm',
      createdAt: '2024-01-10',
      readTime: '15 min read',
      likes: 178,
      views: 892,
      tags: ['big-o', 'complexity', 'algorithms'],
      content: 'Big O notation is used to describe the performance of algorithms...'
    },
    {
      id: 6,
      title: 'Database Design Best Practices',
      description: 'Learn how to design efficient and scalable database schemas with real-world examples.',
      type: 'guide',
      category: 'Database',
      difficulty: 'advanced',
      author: 'DB Expert',
      createdAt: '2024-01-08',
      readTime: '30 min read',
      likes: 145,
      views: 723,
      tags: ['database', 'schema', 'normalization'],
      content: 'Good database design is crucial for application performance...'
    }
  ];

  const categories = [
    'all', 'JavaScript', 'Python', 'React', 'CSS', 'HTML', 
    'Algorithms', 'Database', 'Node.js', 'DevOps'
  ];

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const resourceTypes = [
    { id: 'article', label: 'Articles', icon: DocumentTextIcon, color: 'text-blue-500' },
    { id: 'video', label: 'Videos', icon: VideoCameraIcon, color: 'text-red-500' },
    { id: 'tutorial', label: 'Tutorials', icon: BookOpenIcon, color: 'text-green-500' },
    { id: 'guide', label: 'Guides', icon: InformationCircleIcon, color: 'text-purple-500' }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getTypeIcon = (type) => {
    const resourceType = resourceTypes.find(rt => rt.id === type);
    return resourceType?.icon || DocumentTextIcon;
  };

  const getTypeColor = (type) => {
    const resourceType = resourceTypes.find(rt => rt.id === type);
    return resourceType?.color || 'text-gray-500';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const ResourceCard = ({ resource }) => {
    const TypeIcon = getTypeIcon(resource.type);
    
    return (
      <div className="starguide-card group hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <TypeIcon className={`w-5 h-5 mr-2 ${getTypeColor(resource.type)}`} />
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {resource.title}
              </h3>
            </div>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
            
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="badge badge-info">{resource.category}</span>
              <span className={`badge text-white ${getDifficultyColor(resource.difficulty)}`}>
                {resource.difficulty}
              </span>
              {resource.tags.slice(0, 2).map(tag => (
                <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              {resource.author}
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {resource.readTime}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <HeartIcon className="w-4 h-4 mr-1 text-red-500" />
              {resource.likes}
            </div>
            <div className="text-gray-500">
              {resource.views} views
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <span className="text-gray-500 text-sm">{resource.createdAt}</span>
          
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm px-3 py-1">
              <ShareIcon className="w-4 h-4 mr-1" />
              Share
            </button>
            <button className="btn-primary text-sm px-3 py-1">
              Read More
            </button>
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
            <InformationCircleIcon className="w-8 h-8 text-blue-500 mr-3" />
            Mission Intel
          </h1>
          <p className="text-gray-400">Your comprehensive knowledge base for learning</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="btn-secondary">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Contribute
          </button>
        </div>
      </div>

      {/* Resource Type Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {resourceTypes.map(type => {
          const count = resources.filter(r => r.type === type.id).length;
          return (
            <div key={type.id} className="starguide-card text-center">
              <type.icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
              <p className="text-xl font-bold text-white">{count}</p>
              <p className="text-gray-400 text-sm">{type.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="starguide-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, tutorials, guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="form-input"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Content */}
      <div className="starguide-card">
        <h2 className="text-2xl font-semibold text-white mb-6">🌟 Featured Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6 rounded-lg border border-blue-500/30">
            <VideoCameraIcon className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Video Series</h3>
            <p className="text-gray-300 text-sm mb-4">Complete React Hooks Masterclass</p>
            <button className="btn-primary text-sm">Watch Now</button>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 p-6 rounded-lg border border-green-500/30">
            <BookOpenIcon className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Interactive Tutorial</h3>
            <p className="text-gray-300 text-sm mb-4">Build a Todo App with JavaScript</p>
            <button className="btn-primary text-sm">Start Tutorial</button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-purple-500/30">
            <DocumentTextIcon className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Study Guide</h3>
            <p className="text-gray-300 text-sm mb-4">Algorithm Interview Preparation</p>
            <button className="btn-primary text-sm">Read Guide</button>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Knowledge Base ({filteredResources.length} resources)
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white text-sm">
              <option>Most Recent</option>
              <option>Most Popular</option>
              <option>Most Liked</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>
        
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <InformationCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div className="starguide-card">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <TagIcon className="w-5 h-5 mr-2" />
          Popular Tags
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {[
            'javascript', 'react', 'python', 'css', 'algorithms', 'database',
            'hooks', 'async', 'api', 'frontend', 'backend', 'debugging'
          ].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="starguide-card">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        
        <div className="space-y-3">
          {[
            { user: 'CodeMaster', action: 'liked', resource: 'React Hooks Guide', time: '2 hours ago' },
            { user: 'JSNinja', action: 'commented on', resource: 'JavaScript Fundamentals', time: '4 hours ago' },
            { user: 'PythonGuru', action: 'shared', resource: 'List Comprehensions', time: '6 hours ago' },
            { user: 'ReactQueen', action: 'bookmarked', resource: 'CSS Grid Layout', time: '1 day ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  {activity.user.charAt(0)}
                </div>
                <span className="text-gray-300 text-sm">
                  <span className="text-white font-medium">{activity.user}</span> {activity.action}{' '}
                  <span className="text-blue-400">{activity.resource}</span>
                </span>
              </div>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionIntel;