import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./instructions.css";

export const InstructionsPage = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const storedStudent = sessionStorage.getItem("student");
    console.log("Retrieved Student Data:", storedStudent); // 🔍 Debugging

    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      navigate("/login"); // Redirect if no student data
    }
  }, [navigate]);

  return (
    <div className="instructions-container">
      <main className="instructions-content">
        <h2>GENERAL INSTRUCTIONS</h2>

        {student && <h3>Welcome, {student.Name}!</h3>}

        <p className="instructions-note">Please read the instructions carefully before starting the exam.</p>

        <ol className="instructions-list">
          <li>Total duration of Quiz - 180 minutes.</li>
          <li>The clock will be set at the server and the countdown timer at the top will display the remaining time.</li>
          <li>Once the time is over, the exam will be auto-submitted.</li>
          <li>There are multiple-choice questions (MCQs). Each question has four options, and only one is correct.</li>
          <li>Each correct answer carries +4 marks, and each incorrect answer deducts 1 mark.</li>
          <li>Unattempted questions will not have any negative marking.</li>
          <li>Make sure your internet connection is stable. If you get disconnected, try reloading the page and logging in again.</li>
          <li>Do not refresh or close the tab once the quiz has started, as this may lead to automatic submission.</li>
          <li>Use only the navigation buttons provided on the screen. Avoid using the browser’s back or forward buttons.</li>
          <li>Any attempt to switch tabs or open another window may result in disqualification.</li>
          <li>Once you click the ‘Submit’ button, you will not be able to make any changes.</li>
          <li>Ensure that you are in a quiet place and free from distractions before starting the quiz.</li>
          <li>In case of any issues, contact the administrator immediately.</li>
        </ol>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="instructions-checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <label htmlFor="instructions-checkbox">
            I have read and understood the instructions.
          </label>
        </div>

        <div className="proceed-button-container">
          <a href="/exam">
            <button className="proceed-button" disabled={!isChecked}>
              Proceed
            </button>
          </a>
        </div>
      </main>
    </div>
  );
};
