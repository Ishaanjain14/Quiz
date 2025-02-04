import React, { useState, useEffect } from "react";
import "./exam.css"
export const ExamInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [attempted, setAttempted] = useState([]);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(60 * 60); // Assuming 1-hour timer for the exam
  const [markedForReview, setMarkedForReview] = useState([]);

  // Save exam state to localStorage
  useEffect(() => {
    localStorage.setItem("examState", JSON.stringify({
      selectedSubject,
      currentQuestionIndex,
      selectedOption,
      attempted,
      score,
      markedForReview
    }));
  }, [selectedSubject, currentQuestionIndex, selectedOption, attempted, score, markedForReview]);

  // Load exam state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("examState");
    if (savedState) {
      const state = JSON.parse(savedState);
      setSelectedSubject(state.selectedSubject);
      setCurrentQuestionIndex(state.currentQuestionIndex);
      setSelectedOption(state.selectedOption);
      setAttempted(state.attempted);
      setScore(state.score);
      setMarkedForReview(state.markedForReview);
    }
  }, []);

  // Timer countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1);
      } else {
        clearInterval(interval);
        setSubmitted(true); // Automatically submit when time runs out
        calculateScore();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Disable right-click, F5 refresh, and page unload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleKeyDown = (event) => {
      if (event.key === 'F5') {
        event.preventDefault();
      }
    };

    const handleRightClick = (event) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleRightClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleRightClick);
    };
  }, []);

  // Fetching questions and setting them
  useEffect(() => {
    fetch("/questions.json")
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  const filteredQuestions = questions.filter((q) => q.subject === selectedSubject);

  const handleOptionChange = (option) => {
    setSelectedOption((prev) => ({
      ...prev,
      [`${selectedSubject}-${currentQuestionIndex}`]: option,
    }));

    if (!attempted.includes(`${selectedSubject}-${currentQuestionIndex}`)) {
      setAttempted([...attempted, `${selectedSubject}-${currentQuestionIndex}`]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSaveAndNext = () => {
    if (!attempted.includes(`${selectedSubject}-${currentQuestionIndex}`)) {
      setAttempted([...attempted, `${selectedSubject}-${currentQuestionIndex}`]);
    }
    handleNext();
  };

  const handleSaveAndMarkForReview = () => {
    if (!attempted.includes(`${selectedSubject}-${currentQuestionIndex}`)) {
      setAttempted([...attempted, `${selectedSubject}-${currentQuestionIndex}`]);
    }
    setMarkedForReview((prev) => [...prev, `${selectedSubject}-${currentQuestionIndex}`]);
  };

  const calculateScore = () => {
    let totalScore = 0;
    filteredQuestions.forEach((question, index) => {
      const selectedAnswer = selectedOption[`${selectedSubject}-${index}`];
      if (selectedAnswer === question.correctAnswer) {
        totalScore += question.marks;
      }
    });
    setScore(totalScore);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateScore();
    setSubmitted(true);
    setSelectedOption({});
    setAttempted([]);
    setMarkedForReview([]);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  if (filteredQuestions.length === 0) return <h2>Loading questions...</h2>;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="exam-container">

      <div className="exam-topbar">
        <div className="subject-buttons">
          {["Physics", "Chemistry", "Mathematics"].map((subject) => (
            <button
              key={subject}
              className={`subject-btn ${selectedSubject === subject ? "active" : ""}`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
        <div className="timer">
          Time Remaining: {Math.floor(timer / 60)}:{timer % 60}
        </div>
      </div>

      <div className="exam-content">
        {!submitted ? (
          <>
            <div className="question-box">
              <h2>
                Question {currentQuestionIndex + 1} ({selectedSubject}): {currentQuestion.marks} Marks
              </h2>
              <p>{currentQuestion.question}</p>
              <div className="options">
                {currentQuestion.options.map((option, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={selectedOption[`${selectedSubject}-${currentQuestionIndex}`] === option}
                      onChange={() => handleOptionChange(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="navigation">
              <button className="nav-btn" onClick={handlePrev} disabled={currentQuestionIndex === 0}>BACK</button>
              <button className="save-and-next-btn" onClick={handleSaveAndNext}>SAVE & NEXT</button>
              <button className="save-and-mark-btn" onClick={handleSaveAndMarkForReview}>SAVE & MARK FOR REVIEW</button>
              <button className="submit-btn" onClick={handleSubmit}>SUBMIT</button>
            </div>
          </>
        ) : (
          <div className="score-display">
            <h3>Your Final Score: {score} / {filteredQuestions.reduce((acc, q) => acc + q.marks, 0)}</h3>
            <p>Thank you for taking the exam. You have been logged out.</p>
          </div>
        )}
      </div>

      <div className="question-palette">
        {filteredQuestions.map((_, index) => (
          <button
            key={index}
            className={`question-num ${attempted.includes(`${selectedSubject}-${index}`) ? "attempted" : ""} ${markedForReview.includes(`${selectedSubject}-${index}`) ? "marked-for-review" : ""}`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
