import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Result.css';

const Result = ({ scoreData, onReviewAnswers }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const navigate = useNavigate();

  // Prevent Navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Some browsers override this message
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Score Animation
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
    setShowDetails((prev) => !prev);
  }, []);

  if (!scoreData) return null;

  // Circular Progress Bar Calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (animatedScore / scoreData.totalScore));

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="completion-check">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} className="check-circle" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
            <path d="M30,50 l20,20 l40,-40" className="check-mark" strokeLinecap="round" />
          </svg>
        </div>
        <h2>Your Score: {animatedScore} / {scoreData.totalScore}</h2>
      </div>

      

      {showDetails && (
        <div className="score-details">
          <p>Correct: {scoreData.correctAnswers}</p>
          <p>Incorrect: {scoreData.wrongAnswers}</p>
          <p>Total Questions: {scoreData.totalQuestions}</p>
        </div>
      )}
    </div>
  );
};

export default Result;
