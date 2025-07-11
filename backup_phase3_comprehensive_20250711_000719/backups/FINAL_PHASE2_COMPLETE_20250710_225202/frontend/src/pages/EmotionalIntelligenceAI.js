import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VoiceInput from '../components/VoiceInput';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmotionalIntelligenceAI = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('encouraging');
  const [detectedEmotion, setDetectedEmotion] = useState('focused');
  const [detectedLearningStyle, setDetectedLearningStyle] = useState('multimodal');
  const [sessionId, setSessionId] = useState(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [adaptationsApplied, setAdaptationsApplied] = useState([]);
  const [nextSuggestions, setNextSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate session ID
    setSessionId(`session_${Date.now()}`);
    
    // Add welcome message
    setMessages([{
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your emotionally intelligent AI tutor. I can adapt my teaching style based on how you're feeling and how you learn best. Try typing a message or use voice input!",
      personality: 'encouraging',
      timestamp: new Date(),
      adaptations: ['Initial greeting with emotional awareness'],
      emotion: 'welcoming'
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message = currentMessage, emotionalContext = null) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      emotion: emotionalContext || 'neutral'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/ai/enhanced-chat`, null, {
        params: {
          message: message,
          emotional_context: emotionalContext,
          learning_style: detectedLearningStyle,
          ai_personality: aiPersonality,
          session_id: sessionId
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      
      // Update detected states
      setDetectedEmotion(data.emotional_state_detected);
      setDetectedLearningStyle(data.learning_style_detected);
      setAdaptationsApplied(data.adaptations_applied || []);
      setNextSuggestions(data.next_suggestions || []);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        personality: data.ai_personality_used,
        timestamp: new Date(),
        adaptations: data.adaptations_applied || [],
        emotion: data.emotional_state_detected,
        learningStyle: data.learning_style_detected
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Enhanced AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        personality: 'patient',
        timestamp: new Date(),
        adaptations: ['Error handling'],
        emotion: 'apologetic'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (transcriptionData) => {
    const { text, emotionalState, learningStyle } = transcriptionData;
    
    // Update detected states from voice
    setDetectedEmotion(emotionalState);
    setDetectedLearningStyle(learningStyle);
    
    // Send the transcribed message with emotional context
    handleSendMessage(text, emotionalState);
    setShowVoiceInput(false);
  };

  const handleVoiceError = (error) => {
    console.error('Voice input error:', error);
    alert(`Voice input error: ${error}`);
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      confident: '😊',
      frustrated: '😤',
      confused: '😕',
      excited: '🤩',
      anxious: '😰',
      bored: '😴',
      focused: '🎯',
      welcoming: '👋',
      apologetic: '😅',
      neutral: '😐'
    };
    return emojis[emotion] || '🙂';
  };

  const getLearningStyleIcon = (style) => {
    const icons = {
      visual: '👁️',
      auditory: '👂',
      kinesthetic: '👐',
      reading_writing: '📝',
      multimodal: '🌟'
    };
    return icons[style] || '🌟';
  };

  const getPersonalityColor = (personality) => {
    const colors = {
      encouraging: 'text-green-400',
      analytical: 'text-blue-400',
      creative: 'text-purple-400',
      patient: 'text-yellow-400',
      energetic: 'text-orange-400'
    };
    return colors[personality] || 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-400">🧠 Emotional Intelligence AI</h1>
            <p className="text-sm text-gray-400">Adaptive AI that understands your emotions and learning style</p>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-lg">
              <span className="text-xs text-gray-400">Emotion:</span>
              <span className="text-sm font-medium">
                {getEmotionEmoji(detectedEmotion)} {detectedEmotion}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-lg">
              <span className="text-xs text-gray-400">Learning:</span>
              <span className="text-sm font-medium">
                {getLearningStyleIcon(detectedLearningStyle)} {detectedLearningStyle}
              </span>
            </div>
          </div>
        </div>
        
        {/* AI Personality Selector */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm text-gray-400">AI Personality:</span>
          <select
            value={aiPersonality}
            onChange={(e) => setAiPersonality(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-green-400"
          >
            <option value="encouraging">🌟 Encouraging</option>
            <option value="analytical">🔍 Analytical</option>
            <option value="creative">🎨 Creative</option>
            <option value="patient">🧘 Patient</option>
            <option value="energetic">⚡ Energetic</option>
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 250px)' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* AI Message Metadata */}
              {message.type === 'ai' && (
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span>{getEmotionEmoji(message.emotion)}</span>
                    <span className={getPersonalityColor(message.personality)}>
                      {message.personality}
                    </span>
                    <span>{getLearningStyleIcon(message.learningStyle)}</span>
                  </div>
                  
                  {message.adaptations && message.adaptations.length > 0 && (
                    <div className="text-xs italic">
                      Adaptations: {message.adaptations.join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              {/* User Message Metadata */}
              {message.type === 'user' && message.emotion !== 'neutral' && (
                <div className="mt-1 text-xs text-green-200">
                  {getEmotionEmoji(message.emotion)} {message.emotion}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                <span className="text-sm text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Next Suggestions */}
      {nextSuggestions.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
          <div className="text-xs text-gray-400 mb-2">💡 Suggested next steps:</div>
          <div className="flex flex-wrap gap-2">
            {nextSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-green-400 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        {showVoiceInput ? (
          <div className="space-y-4">
            <VoiceInput
              onTranscription={handleVoiceTranscription}
              onError={handleVoiceError}
              className="w-full"
            />
            <button
              onClick={() => setShowVoiceInput(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
            >
              Cancel Voice Input
            </button>
          </div>
        ) : (
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message here... The AI will adapt to your emotional state and learning style."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-green-400 text-white placeholder-gray-400"
                rows="2"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Send
              </button>
              
              <button
                onClick={() => setShowVoiceInput(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                🎤 Voice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalIntelligenceAI;