import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { InstructionsPage } from "./components/Instructions";
import { ExamInterface } from "./components/ExamInterface";
import { LoginPage } from "./components/loginpage";
import { UploadExcel } from "./components/UploadExcel";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLoginPage } from "./components/adminLogin";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
function App() {
  useEffect(() => {
    const enableFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.error("Error enabling fullscreen:", err);
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        enableFullscreen();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" || event.key === "F11") {
        event.preventDefault();
        enableFullscreen();
      }
    };

    enableFullscreen();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/instructions"
          element={
            <ProtectedRoute>
              <InstructionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam"
          element={
            <ProtectedRoute>
              <ExamInterface />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/upload"
          element={
            <AdminProtectedRoute>
              <UploadExcel />
            </AdminProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
