import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const PomodoroContext = createContext();

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break'
};

const DEFAULT_DURATIONS = {
  [TIMER_MODES.FOCUS]: 25 * 60, // 25 minutes
  [TIMER_MODES.SHORT_BREAK]: 5 * 60, // 5 minutes
  [TIMER_MODES.LONG_BREAK]: 15 * 60 // 15 minutes
};

export const PomodoroProvider = ({ children }) => {
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS[TIMER_MODES.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-pomodoro-sessions');
    return saved ? JSON.parse(saved) : 0;
  });
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-daily-goal');
    return saved ? JSON.parse(saved) : 8;
  });
  const [focusMusic, setFocusMusic] = useState(() => {
    const saved = localStorage.getItem('pathwayiq-focus-music');
    return saved ? JSON.parse(saved) : 'none';
  });

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  // Save completed sessions
  useEffect(() => {
    localStorage.setItem('pathwayiq-pomodoro-sessions', JSON.stringify(completedSessions));
  }, [completedSessions]);

  // Save daily goal
  useEffect(() => {
    localStorage.setItem('pathwayiq-daily-goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  // Save focus music preference
  useEffect(() => {
    localStorage.setItem('pathwayiq-focus-music', JSON.stringify(focusMusic));
  }, [focusMusic]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (mode === TIMER_MODES.FOCUS) {
      setCompletedSessions(prev => prev + 1);
      toast.success('🎉 Focus session complete! Great work!');
      
      // Auto-start break
      const nextMode = completedSessions % 4 === 3 ? TIMER_MODES.LONG_BREAK : TIMER_MODES.SHORT_BREAK;
      switchMode(nextMode);
    } else {
      toast.success('Break time over! Ready for another focus session?');
      switchMode(TIMER_MODES.FOCUS);
    }

    // Play completion sound
    playNotificationSound();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(DEFAULT_DURATIONS[newMode]);
    setIsActive(false);
  };

  const startTimer = () => {
    setIsActive(true);
    if (mode === TIMER_MODES.FOCUS && focusMusic !== 'none') {
      playFocusMusic();
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    stopFocusMusic();
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_DURATIONS[mode]);
    stopFocusMusic();
  };

  const playFocusMusic = () => {
    if (focusMusic !== 'none') {
      // In a real implementation, you'd load actual music files
      // For now, we'll just show a toast
      toast.success('🎵 Focus music enabled');
    }
  };

  const stopFocusMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = DEFAULT_DURATIONS[mode];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const value = {
    mode,
    timeLeft,
    isActive,
    completedSessions,
    dailyGoal,
    focusMusic,
    switchMode,
    startTimer,
    pauseTimer,
    resetTimer,
    setDailyGoal,
    setFocusMusic,
    formatTime,
    getProgressPercentage,
    TIMER_MODES
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};