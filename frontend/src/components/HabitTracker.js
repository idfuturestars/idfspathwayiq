import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  ChartBarIcon, 
  TrophyIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const HabitTracker = ({ className = '' }) => {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-habits');
    return saved ? JSON.parse(saved) : [
      {
        id: 'daily-study',
        name: 'Daily Study Session',
        icon: '📚',
        target: 1,
        unit: 'session',
        streak: 0,
        completedToday: false,
        history: {}
      },
      {
        id: 'practice-problems',
        name: 'Practice Problems',
        icon: '🧮',
        target: 5,
        unit: 'problems',
        streak: 0,
        completedToday: false,
        history: {}
      },
      {
        id: 'reading',
        name: 'Educational Reading',
        icon: '📖',
        target: 30,
        unit: 'minutes',
        streak: 0,
        completedToday: false,
        history: {}
      }
    ];
  });

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    icon: '🎯',
    target: 1,
    unit: 'session'
  });

  useEffect(() => {
    localStorage.setItem('pathwayiq-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    // Check if it's a new day and reset daily completion
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('pathwayiq-last-habit-check');
    
    if (lastCheck !== today) {
      setHabits(prev => prev.map(habit => ({
        ...habit,
        completedToday: false
      })));
      localStorage.setItem('pathwayiq-last-habit-check', today);
    }
  }, []);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const completeHabit = (habitId) => {
    const today = getTodayString();
    
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId && !habit.completedToday) {
        const newHistory = { ...habit.history, [today]: true };
        const newStreak = calculateStreak(newHistory);
        
        return {
          ...habit,
          completedToday: true,
          history: newHistory,
          streak: newStreak
        };
      }
      return habit;
    }));
  };

  const uncompleteHabit = (habitId) => {
    const today = getTodayString();
    
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId && habit.completedToday) {
        const newHistory = { ...habit.history };
        delete newHistory[today];
        const newStreak = calculateStreak(newHistory);
        
        return {
          ...habit,
          completedToday: false,
          history: newHistory,
          streak: newStreak
        };
      }
      return habit;
    }));
  };

  const calculateStreak = (history) => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      if (history[dateString]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const habit = {
      id: Date.now().toString(),
      ...newHabit,
      streak: 0,
      completedToday: false,
      history: {}
    };
    
    setHabits(prev => [...prev, habit]);
    setNewHabit({ name: '', icon: '🎯', target: 1, unit: 'session' });
    setShowAddHabit(false);
  };

  const deleteHabit = (habitId) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const getCompletionRate = (habit) => {
    const history = habit.history;
    const entries = Object.values(history);
    if (entries.length === 0) return 0;
    return Math.round((entries.filter(Boolean).length / entries.length) * 100);
  };

  const getWeeklyProgress = (habit) => {
    const week = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      week.push({
        date: dateString,
        completed: habit.history[dateString] || false,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return week;
  };

  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const completedToday = habits.filter(habit => habit.completedToday).length;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FireIcon className="w-6 h-6 text-orange-500 mr-3" />
          <h3 className="text-xl font-semibold text-white">Learning Habits</h3>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-green-400">
            <CheckCircleIconSolid className="w-5 h-5 mr-1" />
            {completedToday}/{habits.length} today
          </div>
          <div className="flex items-center text-orange-400">
            <FireIcon className="w-5 h-5 mr-1" />
            {totalStreaks} total streaks
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4 mb-6">
        {habits.map(habit => (
          <div key={habit.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{habit.icon}</span>
                <div>
                  <h4 className="text-white font-medium">{habit.name}</h4>
                  <p className="text-gray-400 text-sm">
                    Target: {habit.target} {habit.unit}{habit.target > 1 ? 's' : ''} daily
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {habit.streak > 0 && (
                  <div className="flex items-center text-orange-400">
                    <FireIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{habit.streak}</span>
                  </div>
                )}
                
                <button
                  onClick={() => habit.completedToday ? uncompleteHabit(habit.id) : completeHabit(habit.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    habit.completedToday
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {getWeeklyProgress(habit).map((day, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      day.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {day.day.charAt(0)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-right">
                <p className="text-gray-400 text-xs">Completion Rate</p>
                <p className="text-white font-medium">{getCompletionRate(habit)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Habit */}
      {showAddHabit ? (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Add New Habit</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Habit name"
              value={newHabit.name}
              onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={newHabit.icon}
              onChange={(e) => setNewHabit(prev => ({ ...prev, icon: e.target.value }))}
              className="form-input text-center"
            />
            <input
              type="number"
              placeholder="Target"
              value={newHabit.target}
              onChange={(e) => setNewHabit(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
              className="form-input"
              min="1"
            />
            <select
              value={newHabit.unit}
              onChange={(e) => setNewHabit(prev => ({ ...prev, unit: e.target.value }))}
              className="form-input"
            >
              <option value="session">Session</option>
              <option value="minute">Minute</option>
              <option value="problem">Problem</option>
              <option value="page">Page</option>
              <option value="chapter">Chapter</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={addHabit}
              className="btn-primary"
            >
              Add Habit
            </button>
            <button
              onClick={() => setShowAddHabit(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddHabit(true)}
          className="w-full py-3 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors"
        >
          + Add New Learning Habit
        </button>
      )}
    </div>
  );
};

export default HabitTracker;