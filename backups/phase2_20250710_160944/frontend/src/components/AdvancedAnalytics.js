import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdvancedAnalytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [activeTab, setActiveTab] = useState('overview'); // overview, performance, predictions

  useEffect(() => {
    loadAnalytics();
    loadPredictions();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/dashboard`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadPredictions = async () => {
    try {
      const response = await axios.get(`${API}/analytics/predictions`);
      setPredictions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading predictions:', error);
      setLoading(false);
    }
  };

  const renderPerformanceChart = () => {
    if (!analytics?.performance_trend) return null;

    const maxScore = Math.max(...analytics.performance_trend, 100);
    const chartHeight = 200;

    return (
      <div className="performance-chart">
        <h4>Performance Trend</h4>
        <div className="chart-container">
          <svg width="100%" height={chartHeight} className="chart-svg">
            <defs>
              <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#4CAF50', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: '#4CAF50', stopOpacity: 0.1}} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(value => (
              <g key={value}>
                <line
                  x1="0"
                  y1={chartHeight - (value / maxScore) * chartHeight}
                  x2="100%"
                  y2={chartHeight - (value / maxScore) * chartHeight}
                  stroke="#333"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <text
                  x="5"
                  y={chartHeight - (value / maxScore) * chartHeight - 5}
                  fill="#888"
                  fontSize="12"
                >
                  {value}%
                </text>
              </g>
            ))}
            
            {/* Performance line */}
            <polyline
              fill="url(#performanceGradient)"
              stroke="#4CAF50"
              strokeWidth="3"
              points={analytics.performance_trend.map((score, index) => {
                const x = (index / (analytics.performance_trend.length - 1)) * 100;
                const y = chartHeight - (score / maxScore) * chartHeight;
                return `${x}%,${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {analytics.performance_trend.map((score, index) => (
              <circle
                key={index}
                cx={`${(index / (analytics.performance_trend.length - 1)) * 100}%`}
                cy={chartHeight - (score / maxScore) * chartHeight}
                r="4"
                fill="#4CAF50"
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const renderStudyHeatmap = () => {
    // Generate mock heatmap data for demonstration
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeks = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="study-heatmap">
        <h4>Study Activity Heatmap</h4>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {weeks.map(week => (
              <div key={week} className="heatmap-week">
                {days.map(day => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={`${week}-${day}`}
                      className="heatmap-day"
                      style={{
                        backgroundColor: `rgba(76, 175, 80, ${intensity})`,
                        border: '1px solid #333'
                      }}
                      title={`${day}: ${Math.round(intensity * 100)}% activity`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-scale">
              {[0, 0.25, 0.5, 0.75, 1].map(opacity => (
                <div
                  key={opacity}
                  className="legend-step"
                  style={{ backgroundColor: `rgba(76, 175, 80, ${opacity})` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSubjectBreakdown = () => {
    // Mock subject data
    const subjects = [
      { name: 'Mathematics', score: 85, sessions: 12, color: '#FF6B6B' },
      { name: 'Science', score: 92, sessions: 8, color: '#4ECDC4' },
      { name: 'History', score: 78, sessions: 6, color: '#45B7D1' },
      { name: 'Literature', score: 88, sessions: 10, color: '#96CEB4' },
      { name: 'Physics', score: 82, sessions: 7, color: '#FFEAA7' }
    ];

    return (
      <div className="subject-breakdown">
        <h4>Subject Performance</h4>
        <div className="subjects-grid">
          {subjects.map((subject, index) => (
            <div key={index} className="subject-card">
              <div 
                className="subject-color" 
                style={{ backgroundColor: subject.color }}
              />
              <div className="subject-info">
                <h5>{subject.name}</h5>
                <div className="subject-stats">
                  <span className="score">Avg: {subject.score}%</span>
                  <span className="sessions">{subject.sessions} sessions</span>
                </div>
                <div className="subject-progress">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${subject.score}%`,
                      backgroundColor: subject.color 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPredictions = () => {
    if (!predictions) return null;

    return (
      <div className="predictions-panel">
        <h4>AI Learning Predictions</h4>
        
        <div className="prediction-card">
          <div className="prediction-header">
            <h5>Next Assessment Prediction</h5>
            <span className={`confidence ${predictions.confidence > 0.7 ? 'high' : 'medium'}`}>
              {Math.round(predictions.confidence * 100)}% confidence
            </span>
          </div>
          <div className="prediction-content">
            <div className="predicted-score">
              <span className="score-value">{predictions.predicted_next_score}%</span>
              <span className="score-label">Predicted Score</span>
            </div>
            <div className="trend-indicator">
              <span className={`trend ${predictions.trend}`}>
                {predictions.trend === 'improving' ? '📈' : 
                 predictions.trend === 'declining' ? '📉' : '➡️'}
                {predictions.trend}
              </span>
            </div>
          </div>
          <div className="prediction-recommendation">
            <p>{predictions.recommendation}</p>
          </div>
        </div>

        <div className="learning-insights">
          <h5>Personalized Insights</h5>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon">💡</span>
              <span>Your performance is strongest in the afternoon (2-4 PM)</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">📚</span>
              <span>Consider spending more time on Mathematics concepts</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🎯</span>
              <span>You're 85% likely to achieve your monthly XP goal</span>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🏆</span>
              <span>You're on track to unlock the "Study Streak" achievement</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading advanced analytics...</div>;
  }

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h2>Advanced Learning Analytics</h2>
        <div className="analytics-controls">
          <div className="time-range-selector">
            {['week', 'month', 'year'].map(range => (
              <button
                key={range}
                className={`range-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
        {['overview', 'performance', 'predictions'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="analytics-grid">
              <div className="metric-card">
                <h4>Total Study Time</h4>
                <div className="metric-value">
                  {analytics?.user_stats?.total_study_time || 0} minutes
                </div>
                <div className="metric-change positive">+12% from last week</div>
              </div>
              
              <div className="metric-card">
                <h4>Assessments Completed</h4>
                <div className="metric-value">
                  {analytics?.total_assessments || 0}
                </div>
                <div className="metric-change positive">+3 this week</div>
              </div>
              
              <div className="metric-card">
                <h4>Average Score</h4>
                <div className="metric-value">
                  {analytics?.average_score?.toFixed(1) || 0}%
                </div>
                <div className="metric-change positive">+5.2% improvement</div>
              </div>
              
              <div className="metric-card">
                <h4>Study Streak</h4>
                <div className="metric-value">
                  {user?.study_streak || 0} days
                </div>
                <div className="metric-change neutral">Current streak</div>
              </div>
            </div>
            
            {renderSubjectBreakdown()}
            {renderStudyHeatmap()}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-tab">
            {renderPerformanceChart()}
            <div className="performance-details">
              <div className="strengths-weaknesses">
                <div className="strengths">
                  <h4>Strengths</h4>
                  <ul>
                    <li>Consistent daily practice</li>
                    <li>Strong in visual learning</li>
                    <li>Good at multiple choice questions</li>
                  </ul>
                </div>
                <div className="weaknesses">
                  <h4>Areas for Improvement</h4>
                  <ul>
                    <li>Essay-type questions</li>
                    <li>Time management in quizzes</li>
                    <li>Complex problem solving</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-tab">
            {renderPredictions()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;