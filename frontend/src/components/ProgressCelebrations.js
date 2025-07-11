import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  AcademicCapIcon,
  BoltIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { TrophyIcon as TrophyIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProgressCelebrations = ({ className = '' }) => {
  const { user } = useAuth();
  const [celebrations, setCelebrations] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState(null);

  const achievementTypes = {
    streak: {
      name: 'Study Streak',
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      levels: [
        { days: 3, title: 'Getting Started', message: 'You\'re building a great habit!' },
        { days: 7, title: 'Week Warrior', message: 'A full week of learning!' },
        { days: 14, title: 'Dedicated Learner', message: 'Two weeks of consistent progress!' },
        { days: 30, title: 'Learning Legend', message: 'A month of dedication!' },
        { days: 100, title: 'Pathway Master', message: 'You\'re unstoppable!' }
      ]
    },
    assessment: {
      name: 'Assessment Master',
      icon: '🎯',
      color: 'from-blue-500 to-purple-500',
      levels: [
        { count: 1, title: 'First Steps', message: 'You completed your first assessment!' },
        { count: 5, title: 'Getting Better', message: 'Five assessments completed!' },
        { count: 10, title: 'Assessment Ace', message: 'Ten assessments mastered!' },
        { count: 25, title: 'Testing Expert', message: 'Quarter-century of assessments!' },
        { count: 50, title: 'Evaluation Elite', message: 'Fifty assessments conquered!' }
      ]
    },
    perfect_score: {
      name: 'Perfect Score',
      icon: '⭐',
      color: 'from-yellow-400 to-yellow-600',
      levels: [
        { count: 1, title: 'First Perfect', message: 'Your first perfect score!' },
        { count: 3, title: 'Accuracy Artist', message: 'Three perfect scores!' },
        { count: 5, title: 'Precision Pro', message: 'Five flawless performances!' },
        { count: 10, title: 'Perfectionist', message: 'Ten perfect scores achieved!' }
      ]
    },
    learning_time: {
      name: 'Time Spent Learning',
      icon: '⏰',
      color: 'from-green-500 to-teal-500',
      levels: [
        { hours: 1, title: 'First Hour', message: 'Your learning journey begins!' },
        { hours: 10, title: 'Dedicated Student', message: 'Ten hours of learning!' },
        { hours: 25, title: 'Study Enthusiast', message: 'Twenty-five hours invested!' },
        { hours: 50, title: 'Learning Devotee', message: 'Fifty hours of growth!' },
        { hours: 100, title: 'Knowledge Seeker', message: 'One hundred hours of wisdom!' }
      ]
    },
    level_up: {
      name: 'Level Up',
      icon: '🚀',
      color: 'from-purple-500 to-pink-500',
      levels: [
        { level: 5, title: 'Rising Star', message: 'You\'ve reached Level 5!' },
        { level: 10, title: 'Skilled Learner', message: 'Level 10 achieved!' },
        { level: 20, title: 'Expert Student', message: 'Level 20 mastered!' },
        { level: 30, title: 'Learning Master', message: 'Level 30 conquered!' },
        { level: 50, title: 'Pathway Legend', message: 'Level 50 - You\'re incredible!' }
      ]
    }
  };

  const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];

  useEffect(() => {
    // Listen for achievement events from other components
    const handleAchievement = (event) => {
      const { type, value, data } = event.detail;
      checkForAchievement(type, value, data);
    };

    window.addEventListener('pathwayiq-achievement', handleAchievement);
    return () => window.removeEventListener('pathwayiq-achievement', handleAchievement);
  }, []);

  const checkForAchievement = (type, value, data = {}) => {
    const achievementType = achievementTypes[type];
    if (!achievementType) return;

    const relevantLevels = achievementType.levels.filter(level => {
      if (type === 'streak') return level.days <= value;
      if (type === 'assessment') return level.count <= value;
      if (type === 'perfect_score') return level.count <= value;
      if (type === 'learning_time') return level.hours <= value;
      if (type === 'level_up') return level.level <= value;
      return false;
    });

    const latestAchievement = relevantLevels[relevantLevels.length - 1];
    if (latestAchievement) {
      triggerCelebration({
        id: Date.now(),
        type,
        achievement: latestAchievement,
        icon: achievementType.icon,
        color: achievementType.color,
        data
      });
    }
  };

  const triggerCelebration = (celebration) => {
    setCelebrations(prev => [...prev, celebration]);
    setCurrentCelebration(celebration);
    setShowCelebration(true);
    
    // Create confetti effect
    createConfettiEffect();
    
    // Show toast notification
    toast.success(
      `🎉 ${celebration.achievement.title}! ${celebration.achievement.message}`,
      { duration: 5000, position: 'top-center' }
    );

    // Add to recent achievements
    setRecentAchievements(prev => [celebration, ...prev.slice(0, 4)]);

    // Auto-hide celebration after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentCelebration(null);
    }, 5000);
  };

  const createConfettiEffect = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);

    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = ['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)];
        confetti.style.position = 'absolute';
        confetti.style.fontSize = Math.random() * 20 + 15 + 'px';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-50px';
        confetti.style.opacity = '1';
        confetti.style.transition = 'all 3s ease-out';
        
        confettiContainer.appendChild(confetti);
        
        // Animate confetti falling
        setTimeout(() => {
          confetti.style.top = '110vh';
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
          confetti.style.opacity = '0';
        }, 100);
        
        // Remove confetti piece
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        }, 3100);
      }, i * 100);
    }

    // Remove container after animation
    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 8000);
  };

  const simulateAchievement = (type) => {
    const testValues = {
      streak: 7,
      assessment: 5,
      perfect_score: 1,
      learning_time: 10,
      level_up: 10
    };
    
    checkForAchievement(type, testValues[type]);
  };

  // Expose achievement trigger for other components
  useEffect(() => {
    window.triggerAchievement = (type, value, data) => {
      const event = new CustomEvent('pathwayiq-achievement', {
        detail: { type, value, data }
      });
      window.dispatchEvent(event);
    };
  }, []);

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrophyIcon className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-xl font-semibold text-white">Achievements & Celebrations</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => simulateAchievement('streak')}
            className="btn-secondary text-xs px-2 py-1"
          >
            Test Streak
          </button>
          <button
            onClick={() => simulateAchievement('level_up')}
            className="btn-secondary text-xs px-2 py-1"
          >
            Test Level Up
          </button>
        </div>
      </div>

      {/* Main Celebration Modal */}
      {showCelebration && currentCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 m-4 max-w-md w-full text-center relative overflow-hidden">
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentCelebration.color} opacity-20 animate-pulse`}></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">
                {currentCelebration.icon}
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentCelebration.achievement.title}
              </h2>
              
              <p className="text-gray-300 mb-6 text-lg">
                {currentCelebration.achievement.message}
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <StarIcon className="w-5 h-5 mr-1" />
                  <span>Achievement Unlocked</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="btn-primary"
              >
                Continue Learning! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-4">Recent Achievements</h4>
          <div className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`bg-gradient-to-r ${achievement.color} bg-opacity-20 border border-gray-600 rounded-lg p-4 flex items-center`}
              >
                <div className="text-3xl mr-4">{achievement.icon}</div>
                <div className="flex-1">
                  <h5 className="text-white font-medium">{achievement.achievement.title}</h5>
                  <p className="text-gray-300 text-sm">{achievement.achievement.message}</p>
                </div>
                <div className="text-yellow-400">
                  <TrophyIconSolid className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div>
        <h4 className="text-white font-semibold mb-4">Achievement Progress</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(achievementTypes).map(([type, typeData]) => (
            <div key={type} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{typeData.icon}</span>
                <div>
                  <h5 className="text-white font-medium">{typeData.name}</h5>
                  <p className="text-gray-400 text-sm">
                    {typeData.levels.length} levels available
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {typeData.levels.slice(0, 3).map((level, index) => {
                  const isCompleted = celebrations.some(c => 
                    c.type === type && 
                    JSON.stringify(c.achievement) === JSON.stringify(level)
                  );
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className={`text-sm ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                        {level.title}
                      </span>
                      <div className={`w-4 h-4 rounded-full ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-600'
                      }`}>
                        {isCompleted && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">How to Earn Achievements</h5>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Maintain daily study streaks to unlock streak achievements</li>
          <li>• Complete assessments to earn testing achievements</li>
          <li>• Score perfectly on quizzes for accuracy achievements</li>
          <li>• Spend time learning to unlock time-based rewards</li>
          <li>• Level up your profile through consistent engagement</li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressCelebrations;