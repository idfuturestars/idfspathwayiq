import React, { useState, useEffect } from 'react';

const DailyChallenges = () => {
  const [currentStreak, setCurrentStreak] = useState(7);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: 'Quick Math Sprint',
      description: 'Solve 10 arithmetic problems in under 3 minutes',
      category: 'Mathematics',
      difficulty: 'Easy',
      timeLimit: 180,
      xpReward: 50,
      streakBonus: 10,
      icon: '🔢',
      status: 'completed',
      timeSpent: 145
    },
    {
      id: 2,
      title: 'Science Fact Challenge',
      description: 'Answer 5 questions about the solar system',
      category: 'Science',
      difficulty: 'Medium',
      timeLimit: 300,
      xpReward: 75,
      streakBonus: 15,
      icon: '🌌',
      status: 'available',
      timeSpent: 0
    },
    {
      id: 3,
      title: 'Code Logic Puzzle',
      description: 'Debug a simple programming function',
      category: 'Programming',
      difficulty: 'Hard',
      timeLimit: 600,
      xpReward: 100,
      streakBonus: 25,
      icon: '💻',
      status: 'locked',
      timeSpent: 0
    },
    {
      id: 4,
      title: 'History Timeline',
      description: 'Order historical events chronologically',
      category: 'History',
      difficulty: 'Medium',
      timeLimit: 240,
      xpReward: 75,
      streakBonus: 15,
      icon: '📜',
      status: 'available',
      timeSpent: 0
    },
    {
      id: 5,
      title: 'Grammar Guru',
      description: 'Identify and correct grammatical errors',
      category: 'Language',
      difficulty: 'Easy',
      timeLimit: 180,
      xpReward: 50,
      streakBonus: 10,
      icon: '📝',
      status: 'available',
      timeSpent: 0
    }
  ]);

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const streakDays = [
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: true },
    { day: 'Thu', completed: true },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: true },
    { day: 'Sun', completed: false, today: true }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#666666';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Mathematics': return '🔢';
      case 'Science': return '🔬';
      case 'Programming': return '💻';
      case 'History': return '📜';
      case 'Language': return '📝';
      default: return '📚';
    }
  };

  const startChallenge = (challenge) => {
    if (challenge.status === 'locked') return;
    setSelectedChallenge(challenge);
    setChallengeStarted(true);
    setTimeRemaining(challenge.timeLimit);
  };

  const completeChallenge = (challenge) => {
    setChallenges(prev => prev.map(c => 
      c.id === challenge.id 
        ? { ...c, status: 'completed', timeSpent: challenge.timeLimit - timeRemaining }
        : c
    ));
    setChallengeStarted(false);
    setSelectedChallenge(null);
    setTodayCompleted(true);
    setCurrentStreak(prev => prev + 1);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (challengeStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setChallengeStarted(false);
            alert('Time\'s up!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [challengeStarted, timeRemaining]);

  const ChallengeModal = ({ challenge, onClose, onComplete }) => (
    <div className="challenge-modal-overlay" onClick={onClose}>
      <div className="challenge-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="challenge-icon-large">{challenge.icon}</div>
          <div>
            <h2>{challenge.title}</h2>
            <p>{challenge.description}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {challengeStarted ? (
            <div className="challenge-active">
              <div className="timer-display">
                <div className="timer-circle">
                  <div className="timer-value">{formatTime(timeRemaining)}</div>
                  <div className="timer-label">Time Left</div>
                </div>
              </div>

              <div className="challenge-content">
                <h3>Challenge in Progress</h3>
                <p>This is where the actual challenge content would appear.</p>
                <p>For demo purposes, click "Complete Challenge" to finish.</p>
              </div>

              <div className="challenge-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => onComplete(challenge)}
                >
                  Complete Challenge
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setChallengeStarted(false)}
                >
                  Pause
                </button>
              </div>
            </div>
          ) : (
            <div className="challenge-preview">
              <div className="challenge-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{challenge.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Difficulty</span>
                    <span 
                      className="detail-value"
                      style={{ color: getDifficultyColor(challenge.difficulty) }}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Limit</span>
                    <span className="detail-value">{formatTime(challenge.timeLimit)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">XP Reward</span>
                    <span className="detail-value">{challenge.xpReward} XP</span>
                  </div>
                </div>
              </div>

              <div className="streak-bonus">
                <h4>Streak Bonus</h4>
                <p>Complete this challenge to earn an additional {challenge.streakBonus} XP for your daily streak!</p>
              </div>

              <div className="challenge-actions">
                {challenge.status === 'completed' ? (
                  <button className="btn btn-secondary" disabled>
                    ✓ Completed
                  </button>
                ) : challenge.status === 'locked' ? (
                  <button className="btn btn-secondary" disabled>
                    🔒 Locked
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => startChallenge(challenge)}
                  >
                    Start Challenge
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="daily-challenges">
      <div className="challenges-header">
        <div className="challenges-icon">📅</div>
        <div>
          <h1 className="challenges-title">Daily Challenges</h1>
          <p className="challenges-subtitle">Keep your learning streak alive!</p>
        </div>
      </div>

      <div className="streak-section">
        <div className="streak-card">
          <div className="streak-info">
            <div className="streak-number">{currentStreak}</div>
            <div className="streak-label">Day Streak</div>
            <div className="streak-message">
              {todayCompleted ? "Great job today! 🎉" : "Complete a challenge to continue your streak!"}
            </div>
          </div>

          <div className="streak-calendar">
            {streakDays.map((day, index) => (
              <div 
                key={index} 
                className={`streak-day ${day.completed ? 'completed' : ''} ${day.today ? 'today' : ''}`}
              >
                <div className="day-label">{day.day}</div>
                <div className="day-indicator">
                  {day.completed ? '✓' : day.today ? '○' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="challenges-grid">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id} 
            className={`challenge-card ${challenge.status}`}
            onClick={() => setSelectedChallenge(challenge)}
          >
            <div className="challenge-header">
              <div className="challenge-icon">{challenge.icon}</div>
              <div className="challenge-status">
                {challenge.status === 'completed' && <span className="status-badge completed">✓</span>}
                {challenge.status === 'locked' && <span className="status-badge locked">🔒</span>}
              </div>
            </div>

            <div className="challenge-content">
              <h3 className="challenge-title">{challenge.title}</h3>
              <p className="challenge-description">{challenge.description}</p>

              <div className="challenge-meta">
                <div className="meta-item">
                  <span className="meta-icon">{getCategoryIcon(challenge.category)}</span>
                  <span className="meta-text">{challenge.category}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📊</span>
                  <span 
                    className="meta-text"
                    style={{ color: getDifficultyColor(challenge.difficulty) }}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span className="meta-text">{formatTime(challenge.timeLimit)}</span>
                </div>
              </div>

              <div className="challenge-rewards">
                <div className="reward-item">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-text">{challenge.xpReward} XP</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">🔥</span>
                  <span className="reward-text">+{challenge.streakBonus} streak bonus</span>
                </div>
              </div>

              {challenge.status === 'completed' && (
                <div className="completion-info">
                  <span className="completion-time">
                    Completed in {formatTime(challenge.timeSpent)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedChallenge && (
        <ChallengeModal 
          challenge={selectedChallenge}
          onClose={() => {
            setSelectedChallenge(null);
            setChallengeStarted(false);
          }}
          onComplete={completeChallenge}
        />
      )}
    </div>
  );
};

export default DailyChallenges;