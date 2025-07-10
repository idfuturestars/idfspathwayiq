import React, { useState, useEffect } from 'react';

const GalaxyQuests = () => {
  const [quests, setQuests] = useState([
    {
      id: 1,
      title: 'The Martian Mathematics',
      description: 'Help establish the first Mars colony by solving complex mathematical challenges',
      difficulty: 'Intermediate',
      duration: '45 minutes',
      chapters: 5,
      progress: 3,
      status: 'in-progress',
      subjects: ['Mathematics', 'Physics'],
      rewards: {
        xp: 750,
        badges: ['Mars Explorer', 'Math Wizard'],
        unlocks: 'Advanced Calculus Quest'
      },
      story: 'Year 2157: The first human colony on Mars faces critical infrastructure challenges...',
      icon: '🪐'
    },
    {
      id: 2,
      title: 'Quantum Computing Quest',
      description: 'Dive into the quantum realm and master the principles of quantum computing',
      difficulty: 'Advanced',
      duration: '60 minutes',
      chapters: 7,
      progress: 0,
      status: 'locked',
      subjects: ['Computer Science', 'Physics'],
      rewards: {
        xp: 1200,
        badges: ['Quantum Pioneer', 'Code Master'],
        unlocks: 'AI Ethics Mission'
      },
      story: 'The future of computing lies in quantum mechanics. Are you ready to unlock its secrets?',
      icon: '⚛️'
    },
    {
      id: 3,
      title: 'Ocean Depths Discovery',
      description: 'Explore marine biology while solving environmental challenges',
      difficulty: 'Beginner',
      duration: '30 minutes',
      chapters: 4,
      progress: 4,
      status: 'completed',
      subjects: ['Biology', 'Environmental Science'],
      rewards: {
        xp: 500,
        badges: ['Ocean Explorer', 'Eco Warrior'],
        unlocks: 'Climate Change Mission'
      },
      story: 'The oceans hold secrets that could save our planet. Join the expedition!',
      icon: '🌊'
    },
    {
      id: 4,
      title: 'Space Station Engineering',
      description: 'Design and build a sustainable space station for long-term missions',
      difficulty: 'Expert',
      duration: '90 minutes',
      chapters: 8,
      progress: 0,
      status: 'available',
      subjects: ['Engineering', 'Physics', 'Mathematics'],
      rewards: {
        xp: 1500,
        badges: ['Space Engineer', 'Problem Solver'],
        unlocks: 'Interstellar Travel Quest'
      },
      story: 'Humanity\'s next step requires engineering marvels beyond imagination...',
      icon: '🛸'
    }
  ]);

  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showStory, setShowStory] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'available': return '#2196F3';
      case 'locked': return '#666666';
      default: return '#666666';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      case 'Expert': return '#9C27B0';
      default: return '#666666';
    }
  };

  const startQuest = (quest) => {
    if (quest.status === 'locked') return;
    setSelectedQuest(quest);
    setShowStory(true);
  };

  const continueQuest = (quest) => {
    setSelectedQuest(quest);
    // In a real implementation, this would load the quest progress
    alert(`Continuing quest: ${quest.title} - Chapter ${quest.progress + 1}`);
  };

  const QuestModal = ({ quest, onClose }) => (
    <div className="quest-modal-overlay" onClick={onClose}>
      <div className="quest-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="quest-icon-large">{quest.icon}</div>
          <div>
            <h2>{quest.title}</h2>
            <div className="quest-meta">
              <span className="difficulty" style={{ color: getDifficultyColor(quest.difficulty) }}>
                {quest.difficulty}
              </span>
              <span className="duration">⏱️ {quest.duration}</span>
              <span className="chapters">📖 {quest.chapters} chapters</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="quest-story">
            <h3>Mission Briefing</h3>
            <p>{quest.story}</p>
            <p>{quest.description}</p>
          </div>

          <div className="quest-subjects">
            <h4>Subjects Covered</h4>
            <div className="subject-tags">
              {quest.subjects.map((subject, index) => (
                <span key={index} className="subject-tag">{subject}</span>
              ))}
            </div>
          </div>

          <div className="quest-rewards">
            <h4>Mission Rewards</h4>
            <div className="rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">⭐</span>
                <span className="reward-text">{quest.rewards.xp} XP</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🏆</span>
                <span className="reward-text">{quest.rewards.badges.join(', ')}</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🔓</span>
                <span className="reward-text">Unlocks: {quest.rewards.unlocks}</span>
              </div>
            </div>
          </div>

          {quest.progress > 0 && (
            <div className="quest-progress">
              <h4>Your Progress</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(quest.progress / quest.chapters) * 100}%` }}
                ></div>
              </div>
              <p>{quest.progress} of {quest.chapters} chapters completed</p>
            </div>
          )}

          <div className="modal-actions">
            {quest.status === 'completed' ? (
              <button className="btn btn-secondary">Review Quest</button>
            ) : quest.status === 'in-progress' ? (
              <button 
                className="btn btn-primary"
                onClick={() => continueQuest(quest)}
              >
                Continue Mission
              </button>
            ) : quest.status === 'available' ? (
              <button 
                className="btn btn-primary"
                onClick={() => startQuest(quest)}
              >
                Start Mission
              </button>
            ) : (
              <button className="btn btn-secondary" disabled>
                Mission Locked
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="galaxy-quests">
      <div className="quests-header">
        <div className="quests-icon">🌌</div>
        <div>
          <h1 className="quests-title">Galaxy Quests</h1>
          <p className="quests-subtitle">Epic learning adventures across the universe</p>
        </div>
      </div>

      <div className="quest-stats">
        <div className="stat-card">
          <div className="stat-value">
            {quests.filter(q => q.status === 'completed').length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {quests.filter(q => q.status === 'in-progress').length}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {quests.reduce((total, quest) => total + quest.rewards.xp, 0)}
          </div>
          <div className="stat-label">Total XP Available</div>
        </div>
      </div>

      <div className="quests-grid">
        {quests.map((quest) => (
          <div 
            key={quest.id} 
            className={`quest-card ${quest.status}`}
            onClick={() => setSelectedQuest(quest)}
          >
            <div className="quest-header">
              <div className="quest-icon">{quest.icon}</div>
              <div className="quest-status">
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(quest.status) }}
                ></div>
                <span className="status-text">{quest.status.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="quest-content">
              <h3 className="quest-title">{quest.title}</h3>
              <p className="quest-description">{quest.description}</p>

              <div className="quest-details">
                <div className="detail-item">
                  <span className="detail-icon">📊</span>
                  <span 
                    className="detail-text"
                    style={{ color: getDifficultyColor(quest.difficulty) }}
                  >
                    {quest.difficulty}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-text">{quest.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📖</span>
                  <span className="detail-text">{quest.chapters} chapters</span>
                </div>
              </div>

              {quest.progress > 0 && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(quest.progress / quest.chapters) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {quest.progress}/{quest.chapters} chapters
                  </div>
                </div>
              )}

              <div className="quest-rewards-preview">
                <span className="reward-preview">⭐ {quest.rewards.xp} XP</span>
                <span className="reward-preview">🏆 {quest.rewards.badges.length} badges</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedQuest && (
        <QuestModal 
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
        />
      )}
    </div>
  );
};

export default GalaxyQuests;