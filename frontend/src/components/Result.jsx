import { useEffect, useState, useCallback } from 'react';
import './Result.css';

const Result = ({ scoreData, onReviewAnswers }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animation for score count-up using requestAnimationFrame
  useEffect(() => {
    if (scoreData) {
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        setAnimatedScore(Math.round(progress * scoreData.totalScore));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [scoreData]);

  const handleToggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  if (!scoreData) return null;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (animatedScore / 100));

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="completion-check">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="check-circle" />
            <path 
              d="M30,50 l20,20 l40,-40" 
              className="check-mark"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1>Test Submitted Successfully!</h1>
        <p className="test-completion-text">
          You've completed the {scoreData.examName}. Here's your performance breakdown.
        </p>
      </div>

      <div className="score-summary">
          <div className="score-details">
            <h3>Total Score</h3>
            <p>{scoreData.correctAnswers} / {scoreData.totalQuestions} Correct</p>
            <p>Percentile: {scoreData.percentile}%</p>
          </div>
        </div>

        <button className="toggle-details" onClick={handleToggleDetails}>
          {showDetails ? 'Hide Details' : 'Show Section-wise Breakdown'}
        </button>

        {showDetails && (
          <div className="section-breakdown">
            <h2>Section-wise Performance</h2>
            <div className="sections-grid">
              {scoreData.sections.map((section, index) => (
                <div key={index} className="section-card">
                  <h3>{section.name}</h3>
                  <div className="section-stats">
                    <div className="stat-item">
                      <span>Attempted</span>
                      <strong>{section.attempted}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Correct</span>
                      <strong>{section.correct}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Total</span>
                      <strong>{section.total}</strong>
                    </div>
                  </div>
                  <div className="section-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${(section.attempted / section.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
};

export default Result;
