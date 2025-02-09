import { useState, useEffect, useRef } from "react";
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
  const [timer, setTimer] = useState(60 * 60);

  const [student, setStudent] = useState(null);
  const timerRef = useRef(null);

  // ✅ Fetch student details from sessionStorage
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
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/questions");
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
    if (!student) return;

    const savedTimer = sessionStorage.getItem(`examTimer_${student["Roll Number"]}`);
    const isSubmitted = sessionStorage.getItem(`examSubmitted_${student["Roll Number"]}`) === "true";

    if (isSubmitted) {
      setSubmitted(true);
      setTimer(0);
      return;
    }

    setTimer(savedTimer ? parseInt(savedTimer, 10) : 60 * 60);

    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          const newTime = prevTimer - 1;
          sessionStorage.setItem(`examTimer_${student["Roll Number"]}`, newTime);
          return newTime;
        } else {
          clearInterval(timerRef.current);
          alert("Time is up! Please submit your exam.");
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [student]);

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

  const handleSubmit = async () => {
    if (submitted || !student) return;

    setSubmitted(true);
    sessionStorage.setItem(`examSubmitted_${student["Roll Number"]}`, "true");
    clearInterval(timerRef.current);

    calculateScore();

    const responsePayload = {
      studentName: student.Name,
      rollNumber: student["Roll Number"],
      responses: selectedOption,
    };

    try {
      const response = await fetch("http://localhost:3002/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responsePayload),
      });

      const data = await response.json();
      setScore(data.score);
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((question) => {
      const key = question.id;
      if (selectedOption[key] === question.correctAnswer) {
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
  );
};
