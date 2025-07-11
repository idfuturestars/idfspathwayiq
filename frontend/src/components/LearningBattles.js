import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  BoltIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  FireIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const LearningBattles = ({ className = '' }) => {
  const { user } = useAuth();
  const [battleMode, setBattleMode] = useState('lobby'); // lobby, battle, results
  const [currentBattle, setCurrentBattle] = useState(null);
  const [playerStats, setPlayerStats] = useState({
    level: 5,
    hp: 100,
    maxHp: 100,
    knowledge: 85,
    experience: 250,
    wins: 12,
    losses: 3
  });
  const [opponentStats, setOpponentStats] = useState(null);
  const [availableBattles, setAvailableBattles] = useState([]);
  const [battleQuestion, setBattleQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [battleLog, setBattleLog] = useState([]);

  useEffect(() => {
    loadAvailableBattles();
  }, []);

  const knowledgeTypes = {
    mathematics: { name: 'Math Wizard', color: 'blue', icon: '🧮', effectiveness: ['science', 'logic'] },
    science: { name: 'Science Sage', color: 'green', icon: '🔬', effectiveness: ['history', 'literature'] },
    history: { name: 'Time Keeper', color: 'purple', icon: '🏛️', effectiveness: ['literature', 'art'] },
    literature: { name: 'Word Master', color: 'red', icon: '📚', effectiveness: ['mathematics', 'logic'] },
    logic: { name: 'Logic Lord', color: 'yellow', icon: '🧩', effectiveness: ['science', 'mathematics'] },
    art: { name: 'Creative Muse', color: 'pink', icon: '🎨', effectiveness: ['history', 'music'] }
  };

  const loadAvailableBattles = () => {
    // Simulate available battles
    const battles = [
      {
        id: '1',
        opponent: 'Alex Chen',
        level: 6,
        subject: 'mathematics',
        difficulty: 'intermediate',
        stakes: '15 XP',
        status: 'waiting'
      },
      {
        id: '2',
        opponent: 'Sarah Kim',
        level: 4,
        subject: 'science',
        difficulty: 'beginner',
        stakes: '10 XP',
        status: 'waiting'
      },
      {
        id: '3',
        opponent: 'Battle Bot Σ',
        level: 8,
        subject: 'logic',
        difficulty: 'advanced',
        stakes: '25 XP',
        status: 'ai_challenge'
      }
    ];
    setAvailableBattles(battles);
  };

  const startBattle = async (battleId) => {
    const battle = availableBattles.find(b => b.id === battleId);
    if (!battle) return;

    setBattleMode('battle');
    setCurrentBattle(battle);
    setOpponentStats({
      level: battle.level,
      hp: 100,
      maxHp: 100,
      knowledge: battle.level * 15
    });
    setBattleLog([]);
    
    // Load first question
    await loadBattleQuestion(battle.subject);
    
    toast.success(`⚔️ Battle started against ${battle.opponent}!`);
  };

  const loadBattleQuestion = async (subject) => {
    try {
      // In a real implementation, this would call the backend
      const questions = {
        mathematics: {
          question: "If f(x) = 2x² + 3x - 1, what is f(2)?",
          options: ["9", "11", "13", "15"],
          correct: 2,
          explanation: "f(2) = 2(2)² + 3(2) - 1 = 8 + 6 - 1 = 13"
        },
        science: {
          question: "What is the chemical formula for water?",
          options: ["H2O", "CO2", "O2", "H2SO4"],
          correct: 0,
          explanation: "Water consists of 2 hydrogen atoms and 1 oxygen atom: H2O"
        },
        logic: {
          question: "If all cats are animals, and some animals are pets, which is true?",
          options: ["All cats are pets", "Some cats might be pets", "No cats are pets", "All pets are cats"],
          correct: 1,
          explanation: "We can only conclude that some cats might be pets based on the given information"
        }
      };

      setBattleQuestion(questions[subject] || questions.mathematics);
    } catch (error) {
      console.error('Failed to load battle question:', error);
    }
  };

  const submitAnswer = (answerIndex) => {
    if (!battleQuestion) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === battleQuestion.correct;
    
    // Calculate damage
    const baseDamage = isCorrect ? 25 : 5;
    const effectiveness = calculateEffectiveness();
    const finalDamage = Math.floor(baseDamage * effectiveness);
    
    // Update battle state
    setTimeout(() => {
      if (isCorrect) {
        // Player attacks
        setOpponentStats(prev => ({
          ...prev,
          hp: Math.max(0, prev.hp - finalDamage)
        }));
        
        addToBattleLog(`🎯 Correct! You deal ${finalDamage} damage!`);
        
        if (opponentStats.hp - finalDamage <= 0) {
          endBattle(true);
          return;
        }
        
        // Opponent counter-attack
        setTimeout(() => {
          const opponentDamage = Math.floor(Math.random() * 20) + 10;
          setPlayerStats(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - opponentDamage)
          }));
          
          addToBattleLog(`💥 ${currentBattle.opponent} counter-attacks for ${opponentDamage} damage!`);
          
          if (playerStats.hp - opponentDamage <= 0) {
            endBattle(false);
            return;
          }
          
          // Load next question
          setTimeout(() => {
            loadBattleQuestion(currentBattle.subject);
            setSelectedAnswer(null);
          }, 2000);
        }, 1500);
        
      } else {
        // Wrong answer - opponent attacks
        const opponentDamage = Math.floor(Math.random() * 25) + 15;
        setPlayerStats(prev => ({
          ...prev,
          hp: Math.max(0, prev.hp - opponentDamage)
        }));
        
        addToBattleLog(`❌ Wrong answer! ${currentBattle.opponent} attacks for ${opponentDamage} damage!`);
        
        if (playerStats.hp - opponentDamage <= 0) {
          endBattle(false);
          return;
        }
        
        // Load next question
        setTimeout(() => {
          loadBattleQuestion(currentBattle.subject);
          setSelectedAnswer(null);
        }, 2000);
      }
    }, 1000);
  };

  const calculateEffectiveness = () => {
    // Simulate type effectiveness (like Pokemon)
    const playerType = 'mathematics'; // Could be based on user's strongest subject
    const opponentType = currentBattle?.subject || 'mathematics';
    
    const effectiveness = knowledgeTypes[playerType]?.effectiveness || [];
    
    if (effectiveness.includes(opponentType)) {
      addToBattleLog(`🌟 Super effective! ${knowledgeTypes[playerType].name} vs ${knowledgeTypes[opponentType].name}`);
      return 1.5;
    }
    
    return 1.0;
  };

  const addToBattleLog = (message) => {
    setBattleLog(prev => [...prev, message]);
  };

  const endBattle = (playerWon) => {
    setBattleMode('results');
    const xpGained = playerWon ? parseInt(currentBattle.stakes.split(' ')[0]) : 5;
    
    setPlayerStats(prev => ({
      ...prev,
      experience: prev.experience + xpGained,
      wins: playerWon ? prev.wins + 1 : prev.wins,
      losses: playerWon ? prev.losses : prev.losses + 1
    }));
    
    if (playerWon) {
      toast.success(`🏆 Victory! You gained ${xpGained} XP!`);
    } else {
      toast.error(`💀 Defeated! You gained ${xpGained} XP for trying.`);
    }
  };

  const getHpPercentage = (hp, maxHp) => (hp / maxHp) * 100;
  const getHpColor = (percentage) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (battleMode === 'battle' && currentBattle) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        {/* Battle Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">⚔️ Knowledge Battle</h2>
          <p className="text-gray-400">{knowledgeTypes[currentBattle.subject]?.name} Battle</p>
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Player Stats */}
          <div className="bg-blue-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{user?.username || 'You'}</h3>
              <span className="text-blue-300">Lvl {playerStats.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>HP</span>
                <span>{playerStats.hp}/{playerStats.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getHpColor(getHpPercentage(playerStats.hp, playerStats.maxHp))}`}
                  style={{ width: `${getHpPercentage(playerStats.hp, playerStats.maxHp)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Opponent Stats */}
          <div className="bg-red-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{currentBattle.opponent}</h3>
              <span className="text-red-300">Lvl {opponentStats.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>HP</span>
                <span>{opponentStats.hp}/{opponentStats.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getHpColor(getHpPercentage(opponentStats.hp, opponentStats.maxHp))}`}
                  style={{ width: `${getHpPercentage(opponentStats.hp, opponentStats.maxHp)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Question */}
        {battleQuestion && (
          <div className="bg-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">{battleQuestion.question}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {battleQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => submitAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedAnswer === index
                      ? index === battleQuestion.correct
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : selectedAnswer !== null && index === battleQuestion.correct
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                  } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {selectedAnswer !== null && (
              <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                <p className="text-blue-100 text-sm">
                  <strong>Explanation:</strong> {battleQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Battle Log */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Battle Log</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {battleLog.map((log, index) => (
              <p key={index} className="text-gray-300 text-sm">{log}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (battleMode === 'results') {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 text-center ${className}`}>
        <div className="mb-6">
          {playerStats.hp > 0 ? (
            <div>
              <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Victory!</h2>
              <p className="text-gray-300">You defeated {currentBattle.opponent}!</p>
            </div>
          ) : (
            <div>
              <HeartIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Defeated</h2>
              <p className="text-gray-300">Better luck next time!</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-6">
          <p className="text-green-400">+{parseInt(currentBattle.stakes.split(' ')[0])} XP gained</p>
          <p className="text-blue-400">Battle Record: {playerStats.wins}W - {playerStats.losses}L</p>
        </div>
        
        <button
          onClick={() => setBattleMode('lobby')}
          className="btn-primary"
        >
          Return to Battle Lobby
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BoltIcon className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-xl font-semibold text-white">Learning Battles</h3>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Battle Record</p>
          <p className="text-white font-semibold">{playerStats.wins}W - {playerStats.losses}L</p>
        </div>
      </div>

      {/* Player Stats Summary */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">Level</p>
            <p className="text-white text-xl font-bold">{playerStats.level}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Experience</p>
            <p className="text-blue-400 text-xl font-bold">{playerStats.experience}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Knowledge</p>
            <p className="text-green-400 text-xl font-bold">{playerStats.knowledge}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-yellow-400 text-xl font-bold">
              {Math.round((playerStats.wins / (playerStats.wins + playerStats.losses)) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Available Battles */}
      <div>
        <h4 className="text-white font-semibold mb-4">Available Battles</h4>
        <div className="space-y-3">
          {availableBattles.map(battle => (
            <div key={battle.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {knowledgeTypes[battle.subject]?.icon || '🎯'}
                </span>
                <div>
                  <h5 className="text-white font-medium">
                    {battle.opponent}
                    {battle.status === 'ai_challenge' && (
                      <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">AI</span>
                    )}
                  </h5>
                  <p className="text-gray-400 text-sm">
                    Level {battle.level} • {battle.subject} • {battle.difficulty}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-medium">{battle.stakes}</p>
                <button
                  onClick={() => startBattle(battle.id)}
                  className="btn-primary text-sm mt-1"
                >
                  Battle!
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button className="btn-secondary">
          <UserGroupIcon className="w-4 h-4 mr-2" />
          Find Random Opponent
        </button>
      </div>
    </div>
  );
};

export default LearningBattles;