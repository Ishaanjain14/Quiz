import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./exam.css";

export const ExamInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [attempted, setAttempted] = useState([]);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(60 * 60);
  const [testSchedule, setTestSchedule] = useState(null);
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("student");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      alert("Student details missing! Redirecting to login.");
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("http://localhost:3002/get-schedule");
        if (!response.ok) throw new Error("Failed to fetch schedule");
        const data = await response.json();
        setTestSchedule(data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/questions");
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
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
    if (!student || !testSchedule) return;

    const now = new Date();
    const start = new Date(`${testSchedule.date}T${testSchedule.startTime}`);
    const end = new Date(`${testSchedule.date}T${testSchedule.endTime}`);

    if (now >= end) {
      handleSubmit();
      return;
    }

    if (now < start) {
      alert("Test has not started yet");
      navigate("/instructions");
      return;
    }

    const initialRemaining = Math.floor((end - now) / 1000);
    setTimer(initialRemaining > 0 ? initialRemaining : 0);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const currentTime = new Date();
        const newRemaining = Math.floor((end - currentTime) / 1000);
        
        if (newRemaining <= 0) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [student, testSchedule, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!submitted) {
        event.preventDefault();
        event.returnValue = "Are you sure you want to leave? Your progress will be lost.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submitted]);

  const filteredQuestions = questions.filter((q) => q.subject.toLowerCase() === selectedSubject.toLowerCase());

  const handleOptionChange = (option) => {
    if (!filteredQuestions[currentQuestionIndex]) return;

    const key = filteredQuestions[currentQuestionIndex].id;

    setSelectedOption((prev) => ({
      ...prev,
      [key]: option,
    }));

    if (!attempted.includes(key)) {
      setAttempted([...attempted, key]);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitted || !student) return;

    setSubmitted(true);
    sessionStorage.setItem(`examSubmitted_${student["Roll Number"]}`, "true");
    clearInterval(timerRef.current);

    let totalScore = 0;
    questions.forEach((question) => {
      const key = question.id;
      if (selectedOption[key] === question.correctAnswer) {
        totalScore += question.marks || 1;
      }
    });
    setScore(totalScore);

    const responsePayload = {
      studentName: student.Name,
      rollNumber: student["Roll Number"],
      responses: selectedOption,
      score: totalScore
    };

    try {
      const response = await fetch("http://localhost:3002/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responsePayload),
      });
      if (!response.ok) throw new Error("Failed to submit exam");
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  }, [submitted, student, questions, selectedOption]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!filteredQuestions.length) return <h2>Loading questions...</h2>;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <div className="exam-left">
        <div className="exam-topbar">
          <div className="student-info">
            {student && (
              <h3>
                {student.Name} | Roll No: {student["Roll Number"]}
              </h3>
            )}
          </div>

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
          
          <div className="timer">Time Left: {formatTime(timer)}</div>
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
                      name={`question-${currentQuestion.id}`}
                      checked={selectedOption[currentQuestion.id] === option}
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
        <button onClick={handleSubmit} disabled={submitted}>Submit</button>
      </div>
      <div className="exam-right">
        <h3>Questions</h3>
        <div className="question-nav">
          {filteredQuestions.map((q, index) => (
            <button
              key={q.id}
              className={`question-btn ${currentQuestionIndex === index ? "active" : ""} ${attempted.includes(q.id) ? "attempted" : ""}`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};