import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  StarIcon, 
  GiftIcon, 
  AcademicCapIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VirtualClassroomPet = ({ className = '' }) => {
  const { user } = useAuth();
  const [pet, setPet] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-pet');
    return saved ? JSON.parse(saved) : {
      name: 'Spark',
      type: 'learning_dragon',
      level: 1,
      experience: 0,
      happiness: 80,
      energy: 90,
      intelligence: 50,
      lastFed: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      lastPlayed: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
      evolution_stage: 'baby',
      accessories: [],
      achievements: []
    };
  });

  const [showPetMenu, setShowPetMenu] = useState(false);
  const [interaction, setInteraction] = useState(null);
  const [animations, setAnimations] = useState([]);

  const petTypes = {
    learning_dragon: {
      name: 'Learning Dragon',
      icon: '🐲',
      description: 'A wise dragon that grows stronger with knowledge',
      stages: {
        baby: { icon: '🥚', name: 'Dragon Egg', min_level: 1 },
        young: { icon: '🐛', name: 'Baby Dragon', min_level: 5 },
        teen: { icon: '🐉', name: 'Young Dragon', min_level: 15 },
        adult: { icon: '🐲', name: 'Learning Dragon', min_level: 30 },
        elder: { icon: '🌟🐲', name: 'Elder Dragon', min_level: 50 }
      }
    },
    knowledge_owl: {
      name: 'Knowledge Owl',
      icon: '🦉',
      description: 'A scholarly owl that gets wiser with each lesson',
      stages: {
        baby: { icon: '🥚', name: 'Owl Egg', min_level: 1 },
        young: { icon: '🐣', name: 'Owlet', min_level: 5 },
        teen: { icon: '🦆', name: 'Young Owl', min_level: 15 },
        adult: { icon: '🦉', name: 'Wise Owl', min_level: 30 },
        elder: { icon: '✨🦉', name: 'Ancient Scholar', min_level: 50 }
      }
    }
  };

  const accessories = [
    { id: 'graduation_cap', name: 'Graduation Cap', icon: '🎓', cost: 100, unlocked_at: 10 },
    { id: 'reading_glasses', name: 'Reading Glasses', icon: '👓', cost: 150, unlocked_at: 15 },
    { id: 'bow_tie', name: 'Scholar Bow Tie', icon: '🎀', cost: 200, unlocked_at: 20 },
    { id: 'magic_wand', name: 'Knowledge Wand', icon: '🪄', cost: 300, unlocked_at: 25 }
  ];

  useEffect(() => {
    localStorage.setItem('pathwayiq-pet', JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePetNeeds();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for evolution
    checkEvolution();
  }, [pet.level]);

  const updatePetNeeds = () => {
    const now = Date.now();
    const hoursSinceLastFed = (now - pet.lastFed) / (1000 * 60 * 60);
    const hoursSinceLastPlayed = (now - pet.lastPlayed) / (1000 * 60 * 60);

    setPet(prev => ({
      ...prev,
      happiness: Math.max(0, prev.happiness - Math.floor(hoursSinceLastPlayed * 2)),
      energy: Math.max(0, prev.energy - Math.floor(hoursSinceLastFed * 3))
    }));
  };

  const checkEvolution = () => {
    const currentStages = petTypes[pet.type].stages;
    let newStage = pet.evolution_stage;

    Object.entries(currentStages).forEach(([stage, data]) => {
      if (pet.level >= data.min_level && stage !== pet.evolution_stage) {
        newStage = stage;
      }
    });

    if (newStage !== pet.evolution_stage) {
      setPet(prev => ({ ...prev, evolution_stage: newStage }));
      addAnimation('evolution');
      toast.success(`🎉 ${pet.name} evolved into ${currentStages[newStage].name}!`);
    }
  };

  const feedPet = () => {
    if (pet.energy >= 95) {
      toast.error(`${pet.name} is already full!`);
      return;
    }

    setPet(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + 25),
      happiness: Math.min(100, prev.happiness + 10),
      lastFed: Date.now()
    }));

    addAnimation('feed');
    setInteraction('feeding');
    setTimeout(() => setInteraction(null), 2000);
    
    toast.success(`${pet.name} enjoyed the knowledge treats! 🍎`);
  };

  const playWithPet = () => {
    if (pet.happiness >= 95) {
      toast.error(`${pet.name} is already very happy!`);
      return;
    }

    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 20),
      energy: Math.max(0, prev.energy - 10),
      lastPlayed: Date.now()
    }));

    addAnimation('play');
    setInteraction('playing');
    setTimeout(() => setInteraction(null), 2000);

    toast.success(`${pet.name} had fun playing with you! 🎾`);
  };

  const giveLearningReward = (xpGained) => {
    const experienceGain = Math.floor(xpGained * 1.5);
    const newExperience = pet.experience + experienceGain;
    const newLevel = Math.floor(newExperience / 100) + 1;

    setPet(prev => ({
      ...prev,
      experience: newExperience,
      level: newLevel,
      intelligence: Math.min(100, prev.intelligence + 2),
      happiness: Math.min(100, prev.happiness + 5)
    }));

    addAnimation('learn');
    toast.success(`${pet.name} learned with you! +${experienceGain} XP`);
  };

  const addAnimation = (type) => {
    const animation = { id: Date.now(), type };
    setAnimations(prev => [...prev, animation]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== animation.id));
    }, 3000);
  };

  const getPetMood = () => {
    if (pet.happiness > 80 && pet.energy > 70) return { mood: 'happy', emoji: '😊', color: 'text-green-400' };
    if (pet.happiness > 60 && pet.energy > 50) return { mood: 'content', emoji: '😌', color: 'text-blue-400' };
    if (pet.happiness > 40 && pet.energy > 30) return { mood: 'okay', emoji: '😐', color: 'text-yellow-400' };
    if (pet.happiness > 20 && pet.energy > 10) return { mood: 'sad', emoji: '😞', color: 'text-orange-400' };
    return { mood: 'very sad', emoji: '😢', color: 'text-red-400' };
  };

  const getCurrentPetIcon = () => {
    const stage = petTypes[pet.type].stages[pet.evolution_stage];
    return stage ? stage.icon : petTypes[pet.type].icon;
  };

  const getCurrentPetName = () => {
    const stage = petTypes[pet.type].stages[pet.evolution_stage];
    return stage ? stage.name : petTypes[pet.type].name;
  };

  const getStatColor = (value) => {
    if (value > 80) return 'bg-green-500';
    if (value > 60) return 'bg-blue-500';
    if (value > 40) return 'bg-yellow-500';
    if (value > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const mood = getPetMood();

  // Expose the reward function for other components
  useEffect(() => {
    window.petReward = giveLearningReward;
  }, []);

  return (
    <div className={`bg-gray-800 rounded-lg p-6 relative ${className}`}>
      {/* Animations */}
      {animations.map(animation => (
        <div
          key={animation.id}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          {animation.type === 'evolution' && (
            <div className="text-6xl animate-bounce">✨🌟✨</div>
          )}
          {animation.type === 'feed' && (
            <div className="text-4xl animate-pulse">🍎❤️</div>
          )}
          {animation.type === 'play' && (
            <div className="text-4xl animate-spin">🎾💫</div>
          )}
          {animation.type === 'learn' && (
            <div className="text-4xl animate-bounce">📚✨</div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SparklesIcon className="w-6 h-6 text-purple-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Your Learning Companion</h3>
        </div>
        <button
          onClick={() => setShowPetMenu(!showPetMenu)}
          className="btn-secondary text-sm"
        >
          Pet Menu
        </button>
      </div>

      {/* Pet Display */}
      <div className="text-center mb-6">
        <div className={`text-8xl mb-4 transition-transform duration-500 ${
          interaction === 'feeding' ? 'animate-bounce' :
          interaction === 'playing' ? 'animate-pulse' : ''
        }`}>
          {getCurrentPetIcon()}
        </div>
        
        <h4 className="text-2xl font-bold text-white mb-2">{pet.name}</h4>
        <p className="text-gray-400 mb-1">{getCurrentPetName()}</p>
        <p className={`text-sm ${mood.color}`}>
          {mood.emoji} {mood.mood}
        </p>
      </div>

      {/* Pet Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Level</p>
          <p className="text-white text-xl font-bold">{pet.level}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Happiness</p>
          <div className="flex items-center justify-center">
            <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getStatColor(pet.happiness)}`}
                style={{ width: `${pet.happiness}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{pet.happiness}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Energy</p>
          <div className="flex items-center justify-center">
            <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getStatColor(pet.energy)}`}
                style={{ width: `${pet.energy}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{pet.energy}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Intelligence</p>
          <div className="flex items-center justify-center">
            <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
              <div 
                className="h-2 rounded-full transition-all duration-500 bg-purple-500"
                style={{ width: `${pet.intelligence}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{pet.intelligence}%</span>
          </div>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Experience</span>
          <span>{pet.experience % 100}/100 to Level {pet.level + 1}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(pet.experience % 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Pet Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={feedPet}
          className="btn-primary flex items-center justify-center"
        >
          <GiftIcon className="w-4 h-4 mr-2" />
          Feed Knowledge
        </button>
        <button
          onClick={playWithPet}
          className="btn-secondary flex items-center justify-center"
        >
          <HeartIcon className="w-4 h-4 mr-2" />
          Play
        </button>
      </div>

      {/* Pet Menu */}
      {showPetMenu && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Pet Accessories</h4>
          <div className="grid grid-cols-2 gap-3">
            {accessories.map(accessory => (
              <div
                key={accessory.id}
                className={`p-3 rounded-lg border ${
                  pet.level >= accessory.unlocked_at
                    ? pet.accessories.includes(accessory.id)
                      ? 'border-green-500 bg-green-900'
                      : 'border-gray-500 bg-gray-600'
                    : 'border-gray-600 bg-gray-700 opacity-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{accessory.icon}</div>
                  <p className="text-white text-xs font-medium">{accessory.name}</p>
                  {pet.level >= accessory.unlocked_at ? (
                    <p className="text-green-400 text-xs">
                      {pet.accessories.includes(accessory.id) ? 'Equipped' : `${accessory.cost} XP`}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-xs">Level {accessory.unlocked_at}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              Your pet grows stronger as you learn! Complete lessons and assessments to help {pet.name} evolve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualClassroomPet;