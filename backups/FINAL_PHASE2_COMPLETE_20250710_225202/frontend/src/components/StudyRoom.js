import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudyRoom = ({ groupId, user, onLeave }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection with proper configuration
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      timeout: 20000
    });
    
    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setLoading(false);
      
      // Join the study room after connection
      socketRef.current.emit('join_room', {
        room_id: groupId,
        user_id: user.id,
        username: user.username || user.email
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
      setLoading(false);
    });

    
    // Load group info and chat history
    loadGroupInfo();
    loadChatHistory();

    // Socket event listeners
    socketRef.current.on('user_joined', (data) => {
      console.log('User joined:', data);
      addSystemMessage(`${data.username || data.user_id} joined the study room`);
    });

    socketRef.current.on('user_left', (data) => {
      console.log('User left:', data);
      addSystemMessage(`${data.username || data.user_id} left the study room`);
    });

    socketRef.current.on('new_message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    socketRef.current.on('online_users', (users) => {
      setOnlineUsers(users || []);
    });

    return () => {
      // Leave room and disconnect
      socketRef.current.emit('leave_room', {
        room_id: groupId,
        user_id: user.id
      });
      socketRef.current.disconnect();
    };
  }, [groupId, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadGroupInfo = async () => {
    try {
      const response = await axios.get(`${API}/groups`);
      const group = response.data.groups.find(g => g.id === groupId);
      setGroupInfo(group);
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      // In a real implementation, you'd load chat history from the backend
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setLoading(false);
    }
  };

  const addSystemMessage = (text) => {
    const systemMessage = {
      id: Date.now().toString(),
      room_id: groupId,
      user_id: 'system',
      username: 'System',
      message: text,
      message_type: 'system',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      room_id: groupId,
      user_id: user.id,
      username: user.username,
      message: newMessage.trim()
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div className="loading">Loading study room...</div>;
  }

  return (
    <div className="study-room">
      <div className="study-room-header">
        <div className="room-info">
          <h2>{groupInfo?.name || 'Study Room'}</h2>
          <p className="room-subject">{groupInfo?.subject}</p>
        </div>
        <div className="room-actions">
          <div className="connection-status">
            <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '🟢' : '🔴'}
            </span>
            <span className="online-count">{onlineUsers.length} online</span>
          </div>
          <button onClick={onLeave} className="btn btn-secondary">
            Leave Room
          </button>
        </div>
      </div>

      <div className="study-room-content">
        <div className="chat-section">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.user_id === user.id ? 'own-message' : 
                  message.message_type === 'system' ? 'system-message' : 'other-message'
                }`}
              >
                {message.message_type !== 'system' && (
                  <div className="message-header">
                    <span className="username">{message.username}</span>
                    <span className="timestamp">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                <div className="message-content">{message.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (Enter to send)"
                className="chat-input"
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="btn btn-primary"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="room-sidebar">
          <div className="online-users">
            <h3>Online ({onlineUsers.length})</h3>
            <div className="users-list">
              {onlineUsers.map((userId, index) => (
                <div key={index} className="user-item">
                  <div className="user-avatar">
                    {userId.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{userId}</span>
                  <span className="status-indicator online"></span>
                </div>
              ))}
            </div>
          </div>

          <div className="room-tools">
            <h3>Study Tools</h3>
            <button className="tool-btn">
              📝 Shared Notes
            </button>
            <button className="tool-btn">
              🧮 Calculator
            </button>
            <button className="tool-btn">
              📊 Whiteboard
            </button>
            <button className="tool-btn">
              🎥 Start Video Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoom;