import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./exam.css";

const socket = io("http://localhost:3002");

export const ExamInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [attempted, setAttempted] = useState([]);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(() => {
    const savedTimer = localStorage.getItem("examTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 60 * 60;
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/questions");
        const data = await response.json();
        console.log("Fetched Questions:", data);
        if (data.length > 0) {
          setQuestions(data);
          const uniqueSubjects = [...new Set(data.map(q => q.subject))];
          setSubjects(uniqueSubjects);
          setSelectedSubject(uniqueSubjects[0]);
        } else {
          console.error("No questions received!");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          const newTime = prevTimer - 1;
          localStorage.setItem("examTimer", newTime);
          return newTime;
        } else {
          clearInterval(interval);
          setSubmitted(true);
          calculateScore();
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredQuestions = questions.filter((q) => q.subject.toLowerCase() === selectedSubject.toLowerCase());

  const handleOptionChange = (option) => {
    setSelectedOption((prev) => ({
      ...prev,
      [`${selectedSubject}-${currentQuestionIndex}`]: option,
    }));
    if (!attempted.includes(`${selectedSubject}-${currentQuestionIndex}`)) {
      setAttempted([...attempted, `${selectedSubject}-${currentQuestionIndex}`]);
    }
  };

  const handleSubmit = () => {
    calculateScore();
    setSubmitted(true);
  };

  const calculateScore = () => {
    let totalScore = 0;
    filteredQuestions.forEach((question, index) => {
      if (selectedOption[`${selectedSubject}-${index}`] === question.correctAnswer) {
        totalScore += question.marks || 1;
      }
    });
    setScore(totalScore);
  };

  if (!filteredQuestions.length) return <h2>Loading questions...</h2>;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <div className="exam-topbar">
        <div className="subject-buttons">
          {subjects.map((subject) => (
            <button
              key={subject}
              className={selectedSubject === subject ? "active" : ""}
              onClick={() => {
                setSelectedSubject(subject);
                setCurrentQuestionIndex(0);
              }}
            >
              {subject}
            </button>
          ))}
        </div>
        <div className="timer">Time Left: {Math.floor(timer / 60)}:{timer % 60}</div>
      </div>

      {!submitted ? (
        currentQuestion ? (
          <div className="question-box">
            <h2>Question {currentQuestionIndex + 1}: {currentQuestion.marks || 1} Marks</h2>
            <p>{currentQuestion.question}</p>

            {Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    checked={selectedOption[`${selectedSubject}-${currentQuestionIndex}`] === option}
                    onChange={() => handleOptionChange(option)}
                  />
                  {option}
                </label>
              ))
            ) : (
              <p>No options available</p>
            )}
          </div>
        ) : (
          <p>Loading current question...</p>
        )
      ) : (
        <h3>Your Final Score: {score}</h3>
      )}

      <button onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>
        Prev
      </button>
      <button onClick={() => setCurrentQuestionIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))} disabled={currentQuestionIndex >= filteredQuestions.length - 1}>
        Next
      </button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};
