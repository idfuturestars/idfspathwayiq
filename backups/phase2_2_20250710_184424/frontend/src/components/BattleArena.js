import React, { useState, useEffect } from 'react';

const BattleArena = () => {
  const [battles, setBattles] = useState([
    {
      id: 1,
      title: 'Math Championship',
      subject: 'Mathematics',
      players: 8,
      maxPlayers: 16,
      status: 'active',
      timeLeft: '05:32',
      difficulty: 'Advanced',
      prize: '500 XP'
    },
    {
      id: 2,
      title: 'Science Showdown',
      subject: 'Physics',
      players: 12,
      maxPlayers: 20,
      status: 'recruiting',
      timeLeft: '02:15',
      difficulty: 'Intermediate',
      prize: '300 XP'
    },
    {
      id: 3,
      title: 'Code Warriors',
      subject: 'Computer Science',
      players: 6,
      maxPlayers: 10,
      status: 'starting',
      timeLeft: '00:45',
      difficulty: 'Expert',
      prize: '750 XP'
    }
  ]);

  const [selectedBattle, setSelectedBattle] = useState(null);

  const joinBattle = (battleId) => {
    setBattles(prev => prev.map(battle => 
      battle.id === battleId 
        ? { ...battle, players: battle.players + 1 }
        : battle
    ));
  };

  const createBattle = () => {
    // Battle creation logic
    console.log('Creating new battle...');
  };

  return (
    <div className="battle-arena">
      <div className="arena-header">
        <div className="arena-icon">⚔️</div>
        <div>
          <h1 className="arena-title">Battle Arena</h1>
          <p className="arena-subtitle">Competitive learning battles</p>
        </div>
        <button className="btn btn-primary" onClick={createBattle}>
          Create Battle
        </button>
      </div>

      <div className="battle-stats">
        <div className="stat-card">
          <div className="stat-value">24</div>
          <div className="stat-label">Active Battles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">156</div>
          <div className="stat-label">Warriors Online</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3.2K</div>
          <div className="stat-label">Total Battles</div>
        </div>
      </div>

      <div className="battles-grid">
        {battles.map((battle) => (
          <div key={battle.id} className="battle-card starguide-card">
            <div className="battle-header">
              <h3 className="battle-title">{battle.title}</h3>
              <div className={`status-badge ${battle.status}`}>
                {battle.status.toUpperCase()}
              </div>
            </div>

            <div className="battle-info">
              <div className="info-row">
                <span className="info-label">Subject:</span>
                <span className="info-value">{battle.subject}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Players:</span>
                <span className="info-value">{battle.players}/{battle.maxPlayers}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Difficulty:</span>
                <span className="info-value">{battle.difficulty}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Prize:</span>
                <span className="info-value prize">{battle.prize}</span>
              </div>
            </div>

            <div className="battle-timer">
              <div className="timer-display">
                <span className="timer-icon">⏱️</span>
                <span className="timer-value">{battle.timeLeft}</span>
              </div>
            </div>

            <div className="battle-actions">
              <button 
                className="btn btn-primary"
                onClick={() => joinBattle(battle.id)}
                disabled={battle.players >= battle.maxPlayers}
              >
                {battle.status === 'active' ? 'Join Battle' : 'Join Queue'}
              </button>
              <button className="btn btn-secondary">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleArena;