import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LiveQuiz = ({ roomCode, user, onExit }) => {
  const [quizState, setQuizState] = useState({
    status: 'waiting', // waiting, active, completed
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    timeRemaining: 0,
    participants: [],
    leaderboard: []
  });
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(BACKEND_URL);
    
    // Join quiz room
    joinQuizRoom();
    
    // Socket event listeners
    socketRef.current.on('quiz_started', (data) => {
      console.log('Quiz started:', data);
      setQuizState(prev => ({
        ...prev,
        status: 'active',
        totalQuestions: data.total_questions
      }));
    });

    socketRef.current.on('new_question', (questionData) => {
      console.log('New question:', questionData);
      setQuizState(prev => ({
        ...prev,
        currentQuestion: questionData.question,
        questionNumber: questionData.question_number,
        timeRemaining: questionData.time_limit || 30
      }));
      setSelectedAnswer('');
      setHasAnswered(false);
      startQuestionTimer(questionData.time_limit || 30);
    });

    socketRef.current.on('answer_submitted', (data) => {
      console.log('Answer submitted by:', data.user_id);
    });

    socketRef.current.on('question_results', (results) => {
      console.log('Question results:', results);
      setQuizState(prev => ({
        ...prev,
        leaderboard: results.leaderboard
      }));
    });

    socketRef.current.on('quiz_completed', (finalResults) => {
      console.log('Quiz completed:', finalResults);
      setQuizState(prev => ({
        ...prev,
        status: 'completed',
        leaderboard: finalResults.final_leaderboard
      }));
    });

    socketRef.current.on('participant_joined', (data) => {
      setQuizState(prev => ({
        ...prev,
        participants: [...prev.participants, data.user_id]
      }));
    });

    socketRef.current.on('participant_left', (data) => {
      setQuizState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p !== data.user_id)
      }));
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      socketRef.current.disconnect();
    };
  }, [roomCode, user]);

  const joinQuizRoom = async () => {
    try {
      const response = await axios.post(`${API}/quiz/rooms/${roomCode}/join`);
      console.log('Joined quiz room:', response.data);
      
      // Emit socket event to join room
      socketRef.current.emit('join_quiz_room', {
        room_code: roomCode,
        user_id: user.id,
        username: user.username
      });
      
    } catch (error) {
      console.error('Error joining quiz room:', error);
    }
  };

  const startQuestionTimer = (seconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setQuizState(prev => ({ ...prev, timeRemaining: seconds }));
    
    timerRef.current = setInterval(() => {
      setQuizState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          clearInterval(timerRef.current);
          // Auto-submit answer if time runs out
          if (!hasAnswered) {
            submitAnswer('');
          }
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);
  };

  const submitAnswer = (answer = selectedAnswer) => {
    if (hasAnswered) return;

    setHasAnswered(true);
    
    socketRef.current.emit('quiz_answer', {
      room_code: roomCode,
      user_id: user.id,
      question_id: quizState.currentQuestion?.id,
      answer: answer,
      time_taken: (quizState.currentQuestion?.time_limit || 30) - quizState.timeRemaining
    });

    console.log('Answer submitted:', answer);
  };

  const renderWaitingRoom = () => (
    <div className="quiz-waiting">
      <div className="waiting-content">
        <h2>Waiting for Quiz to Start</h2>
        <div className="room-code">
          <span>Room Code: <strong>{roomCode}</strong></span>
        </div>
        <div className="participants-count">
          <span>{quizState.participants.length} participants joined</span>
        </div>
        <div className="participant-list">
          {quizState.participants.map((participant, index) => (
            <div key={index} className="participant-item">
              {participant}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveQuiz = () => (
    <div className="quiz-active">
      <div className="quiz-header">
        <div className="question-info">
          <span>Question {quizState.questionNumber} of {quizState.totalQuestions}</span>
        </div>
        <div className="timer">
          <span className={quizState.timeRemaining <= 10 ? 'timer-warning' : ''}>
            {quizState.timeRemaining}s
          </span>
        </div>
      </div>

      <div className="question-content">
        <h3>{quizState.currentQuestion?.content}</h3>
        
        {quizState.currentQuestion?.question_type === 'multiple_choice' && (
          <div className="answer-options">
            {quizState.currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${hasAnswered ? 'disabled' : ''}`}
                onClick={() => !hasAnswered && setSelectedAnswer(option)}
                disabled={hasAnswered}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        )}

        {quizState.currentQuestion?.question_type === 'fill_blank' && (
          <div className="text-answer">
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={hasAnswered}
              placeholder="Enter your answer..."
              className="answer-input"
            />
          </div>
        )}
      </div>

      <div className="quiz-actions">
        {!hasAnswered ? (
          <button
            onClick={() => submitAnswer()}
            disabled={!selectedAnswer.trim()}
            className="btn btn-primary"
          >
            Submit Answer
          </button>
        ) : (
          <div className="answered-state">
            <span>✓ Answer submitted! Waiting for other participants...</span>
          </div>
        )}
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(quizState.questionNumber / quizState.totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="quiz-results">
      <div className="results-header">
        <h2>🎉 Quiz Completed!</h2>
      </div>
      
      <div className="leaderboard">
        <h3>Final Leaderboard</h3>
        {quizState.leaderboard.map((entry, index) => (
          <div key={index} className={`leaderboard-entry ${entry.user_id === user.id ? 'own-entry' : ''}`}>
            <div className="rank">#{index + 1}</div>
            <div className="player-info">
              <span className="player-name">{entry.username || entry.user_id}</span>
              <span className="player-score">{entry.score} points</span>
            </div>
            {index < 3 && (
              <div className="medal">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="results-actions">
        <button onClick={onExit} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="live-quiz">
      <div className="quiz-container">
        {quizState.status === 'waiting' && renderWaitingRoom()}
        {quizState.status === 'active' && renderActiveQuiz()}
        {quizState.status === 'completed' && renderResults()}
      </div>
      
      <div className="quiz-sidebar">
        <div className="participants-panel">
          <h4>Participants ({quizState.participants.length})</h4>
          <div className="participants-list">
            {quizState.participants.map((participant, index) => (
              <div key={index} className="participant">
                <div className="participant-avatar">
                  {participant.charAt(0).toUpperCase()}
                </div>
                <span>{participant}</span>
              </div>
            ))}
          </div>
        </div>

        {quizState.leaderboard.length > 0 && (
          <div className="current-standings">
            <h4>Current Standings</h4>
            <div className="mini-leaderboard">
              {quizState.leaderboard.slice(0, 5).map((entry, index) => (
                <div key={index} className="standing-entry">
                  <span className="standing-rank">#{index + 1}</span>
                  <span className="standing-name">{entry.username || entry.user_id}</span>
                  <span className="standing-score">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveQuiz;