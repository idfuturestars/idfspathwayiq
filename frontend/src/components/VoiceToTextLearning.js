import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const VoiceToTextLearning = ({ onQuestion, onResponse, className = '' }) => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceEnabled(false);
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);

      // If we have a final result, process it
      if (finalTranscript) {
        handleVoiceQuestion(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'network') {
        toast.error('Network error during speech recognition');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!voiceEnabled || !recognitionRef.current) return;

    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleVoiceQuestion = async (question) => {
    if (!question.trim()) return;

    setIsProcessing(true);
    
    try {
      // Send question to AI Study Buddy
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/ai/voice-question`,
        {
          question: question.trim(),
          context: {
            user_id: user?.id,
            learning_mode: 'voice_interactive',
            session_type: 'study_buddy'
          }
        }
      );

      const aiAnswer = response.data.response;
      setAiResponse(aiAnswer);
      
      // Notify parent components
      if (onQuestion) onQuestion(question.trim());
      if (onResponse) onResponse(aiAnswer);

      // Speak the response if enabled
      speakResponse(aiAnswer);

      toast.success('AI Study Buddy responded!');
    } catch (error) {
      console.error('Error processing voice question:', error);
      toast.error('Failed to process your question');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    utterance.onerror = () => {
      setIsAISpeaking(false);
      toast.error('Text-to-speech error');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsAISpeaking(false);
  };

  if (!voiceEnabled) {
    return (
      <div className={`p-4 bg-yellow-100 text-yellow-800 rounded-lg ${className}`}>
        <p className="text-sm">Voice features are not available in this browser.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">🎤 AI Study Buddy - Voice Mode</h3>
        {isAISpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <StopIcon className="w-4 h-4 mr-1" />
            Stop Speaking
          </button>
        )}
      </div>

      {/* Voice Input Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-3">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? (
              <>
                <StopIcon className="w-5 h-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <MicrophoneIcon className="w-5 h-5 mr-2" />
                Start Speaking
              </>
            )}
          </button>

          {isListening && (
            <div className="flex items-center text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Listening...
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center text-blue-400">
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              Processing...
            </div>
          )}
        </div>

        {transcript && (
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-300 text-sm mb-1">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}
      </div>

      {/* AI Response Section */}
      {aiResponse && (
        <div className="bg-blue-900 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-300 text-sm font-medium">AI Study Buddy:</p>
            <button
              onClick={() => speakResponse(aiResponse)}
              disabled={isAISpeaking}
              className="flex items-center px-2 py-1 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              <SpeakerWaveIcon className="w-4 h-4 mr-1" />
              {isAISpeaking ? 'Speaking...' : 'Speak'}
            </button>
          </div>
          <p className="text-blue-100">{aiResponse}</p>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-4 text-gray-400 text-sm">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Click "Start Speaking" and ask any question about your studies</li>
          <li>The AI will explain concepts in different ways to help you understand</li>
          <li>Use phrases like "explain this differently" or "give me an example"</li>
          <li>Ask for help with homework, concepts, or problem-solving strategies</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceToTextLearning;