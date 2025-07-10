import React, { useState, useEffect } from 'react';

const SkillScan = () => {
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'Mathematics Foundation',
      description: 'Assess your core math skills',
      duration: '15 minutes',
      questions: 20,
      difficulty: 'Adaptive',
      status: 'available',
      icon: '📊'
    },
    {
      id: 2,
      title: 'Science Fundamentals',
      description: 'Physics, Chemistry, Biology basics',
      duration: '20 minutes',
      questions: 25,
      difficulty: 'Adaptive',
      status: 'available',
      icon: '🔬'
    },
    {
      id: 3,
      title: 'Programming Logic',
      description: 'Algorithmic thinking and problem solving',
      duration: '25 minutes',
      questions: 15,
      difficulty: 'Adaptive',
      status: 'available',
      icon: '💻'
    },
    {
      id: 4,
      title: 'Critical Thinking',
      description: 'Logical reasoning and analysis',
      duration: '18 minutes',
      questions: 22,
      difficulty: 'Adaptive',
      status: 'completed',
      score: 85,
      icon: '🧠'
    }
  ]);

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const startAssessment = (assessment) => {
    setIsStarting(true);
    // Simulate starting delay
    setTimeout(() => {
      setSelectedAssessment(assessment);
      setIsStarting(false);
    }, 2000);
  };

  const ScanResult = ({ assessment }) => (
    <div className="scan-result">
      <div className="result-header">
        <div className="result-icon">{assessment.icon}</div>
        <div>
          <h3>{assessment.title}</h3>
          <p>Assessment Complete</p>
        </div>
        <div className="result-score">
          <div className="score-value">{assessment.score}%</div>
          <div className="score-label">Score</div>
        </div>
      </div>
      
      <div className="result-analysis">
        <h4>Skill Analysis</h4>
        <div className="skill-bars">
          <div className="skill-item">
            <span className="skill-name">Core Concepts</span>
            <div className="skill-bar">
              <div className="skill-fill" style={{width: '90%'}}></div>
            </div>
            <span className="skill-score">90%</span>
          </div>
          <div className="skill-item">
            <span className="skill-name">Problem Solving</span>
            <div className="skill-bar">
              <div className="skill-fill" style={{width: '85%'}}></div>
            </div>
            <span className="skill-score">85%</span>
          </div>
          <div className="skill-item">
            <span className="skill-name">Application</span>
            <div className="skill-bar">
              <div className="skill-fill" style={{width: '78%'}}></div>
            </div>
            <span className="skill-score">78%</span>
          </div>
        </div>
      </div>

      <div className="recommendations">
        <h4>Recommendations</h4>
        <ul>
          <li>Focus on practical application exercises</li>
          <li>Practice advanced problem-solving techniques</li>
          <li>Review intermediate concepts for better foundation</li>
        </ul>
      </div>
    </div>
  );

  if (isStarting) {
    return (
      <div className="skillscan-loading">
        <div className="loading-animation">
          <div className="scan-icon">🔍</div>
          <h2>Initializing SkillScan™</h2>
          <p>Preparing adaptive assessment...</p>
          <div className="loading-bar">
            <div className="loading-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAssessment) {
    return (
      <div className="skillscan-assessment">
        <div className="assessment-header">
          <button 
            className="btn btn-ghost"
            onClick={() => setSelectedAssessment(null)}
          >
            ← Back to SkillScan™
          </button>
        </div>
        <ScanResult assessment={selectedAssessment} />
      </div>
    );
  }

  return (
    <div className="skillscan">
      <div className="skillscan-header">
        <div className="skillscan-icon">🔍</div>
        <div>
          <h1 className="skillscan-title">SkillScan™</h1>
          <p className="skillscan-subtitle">Adaptive assessment system</p>
        </div>
      </div>

      <div className="skillscan-intro">
        <div className="intro-card starguide-card">
          <h3>How SkillScan™ Works</h3>
          <p>Our adaptive assessment system dynamically adjusts question difficulty based on your responses, providing accurate skill measurement in minimal time.</p>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <h4>Adaptive</h4>
                <p>Questions adjust to your level</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h4>Precise</h4>
                <p>Accurate skill measurement</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">
                <h4>Targeted</h4>
                <p>Identifies knowledge gaps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="assessments-grid">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="assessment-card starguide-card">
            <div className="assessment-header">
              <div className="assessment-icon">{assessment.icon}</div>
              <div>
                <h3 className="assessment-title">{assessment.title}</h3>
                <p className="assessment-description">{assessment.description}</p>
              </div>
              {assessment.status === 'completed' && (
                <div className="completion-badge">
                  ✓ {assessment.score}%
                </div>
              )}
            </div>

            <div className="assessment-details">
              <div className="detail-item">
                <span className="detail-icon">⏱️</span>
                <span className="detail-text">{assessment.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">❓</span>
                <span className="detail-text">{assessment.questions} questions</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📈</span>
                <span className="detail-text">{assessment.difficulty}</span>
              </div>
            </div>

            <div className="assessment-actions">
              {assessment.status === 'available' ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => startAssessment(assessment)}
                >
                  Start SkillScan™
                </button>
              ) : (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  View Results
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillScan;