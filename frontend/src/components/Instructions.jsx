import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./instructions.css";

export const InstructionsPage = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

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

        <p className="instructions-note">Please read the instructions carefully</p>

        <ol className="instructions-list">
          <li>Total duration of Quiz - 180 minutes.</li>
          <li>The clock will be set at the server...</li>
        </ol>

        <div className="proceed-button-container">
          <a href="/exam"><button className="proceed-button">Proceed</button></a>
        </div>
      </main>
    </div>
  );
};
