import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const SkillScan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const subjects = [
    'JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML',
    'Data Structures', 'Algorithms', 'Database', 'DevOps'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startSkillScan = async () => {
    if (!selectedSubject || !selectedDifficulty) {
      alert('Please select both subject and difficulty level');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions?subject=${selectedSubject}&difficulty=${selectedDifficulty}&limit=10`
      );
      setQuestions(response.data);
      setSessionStarted(true);
      setIsActive(true);
      setTimeLeft(30);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length) {
      // Submit answer
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/questions/${questions[currentQuestion].id}/answer`,
          selectedAnswer
        );
        
        // Store result
        setResults(prev => ({
          ...prev,
          [currentQuestion]: {
            question: questions[currentQuestion],
            userAnswer: selectedAnswer,
            correct: response.data.correct,
            explanation: response.data.explanation,
            points: response.data.points_earned
          }
        }));
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setTimeLeft(30);
    } else {
      // End of quiz
      setIsActive(false);
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setResults(null);
    setSessionStarted(false);
    setIsActive(false);
    setTimeLeft(30);
    setQuestions([]);
  };

  const calculateScore = () => {
    if (!results) return { score: 0, total: 0, percentage: 0 };
    
    const resultArray = Object.values(results);
    const correct = resultArray.filter(r => r.correct).length;
    const total = resultArray.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { score: correct, total, percentage };
  };

  if (!sessionStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">SkillScan™ Assessment</h1>
          <p className="text-gray-400 text-lg">
            Test your knowledge and discover your skill level
          </p>
        </div>

        {/* Adaptive vs Standard Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="starguide-card hover:border-green-500/30 transition-all cursor-pointer"
               onClick={() => navigate('/adaptive-skillscan')}>
            <div className="text-center">
              <StarIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Adaptive SkillScan™</h3>
              <p className="text-gray-400 mb-4">
                AI-powered assessment that adapts to your skill level (K-PhD+)
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div>✨ Questions adapt to your performance</div>
                <div>🧠 Think-aloud mode for deeper analysis</div>
                <div>📊 Advanced analytics and recommendations</div>
                <div>🎓 Accurate grade level detection</div>
              </div>
              <button className="btn-primary w-full mt-4">
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Try Adaptive Mode
              </button>
            </div>
          </div>

          <div className="starguide-card">
            <div className="text-center">
              <DocumentTextIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Standard SkillScan</h3>
              <p className="text-gray-400 mb-4">
                Traditional fixed-difficulty assessment
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div>📋 Fixed set of questions</div>
                <div>⏱️ Timed assessment</div>
                <div>🎯 Subject-specific focus</div>
                <div>📈 Basic scoring and feedback</div>
              </div>
              <button 
                onClick={() => setSessionStarted(true)}
                className="btn-secondary w-full mt-4"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Continue with Standard
              </button>
            </div>
          </div>
        </div>

        <div className="starguide-card">
          <h2 className="text-2xl font-semibold text-white mb-6">Standard Assessment Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="form-label">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="form-input"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Difficulty Level</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="form-input"
              >
                <option value="">Select difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Assessment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <DocumentTextIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-white font-medium">10 Questions</p>
                <p className="text-gray-400 text-sm">Carefully selected</p>
              </div>
              <div>
                <ClockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-white font-medium">30 sec / question</p>
                <p className="text-gray-400 text-sm">Time limit</p>
              </div>
              <div>
                <LightBulbIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-white font-medium">Instant Feedback</p>
                <p className="text-gray-400 text-sm">With explanations</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startSkillScan}
              disabled={loading || !selectedSubject || !selectedDifficulty}
              className="btn-primary text-lg px-8 py-3"
            >
              {loading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start SkillScan™
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const { score, total, percentage } = calculateScore();
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">SkillScan™ Results</h1>
          <p className="text-gray-400 text-lg">Your assessment is complete!</p>
        </div>

        <div className="starguide-card mb-6">
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-4 ${
              percentage >= 80 ? 'text-green-500' :
              percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {percentage}%
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              {score} out of {total} correct
            </h2>
            <p className="text-gray-400">
              {percentage >= 80 ? 'Excellent work!' :
               percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{total}</p>
              <p className="text-gray-400">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{score}</p>
              <p className="text-gray-400">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{total - score}</p>
              <p className="text-gray-400">Incorrect</p>
            </div>
          </div>
        </div>

        <div className="starguide-card mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Question Review</h3>
          <div className="space-y-4">
            {results && Object.values(results).map((result, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-medium flex-1">
                    {index + 1}. {result.question.question_text}
                  </h4>
                  {result.correct ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500 ml-2" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-500 ml-2" />
                  )}
                </div>
                
                <div className="text-sm space-y-2">
                  <p className="text-gray-400">
                    Your answer: <span className={`font-medium ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {result.userAnswer}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Correct answer: <span className="font-medium text-green-400">
                      {result.question.correct_answer}
                    </span>
                  </p>
                  <p className="text-gray-300">{result.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={resetQuiz} className="btn-primary">
            Take Another Assessment
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">SkillScan™ Assessment</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className={`flex items-center ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
              <ClockIcon className="w-5 h-5 mr-1" />
              {timeLeft}s
            </div>
          </div>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      {currentQ && (
        <div className="starguide-card">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="badge badge-info">{currentQ.subject}</span>
              <span className="badge badge-warning">{currentQ.difficulty}</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-4">
              {currentQ.question_text}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentQ.options && currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedAnswer === option
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
              >
                <span className="text-white">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsActive(!isActive)}
              className="btn-secondary"
            >
              {isActive ? (
                <>
                  <PauseIcon className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="btn-primary"
            >
              {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillScan;