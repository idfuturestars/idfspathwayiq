import React, { useState, useEffect } from 'react';

const StarBadges = () => {
  const [badges, setBadges] = useState([
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first assessment',
      icon: '👶',
      rarity: 'common',
      category: 'Achievement',
      earned: true,
      earnedDate: '2024-01-15',
      progress: 100,
      requirement: 'Complete 1 assessment'
    },
    {
      id: 2,
      name: 'Knowledge Seeker',
      description: 'Complete 10 assessments',
      icon: '🔍',
      rarity: 'uncommon',
      category: 'Achievement',
      earned: true,
      earnedDate: '2024-02-01',
      progress: 100,
      requirement: 'Complete 10 assessments'
    },
    {
      id: 3,
      name: 'Math Wizard',
      description: 'Score 90+ on 5 math assessments',
      icon: '🧙‍♂️',
      rarity: 'rare',
      category: 'Subject',
      earned: true,
      earnedDate: '2024-02-15',
      progress: 100,
      requirement: 'Score 90%+ on 5 math assessments'
    },
    {
      id: 4,
      name: 'Speed Demon',
      description: 'Complete assessment in under 5 minutes',
      icon: '⚡',
      rarity: 'epic',
      category: 'Performance',
      earned: false,
      progress: 73,
      requirement: 'Complete any assessment in under 5 minutes'
    },
    {
      id: 5,
      name: 'Perfect Score',
      description: 'Achieve 100% on any assessment',
      icon: '💯',
      rarity: 'legendary',
      category: 'Performance',
      earned: false,
      progress: 95,
      requirement: 'Score 100% on any assessment'
    },
    {
      id: 6,
      name: 'Streak Master',
      description: 'Maintain 30-day learning streak',
      icon: '🔥',
      rarity: 'mythic',
      category: 'Consistency',
      earned: false,
      progress: 23,
      requirement: 'Study for 30 consecutive days'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const rarityColors = {
    common: '#808080',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#e6cc80'
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'all') return true;
    if (filter === 'earned') return badge.earned;
    if (filter === 'available') return !badge.earned;
    return badge.category.toLowerCase() === filter;
  });

  const earnedCount = badges.filter(badge => badge.earned).length;
  const totalCount = badges.length;

  const BadgeModal = ({ badge, onClose }) => (
    <div className="badge-modal-overlay" onClick={onClose}>
      <div className="badge-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Badge Details</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="badge-display">
            <div 
              className={`badge-icon large ${badge.earned ? 'earned' : 'locked'}`}
              style={{ borderColor: rarityColors[badge.rarity] }}
            >
              {badge.earned ? badge.icon : '🔒'}
            </div>
            <div className="badge-info">
              <h4 
                className="badge-name"
                style={{ color: rarityColors[badge.rarity] }}
              >
                {badge.name}
              </h4>
              <p className="badge-description">{badge.description}</p>
              <div className="badge-meta">
                <span className="badge-rarity" style={{ color: rarityColors[badge.rarity] }}>
                  {badge.rarity.toUpperCase()}
                </span>
                <span className="badge-category">{badge.category}</span>
              </div>
            </div>
          </div>

          <div className="badge-requirement">
            <h5>Requirement</h5>
            <p>{badge.requirement}</p>
          </div>

          {!badge.earned && (
            <div className="badge-progress">
              <div className="progress-header">
                <span>Progress</span>
                <span>{badge.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${badge.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {badge.earned && (
            <div className="badge-earned">
              <h5>Earned</h5>
              <p>{new Date(badge.earnedDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="starbadges">
      <div className="badges-header">
        <div className="badges-icon">⭐</div>
        <div>
          <h1 className="badges-title">StarBadges™</h1>
          <p className="badges-subtitle">Achievement collection system</p>
        </div>
      </div>

      <div className="badges-stats">
        <div className="stat-card">
          <div className="stat-value">{earnedCount}</div>
          <div className="stat-label">Badges Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Badges</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round((earnedCount / totalCount) * 100)}%</div>
          <div className="stat-label">Collection</div>
        </div>
      </div>

      <div className="badges-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Badges
        </button>
        <button 
          className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
          onClick={() => setFilter('earned')}
        >
          Earned
        </button>
        <button 
          className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Available
        </button>
        <button 
          className={`filter-btn ${filter === 'achievement' ? 'active' : ''}`}
          onClick={() => setFilter('achievement')}
        >
          Achievement
        </button>
        <button 
          className={`filter-btn ${filter === 'performance' ? 'active' : ''}`}
          onClick={() => setFilter('performance')}
        >
          Performance
        </button>
      </div>

      <div className="badges-grid">
        {filteredBadges.map((badge) => (
          <div 
            key={badge.id} 
            className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
            onClick={() => setSelectedBadge(badge)}
          >
            <div 
              className="badge-icon"
              style={{ borderColor: rarityColors[badge.rarity] }}
            >
              {badge.earned ? badge.icon : '🔒'}
            </div>
            
            <div className="badge-content">
              <h3 
                className="badge-name"
                style={{ color: badge.earned ? rarityColors[badge.rarity] : '#666' }}
              >
                {badge.name}
              </h3>
              <p className="badge-description">{badge.description}</p>
              
              <div className="badge-footer">
                <span 
                  className="badge-rarity"
                  style={{ color: rarityColors[badge.rarity] }}
                >
                  {badge.rarity.toUpperCase()}
                </span>
                
                {!badge.earned && (
                  <div className="progress-mini">
                    <div 
                      className="progress-fill"
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {badge.earned && (
                  <span className="earned-date">
                    {new Date(badge.earnedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBadge && (
        <BadgeModal 
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default StarBadges;