import React, { useState, useEffect } from "react";

export const ExamInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [attempted, setAttempted] = useState([]);

  useEffect(() => {
    fetch("/questions.json") // Fetch questions from public folder
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  const filteredQuestions = questions.filter((q) => q.subject === selectedSubject);

  useEffect(() => {
    setCurrentQuestionIndex(0); // Reset question index when subject changes
  }, [selectedSubject]);

  const handleOptionChange = (option) => {
    setSelectedOption((prev) => ({
      ...prev,
      [`${selectedSubject}-${currentQuestionIndex}`]: option,
    }));

    if (!attempted.includes(`${selectedSubject}-${currentQuestionIndex}`)) {
      setAttempted([...attempted, `${selectedSubject}-${currentQuestionIndex}`]); // Mark as attempted
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

  if (filteredQuestions.length === 0) return <h2>Loading questions...</h2>;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <header className="exam-header">
        <h1>NATIONAL TESTING AGENCY</h1>
        <p className="exam-subtitle">Excellence in Assessment</p>
      </header>

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
        <button className="download-btn">⬇ DOWNLOAD</button>
      </div>

      <div className="exam-content">
        <div className="question-box">
          <h2>Question {currentQuestionIndex + 1} ({selectedSubject}):</h2>
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

        <div className="question-controls">
          <button className="action-btn save-next" onClick={handleNext}>SAVE & NEXT</button>
          <button className="action-btn mark-review">SAVE & MARK FOR REVIEW</button>
          <button className="action-btn clear-response" onClick={() => handleOptionChange(null)}>CLEAR RESPONSE</button>
          <button className="action-btn mark-next">MARK FOR REVIEW & NEXT</button>
        </div>

        <div className="navigation">
          <button className="nav-btn" onClick={handlePrev} disabled={currentQuestionIndex === 0}>⏪ BACK</button>
          <button className="nav-btn" onClick={handleNext} disabled={currentQuestionIndex === filteredQuestions.length - 1}>NEXT ⏩</button>
          <button className="submit-btn">SUBMIT</button>
        </div>
      </div>

      <div className="question-palette">
        {filteredQuestions.map((_, index) => (
          <button
            key={index}
            className={`question-num ${attempted.includes(`${selectedSubject}-${index}`) ? "attempted" : ""}`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
