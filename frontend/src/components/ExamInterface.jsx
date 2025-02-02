import React, { useState } from "react";
// import "./ExamInterface.css";

export const ExamInterface = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="exam-container">
      <header className="exam-header">
        <h1>NATIONAL TESTING AGENCY</h1>
        <p className="exam-subtitle">Excellence in Assessment</p>
      </header>

      <div className="exam-topbar">
        <div className="subject-buttons">
          <button className="subject-btn">PHYSICS</button>
          <button className="subject-btn">CHEMISTRY</button>
          <button className="subject-btn">MATHEMATICS</button>
        </div>
        <button className="download-btn">⬇ DOWNLOAD</button>
      </div>

      <div className="exam-content">
        <div className="question-box">
          <h2>Question 1:</h2>
          <p>
            The characteristic distance at which quantum gravitational effects
            are significant, the Planck length, can be determined from a
            suitable combination of the fundamental physical constants G, ℏ, and
            c. Which of the following correctly gives the Planck length?
          </p>
          <div className="options">
            <label>
              <input
                type="radio"
                name="option"
                value="1"
                checked={selectedOption === "1"}
                onChange={() => handleOptionChange("1")}
              />
              G ℏ² c³
            </label>
            <label>
              <input
                type="radio"
                name="option"
                value="2"
                checked={selectedOption === "2"}
                onChange={() => handleOptionChange("2")}
              />
              G² ℏ c
            </label>
          </div>
        </div>

        <div className="question-controls">
          <button className="action-btn save-next">SAVE & NEXT</button>
          <button className="action-btn mark-review">SAVE & MARK FOR REVIEW</button>
          <button className="action-btn clear-response">CLEAR RESPONSE</button>
          <button className="action-btn mark-next">MARK FOR REVIEW & NEXT</button>
        </div>

        <div className="navigation">
          <button className="nav-btn">⏪ BACK</button>
          <button className="nav-btn">NEXT ⏩</button>
          <button className="submit-btn">SUBMIT</button>
        </div>
      </div>

      <div className="question-palette">
        {[...Array(64)].map((_, index) => (
          <button key={index} className="question-num">
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};