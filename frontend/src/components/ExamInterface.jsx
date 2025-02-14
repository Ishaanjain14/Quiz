import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Result from "./Result";
import "./exam.css";

export const ExamInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [attempted, setAttempted] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [testSchedule, setTestSchedule] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const timerRef = useRef(null);

  // Student session management
  useEffect(() => {
    const storedStudent = sessionStorage.getItem("student");
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      alert("Student details missing! Redirecting to login.");
      window.location.href = "/login";
    }
  }, []);

  // Fetch test schedule
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

  // Fetch questions
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
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, []);

  // Timer and schedule management
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

  // Prevent window close during test
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
  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (submitted || !student) return;

    setSubmitted(true);
    sessionStorage.setItem(`examSubmitted_${student["Roll Number"]}`, "true");
    clearInterval(timerRef.current);

    // Calculate scores
    let totalScore = 0;
    const correctAnswers = {};
    const sectionDetails = {};

    questions.forEach((question) => {
      const key = question.id;
      const isCorrect = selectedOption[key] === question.correctAnswer;
      const marks = question.marks || 1;
      
      if (isCorrect) {
        totalScore += marks;
        correctAnswers[key] = true;
      }

      // Section breakdown
      if (!sectionDetails[question.subject]) {
        sectionDetails[question.subject] = {
          attempted: 0,
          correct: 0,
          total: 0
        };
      }

      sectionDetails[question.subject].total++;
      if (selectedOption[key] !== undefined) {
        sectionDetails[question.subject].attempted++;
        if (isCorrect) sectionDetails[question.subject].correct++;
      }
    });

    // Prepare result data
    const totalPossible = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const sections = Object.entries(sectionDetails).map(([name, data]) => ({
      name,
      ...data
    }));

    setScoreData({
      examName: "Final Examination",
      totalScore: Math.round((totalScore / totalPossible) * 100),
      correctAnswers: Object.keys(correctAnswers).length,
      totalQuestions: questions.length,
      sections,
      percentile: 75 // Should come from server
    });

    setShowResult(true);

    // Submit to backend
    try {
      await fetch("http://localhost:3002/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.Name,
          rollNumber: student["Roll Number"],
          responses: selectedOption,
          score: totalScore,
          sectionDetails
        }),
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }, [submitted, student, questions, selectedOption]);

  const handleReviewAnswers = () => {
    // Implement review functionality
    console.log("Reviewing answers...");
  };

  const filteredQuestions = questions.filter(q => 
    q.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!questions.length) return <div className="loading">Loading questions...</div>;

  return (
    <div className="exam-container">
      {showResult ? (
        <Result 
          scoreData={scoreData}
          onReviewAnswers={handleReviewAnswers}
        />
      ) : (
        <>
          <div className="exam-left">
            <div className="exam-topbar">
              <div className="student-info">
                {student && (
                  <h2>
                    {student.Name} (Roll No: {student["Roll Number"]})
                  </h2>
                )}
              </div>

              <div className="subject-selector">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    className={`subject-btn ${selectedSubject === subject ? "active" : ""}`}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setCurrentQuestionIndex(0);
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="timer">
                <span>⏳ Time Remaining:</span>
                <strong>{formatTime(timer)}</strong>
              </div>
            </div>

            {filteredQuestions[currentQuestionIndex] && (
              <div className="question-container">
                <div className="question-header">
                  <h3>
                    Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                    <span>({filteredQuestions[currentQuestionIndex].marks || 1} marks)</span>
                  </h3>
                </div>

                <div className="question-content">
                  <p>{filteredQuestions[currentQuestionIndex].question}</p>
                  
                  <div className="options-grid">
                    {filteredQuestions[currentQuestionIndex].options?.map((option, index) => (
                      <label key={index} className="option-label">
                        <input
                          type="radio"
                          name={`question-${filteredQuestions[currentQuestionIndex].id}`}
                          checked={selectedOption[filteredQuestions[currentQuestionIndex].id] === option}
                          onChange={() => handleOptionChange(option)}
                        />
                        <span className="option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="navigation-buttons">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex >= filteredQuestions.length - 1}
                  >
                    Next
                  </button>
                  <button 
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={submitted}
                  >
                    {submitted ? "Submitting..." : "Submit Exam"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="exam-right">
            <div className="question-progress">
              <h3>Question Navigator</h3>
              <div className="question-grid">
                {filteredQuestions.map((q, index) => (
                  <button
                    key={q.id}
                    className={`question-btn 
                      ${currentQuestionIndex === index ? "active" : ""} 
                      ${attempted.includes(q.id) ? "attempted" : ""}`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};