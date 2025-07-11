import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  PencilIcon, 
  CalendarDaysIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  HeartIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudyJournal = ({ className = '' }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-journal');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    content: '',
    tags: [],
    mood: 'neutral',
    difficulty: 'medium',
    insights: '',
    questions: '',
    type: 'reflection'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const entryTypes = {
    reflection: { name: 'Reflection', icon: '💭', color: 'blue' },
    lesson_notes: { name: 'Lesson Notes', icon: '📝', color: 'green' },
    question: { name: 'Questions', icon: '❓', color: 'yellow' },
    insight: { name: 'Insights', icon: '💡', color: 'purple' },
    struggle: { name: 'Challenges', icon: '⚠️', color: 'red' },
    goal: { name: 'Goals', icon: '🎯', color: 'orange' }
  };

  const moods = {
    excited: { emoji: '🤩', name: 'Excited', color: 'text-yellow-400' },
    confident: { emoji: '😊', name: 'Confident', color: 'text-green-400' },
    neutral: { emoji: '😐', name: 'Neutral', color: 'text-gray-400' },
    confused: { emoji: '😕', name: 'Confused', color: 'text-orange-400' },
    frustrated: { emoji: '😤', name: 'Frustrated', color: 'text-red-400' }
  };

  const difficulties = {
    easy: { name: 'Easy', color: 'text-green-400' },
    medium: { name: 'Medium', color: 'text-yellow-400' },
    hard: { name: 'Hard', color: 'text-red-400' }
  };

  useEffect(() => {
    localStorage.setItem('pathwayiq-journal', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = async () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      toast.error('Please add both a title and content');
      return;
    }

    const entry = {
      id: Date.now().toString(),
      ...currentEntry,
      date: new Date().toISOString(),
      user_id: user?.id
    };

    setEntries(prev => [entry, ...prev]);
    setCurrentEntry({
      title: '',
      content: '',
      tags: [],
      mood: 'neutral',
      difficulty: 'medium',
      insights: '',
      questions: '',
      type: 'reflection'
    });
    setShowNewEntry(false);

    // Trigger achievement if this is a milestone
    if (entries.length + 1 === 1) {
      window.triggerAchievement?.('journal', 1, { type: 'first_entry' });
    } else if ((entries.length + 1) % 5 === 0) {
      window.triggerAchievement?.('journal', entries.length + 1, { milestone: true });
    }

    toast.success('Journal entry saved! 📝');

    // Auto-generate insights if AI is available
    generateAIInsights(entry);
  };

  const generateAIInsights = async (entry) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/ai/journal-insights`,
        {
          entry_content: entry.content,
          entry_type: entry.type,
          mood: entry.mood,
          tags: entry.tags
        }
      );

      if (response.data.insights) {
        toast.success('AI generated insights for your entry! 🤖✨');
        
        // Add AI insights as a follow-up entry
        const insightEntry = {
          id: Date.now().toString() + '_ai',
          title: `AI Insights: ${entry.title}`,
          content: response.data.insights,
          tags: [...entry.tags, 'ai-generated'],
          mood: 'neutral',
          difficulty: 'medium',
          type: 'insight',
          date: new Date().toISOString(),
          user_id: user?.id,
          parent_entry: entry.id
        };

        setEntries(prev => [insightEntry, ...prev]);
      }
    } catch (error) {
      console.log('AI insights not available:', error);
    }
  };

  const deleteEntry = (entryId) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast.success('Entry deleted');
  };

  const addTag = (tag) => {
    if (tag && !currentEntry.tags.includes(tag)) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getAllTags = () => {
    const allTags = entries.flatMap(entry => entry.tags || []);
    return [...new Set(allTags)];
  };

  const getFilteredEntries = () => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter(entry => entry.tags.includes(filterTag));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryStats = () => {
    const totalEntries = entries.length;
    const thisWeek = entries.filter(entry => 
      new Date(entry.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const moodDistribution = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    return { totalEntries, thisWeek, moodDistribution };
  };

  const stats = getEntryStats();
  const filteredEntries = getFilteredEntries();

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpenIcon className="w-6 h-6 text-blue-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Study Journal</h3>
        </div>
        <button
          onClick={() => setShowNewEntry(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Total Entries</p>
          <p className="text-white text-2xl font-bold">{stats.totalEntries}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">This Week</p>
          <p className="text-blue-400 text-2xl font-bold">{stats.thisWeek}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Most Common Mood</p>
          <p className="text-green-400 text-2xl font-bold">
            {Object.keys(stats.moodDistribution).length > 0 
              ? moods[Object.keys(stats.moodDistribution).reduce((a, b) => 
                  stats.moodDistribution[a] > stats.moodDistribution[b] ? a : b
                )]?.emoji || '😐'
              : '😐'
            }
          </p>
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">New Journal Entry</h3>
            
            <div className="space-y-4">
              {/* Entry Type */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Entry Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(entryTypes).map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentEntry(prev => ({ ...prev, type: key }))}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        currentEntry.type === key
                          ? `bg-${type.color}-600 text-white`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {type.icon} {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={currentEntry.title}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for your entry..."
                  className="form-input"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Content</label>
                <textarea
                  value={currentEntry.content}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your thoughts, notes, or reflections..."
                  rows={6}
                  className="form-input"
                />
              </div>

              {/* Mood and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Mood</label>
                  <select
                    value={currentEntry.mood}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, mood: e.target.value }))}
                    className="form-input"
                  >
                    {Object.entries(moods).map(([key, mood]) => (
                      <option key={key} value={key}>
                        {mood.emoji} {mood.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Difficulty</label>
                  <select
                    value={currentEntry.difficulty}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="form-input"
                  >
                    {Object.entries(difficulties).map(([key, diff]) => (
                      <option key={key} value={key}>
                        {diff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentEntry.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter..."
                  className="form-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Key Insights (Optional)</label>
                  <textarea
                    value={currentEntry.insights}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, insights: e.target.value }))}
                    placeholder="What did you learn or discover?"
                    rows={3}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Questions (Optional)</label>
                  <textarea
                    value={currentEntry.questions}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, questions: e.target.value }))}
                    placeholder="What questions do you still have?"
                    rows={3}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={saveEntry} className="btn-primary">
                Save Entry
              </button>
              <button
                onClick={() => setShowNewEntry(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="form-input"
        >
          <option value="all">All Tags</option>
          {getAllTags().map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="form-input"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <BookOpenIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No journal entries found</p>
            <p className="text-gray-500 text-sm">Start your learning journey by creating your first entry!</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{entryTypes[entry.type]?.icon || '📝'}</span>
                  <div>
                    <h4 className="text-white font-medium">{entry.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{formatDate(entry.date)}</span>
                      <span className={moods[entry.mood]?.color}>
                        {moods[entry.mood]?.emoji} {moods[entry.mood]?.name}
                      </span>
                      <span className={difficulties[entry.difficulty]?.color}>
                        {difficulties[entry.difficulty]?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-3">{entry.content}</p>
              
              {entry.insights && (
                <div className="bg-blue-900 rounded-lg p-3 mb-3">
                  <p className="text-blue-300 text-sm font-medium mb-1">💡 Key Insights:</p>
                  <p className="text-blue-100 text-sm">{entry.insights}</p>
                </div>
              )}
              
              {entry.questions && (
                <div className="bg-yellow-900 rounded-lg p-3 mb-3">
                  <p className="text-yellow-300 text-sm font-medium mb-1">❓ Questions:</p>
                  <p className="text-yellow-100 text-sm">{entry.questions}</p>
                </div>
              )}
              
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyJournal;