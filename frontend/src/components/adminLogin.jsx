import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Ensure the CSS file is linked properly

export const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem("isAuthenticated")) {
      navigate("/upload");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (email === "admin@example.com" && password === "admin123") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/upload");
    } else {
      setError("Invalid email or password");
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
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
            <label>Password</label>
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
