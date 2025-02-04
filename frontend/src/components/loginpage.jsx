import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export const LoginPage = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form submission
    navigate("/instructions"); // Navigate to instructions page
  };

  return (
    <div className="login-container">

      {/* Login Form */}
      <div className="login-box">
        <h2>Login (Demo)</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Username</label>
            <input type="text" required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" required />
          </div>
          <button type="submit" className="login-btn">LOGIN</button>
        </form>
        <p className="login-message">Click Login To Proceed!</p>
      </div>
    </div>
  );
};
