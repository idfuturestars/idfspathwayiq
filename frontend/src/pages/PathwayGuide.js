import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  PaperAirplaneIcon,
  MapIcon,
  LightBulbIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const PathwayGuide = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What career paths match my skills?",
    "How do I become a data scientist?",
    "What programming language should I learn first?",
    "Show me college preparation steps",
    "Explain different engineering paths",
    "What are alternative learning options?"
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${user?.username}! I'm your Pathway Guide, here to help you navigate your educational and career journey. Whether you're exploring K-12 paths, college preparation, career transitions, or skill development, I'm here to provide personalized guidance. What pathway would you like to explore today?`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Use enhanced AI chat with pathway-focused context
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/ai/enhanced-chat`,
        {},
        {
          params: {
            message: message,
            emotional_context: 'supportive',
            learning_style: 'multimodal',
            ai_personality: 'pathway_mentor',
            session_id: sessionId
          }
        }
      );

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        // Enhanced pathway guidance data
        emotional_state: response.data.emotional_state_detected,
        learning_style: response.data.learning_style_detected,
        ai_personality: response.data.ai_personality_used,
        pathway_suggestions: response.data.pathway_suggestions,
        next_steps: response.data.next_steps
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (!sessionId) {
        setSessionId(response.data.session_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback to original chat endpoint
      try {
        const fallbackResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/ai/chat`,
          { 
            message: message,
            session_id: sessionId 
          }
        );

        const aiMessage = {
          role: 'assistant',
          content: fallbackResponse.data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        if (!sessionId) {
          setSessionId(fallbackResponse.data.session_id);
        }
      } catch (fallbackError) {
        console.error('Fallback chat also failed:', fallbackError);
        const errorMessage = {
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Ready for a fresh start, ${user?.username}? Let's explore new pathways together. What educational or career goals would you like to discuss?`,
        timestamp: new Date()
      }
    ]);
    setSessionId(null);
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <MapIcon className="w-8 h-8 text-blue-500 mr-3" />
              Pathway Guide
            </h1>
            <p className="text-gray-400">Your personalized educational and career navigation assistant</p>
          </div>
          <button
            onClick={clearConversation}
            className="btn-secondary flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            New Session
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 mb-4 overflow-hidden">
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gray-700 text-white'
                        : message.isError
                        ? 'bg-red-600/20 border border-red-500 text-red-200'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' && !message.isError && (
                      <div className="flex items-center mb-2">
                        <MapIcon className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-xs text-gray-400 font-medium">Pathway Guide</span>
                      </div>
                    )}
                    <div 
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                    <div className="flex items-center">
                      <MapIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-xs text-gray-400 font-medium mr-3">Pathway Guide</span>
                      <div className="loading-spinner w-4 h-4"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about career paths, education options, skill development..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                  rows="3"
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="btn-primary p-3"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Quick Questions */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <LightBulbIcon className="w-5 h-5 text-blue-500 mr-2" />
              Quick Questions
            </h3>
            <div className="space-y-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Pathway Categories */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BookOpenIcon className="w-5 h-5 text-gray-400 mr-2" />
              Pathway Categories
            </h3>
            <div className="space-y-3">
              {[
                { category: 'Academic Pathways', icon: AcademicCapIcon, topics: ['K-12 Foundation', 'College Prep', 'Graduate School'] },
                { category: 'Career Pathways', icon: BriefcaseIcon, topics: ['Technology', 'Healthcare', 'Business'] },
                { category: 'Skill Development', icon: LightBulbIcon, topics: ['Programming', 'Data Science', 'Design'] },
                { category: 'Alternative Routes', icon: MapIcon, topics: ['Bootcamps', 'Certifications', 'Self-Taught'] },
              ].map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <item.icon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-white font-medium">{item.category}</span>
                  </div>
                  <div className="space-y-1">
                    {item.topics.map((topic, topicIndex) => (
                      <button
                        key={topicIndex}
                        onClick={() => handleSendMessage(`Tell me about ${topic} pathways`)}
                        className="block w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
                        disabled={loading}
                      >
                        • {topic}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Progress */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4">Session Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Messages Exchanged</span>
                <span className="text-white font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Level</span>
                <span className="text-blue-500 font-medium">Level {user?.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Progress Points</span>
                <span className="text-gray-400 font-medium">{user?.xp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathwayGuide;