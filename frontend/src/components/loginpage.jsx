import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data); // Debugging response

      if (response.ok && data.student) {
        console.log("✅ Storing Student Data:", data.student);
        sessionStorage.setItem("student", JSON.stringify(data.student));

        // Ensure session storage is updated before navigating
        setTimeout(() => {
          navigate("/instructions");
        }, 100); // Small delay to ensure storage is updated
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Server error:", err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Student Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Roll Number (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};
