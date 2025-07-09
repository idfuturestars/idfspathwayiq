import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const PathwayGuide = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Help me choose a career path",
    "What skills should I learn next?",
    "How do I prepare for interviews?",
    "Explain data structures for beginners",
    "What's the best learning approach for me?",
    "How to build a portfolio?"
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${user?.username}! I'm your Pathway Guide™, your AI-powered learning companion. I'm here to help you navigate your learning journey, choose the right paths, and achieve your career goals. What would you like to explore today?`,
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
      // Use enhanced AI chat with emotional intelligence
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/ai/enhanced-chat`,
        {},
        {
          params: {
            message: message,
            emotional_context: 'focused', // Can be dynamic based on user input analysis
            learning_style: 'multimodal', // Can be detected from user patterns
            ai_personality: 'encouraging',
            session_id: sessionId
          }
        }
      );

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        // Enhanced data from Phase 1
        emotional_state: response.data.emotional_state_detected,
        learning_style: response.data.learning_style_detected,
        ai_personality: response.data.ai_personality_used,
        adaptations: response.data.adaptations_applied,
        suggestions: response.data.next_suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (!sessionId) {
        setSessionId(response.data.session_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback to original chat endpoint if enhanced chat fails
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
        content: `Hi again ${user?.username}! Ready for a fresh conversation? What pathway would you like to explore today?`,
        timestamp: new Date()
      }
    ]);
    setSessionId(null);
  };

  const formatMessage = (content) => {
    // Basic markdown-like formatting
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
              <SparklesIcon className="w-8 h-8 text-blue-500 mr-3" />
              Pathway Guide™
            </h1>
            <p className="text-gray-400">Your AI-powered learning and career companion</p>
          </div>
          <button
            onClick={clearConversation}
            className="btn-secondary flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            New Conversation
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
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-600/20 border border-red-500 text-red-200'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' && !message.isError && (
                      <div className="flex items-center mb-2">
                        <SparklesIcon className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-xs text-gray-400 font-medium">Pathway Guide™</span>
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
                      <SparklesIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-xs text-gray-400 font-medium mr-3">Pathway Guide™</span>
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
                  placeholder="Ask about career paths, learning strategies, or skill development..."
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
          {/* Quick Prompts */}
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

          {/* Learning Pathways */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BookOpenIcon className="w-5 h-5 text-green-500 mr-2" />
              Popular Pathways
            </h3>
            <div className="space-y-3">
              {[
                { pathway: 'Web Development', level: 'Beginner', color: 'bg-blue-500' },
                { pathway: 'Data Science', level: 'Intermediate', color: 'bg-green-500' },
                { pathway: 'AI/Machine Learning', level: 'Advanced', color: 'bg-purple-500' },
                { pathway: 'Cloud Computing', level: 'Intermediate', color: 'bg-orange-500' },
                { pathway: 'Cybersecurity', level: 'Advanced', color: 'bg-red-500' },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(`Tell me about the ${item.pathway} pathway for ${item.level} level`)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{item.pathway}</span>
                    <span className={`text-xs px-2 py-1 rounded ${item.color} text-white`}>
                      {item.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500 mr-2" />
              Tips for Better Guidance
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Share your current skills and goals</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Ask about specific career paths or industries</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Request learning roadmaps and resources</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Ask about market trends and opportunities</p>
              </div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="starguide-card">
            <h3 className="text-lg font-semibold text-white mb-4">Session Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Messages</span>
                <span className="text-white font-medium">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Level</span>
                <span className="text-blue-500 font-medium">Level {user?.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total XP</span>
                <span className="text-green-500 font-medium">{user?.xp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathwayGuide;