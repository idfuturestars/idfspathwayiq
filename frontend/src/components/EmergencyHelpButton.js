import React, { useState, useEffect, useRef } from 'react';
import { 
  ExclamationTriangleIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const EmergencyHelpButton = ({ className = '' }) => {
  const { user } = useAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [studyMusic, setStudyMusic] = useState(false);
  const [musicType, setMusicType] = useState('focus');
  const audioRef = useRef(null);

  const musicTypes = {
    focus: {
      name: 'Focus Beats',
      description: 'Binaural beats for concentration',
      frequency: '40Hz',
      color: 'blue'
    },
    ambient: {
      name: 'Ambient Nature',
      description: 'Calm nature sounds',
      frequency: 'Variable',
      color: 'green'
    },
    classical: {
      name: 'Classical Study',
      description: 'Instrumental classical music',
      frequency: 'Variable',
      color: 'purple'
    },
    white_noise: {
      name: 'White Noise',
      description: 'Pure white noise for blocking distractions',
      frequency: 'Full spectrum',
      color: 'gray'
    }
  };

  const connectToTutor = async () => {
    setConnecting(true);
    try {
      // Simulate tutor connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('🎓 Connecting you to an available tutor...', {
        duration: 4000,
        position: 'top-center'
      });
      
      // In a real implementation, this would open a chat/video interface
      setShowHelp(false);
      
    } catch (error) {
      toast.error('Unable to connect right now. Try again in a moment.');
    } finally {
      setConnecting(false);
    }
  };

  const toggleStudyMusic = () => {
    if (studyMusic) {
      // Stop music
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setStudyMusic(false);
      toast.success('🔇 Study music stopped');
    } else {
      // Start music
      setStudyMusic(true);
      playStudyMusic(musicType);
      toast.success(`🎵 ${musicTypes[musicType].name} playing`);
    }
  };

  const playStudyMusic = (type) => {
    // In a real implementation, you'd load actual audio files
    // For now, we'll simulate with a continuous tone
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency based on music type
      const frequencies = {
        focus: 40,
        ambient: 110,
        classical: 220,
        white_noise: Math.random() * 1000
      };
      
      oscillator.frequency.value = frequencies[type];
      oscillator.type = type === 'white_noise' ? 'white' : 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start();
      
      // Store reference for stopping
      audioRef.current = {
        pause: () => oscillator.stop()
      };
      
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  const changeMusicType = (type) => {
    setMusicType(type);
    if (studyMusic) {
      // Stop current music and start new type
      if (audioRef.current) {
        audioRef.current.pause();
      }
      playStudyMusic(type);
      toast.success(`🎵 Switched to ${musicTypes[type].name}`);
    }
  };

  return (
    <>
      {/* Emergency Help Button - Fixed Position */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="flex flex-col space-y-3">
          {/* Study Music Toggle */}
          <button
            onClick={toggleStudyMusic}
            className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
              studyMusic 
                ? `bg-${musicTypes[musicType].color}-600 hover:bg-${musicTypes[musicType].color}-700` 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={studyMusic ? 'Stop Study Music' : 'Start Study Music'}
          >
            {studyMusic ? (
              <SpeakerWaveIcon className="w-6 h-6 text-white mx-auto" />
            ) : (
              <SpeakerXMarkIcon className="w-6 h-6 text-white mx-auto" />
            )}
          </button>

          {/* Emergency Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 animate-pulse"
            title="Emergency Help - Get Instant Tutor Support"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-white mx-auto" />
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 m-4 max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-xl font-semibold text-white">Emergency Learning Help</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Stuck on a problem? Need immediate help? Connect with a live tutor or get AI assistance right now.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={connectToTutor}
                disabled={connecting}
                className="w-full btn-primary flex items-center justify-center"
              >
                {connecting ? (
                  <>
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <UserIcon className="w-5 h-5 mr-2" />
                    Connect to Live Tutor
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowHelp(false);
                  // Trigger voice mode or AI chat
                  toast.success('🤖 AI Study Buddy activated!');
                }}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Ask AI Study Buddy
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3">Study Music Options</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(musicTypes).map(([key, music]) => (
                  <button
                    key={key}
                    onClick={() => changeMusicType(key)}
                    className={`p-3 rounded-lg text-sm transition-colors ${
                      musicType === key 
                        ? `bg-${music.color}-600 text-white` 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{music.name}</div>
                    <div className="text-xs opacity-75">{music.frequency}</div>
                  </button>
                ))}
              </div>
              
              {studyMusic && (
                <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm">🎵 Now Playing: {musicTypes[musicType].name}</span>
                    <button
                      onClick={toggleStudyMusic}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyHelpButton;